/**
 * Cases CRUD Routes  –  /api/cases
 */
const express              = require('express');
const router               = express.Router();
const Case                 = require('../models/Case');
const Client               = require('../models/Client');
const Document             = require('../models/Document');
const Task                 = require('../models/Task');
const { createNotification } = require('../utils/notificationHelper');
const escapeRegex          = require('../utils/escapeRegex');

const who = (req) => req.headers['x-user-name'] || 'An attorney';

// ── Helper: generate next case number ────────────────────────────────────────
async function generateCaseNumber() {
  const year  = new Date().getFullYear();
  const count = await Case.countDocuments();
  return `CASE-${year}-${String(count + 1).padStart(3, '0')}`;
}

// ── GET /api/cases ────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 10;
    const search   = req.query.search   || '';
    const status   = req.query.status   || '';
    const type     = req.query.type     || '';
    const priority = req.query.priority || '';

    const query = {};

    if (search) {
      const safe = escapeRegex(search);
      query.$or = [
        { title:            { $regex: safe, $options: 'i' } },
        { caseNumber:       { $regex: safe, $options: 'i' } },
        { assignedAttorney: { $regex: safe, $options: 'i' } },
        { description:      { $regex: safe, $options: 'i' } },
      ];
    }
    if (status)   query.status   = status;
    if (type)     query.type     = type;
    if (priority) query.priority = priority;

    const total = await Case.countDocuments(query);
    const cases = await Case.find(query)
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: cases,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/cases/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id).populate('clientId', 'name email phone');
    if (!caseItem) return res.status(404).json({ success: false, message: 'Case not found' });
    res.json({ success: true, data: caseItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/cases ───────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const caseNumber = await generateCaseNumber();
    const newCase    = await Case.create({ ...req.body, caseNumber });

    // Increment client's activeCases counter when case is Active
    if (req.body.clientId && req.body.status === 'Active') {
      await Client.findByIdAndUpdate(req.body.clientId, { $inc: { activeCases: 1 } });
    }

    const populated = await newCase.populate('clientId', 'name email');
    await createNotification({ entity: 'Case', action: 'created', name: newCase.title, createdBy: who(req) });
    res.status(201).json({ success: true, data: populated, message: 'Case created successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PUT /api/cases/:id ────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    // Fetch old case to detect status changes for activeCases sync
    const oldCase = await Case.findById(req.params.id);
    if (!oldCase) return res.status(404).json({ success: false, message: 'Case not found' });

    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('clientId', 'name email');

    // Sync activeCases counter when status changes
    if (oldCase.clientId && oldCase.status !== updated.status) {
      if (oldCase.status === 'Active' && updated.status !== 'Active') {
        await Client.findByIdAndUpdate(oldCase.clientId, { $inc: { activeCases: -1 } });
      } else if (oldCase.status !== 'Active' && updated.status === 'Active') {
        await Client.findByIdAndUpdate(oldCase.clientId, { $inc: { activeCases: 1 } });
      }
    }

    await createNotification({ entity: 'Case', action: 'updated', name: updated.title, createdBy: who(req) });
    res.json({ success: true, data: updated, message: 'Case updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/cases/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Case.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Case not found' });

    // Decrement client active case count if it was Active
    if (deleted.clientId && deleted.status === 'Active') {
      await Client.findByIdAndUpdate(deleted.clientId, { $inc: { activeCases: -1 } });
    }

    // Cascade delete linked documents and tasks
    await Promise.all([
      Document.deleteMany({ caseId: deleted._id }),
      Task.deleteMany({ caseId: deleted._id }),
    ]);

    await createNotification({ entity: 'Case', action: 'deleted', name: deleted.title, createdBy: who(req) });
    res.json({ success: true, message: 'Case deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
