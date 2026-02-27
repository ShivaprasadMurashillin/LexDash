/**
 * Clients CRUD Routes  –  /api/clients
 */
const express              = require('express');
const router               = express.Router();
const Client               = require('../models/Client');
const Case                 = require('../models/Case');
const Document             = require('../models/Document');
const Task                 = require('../models/Task');
const { createNotification } = require('../utils/notificationHelper');
const escapeRegex          = require('../utils/escapeRegex');

const who = (req) => req.headers['x-user-name'] || 'An attorney';

// ── GET /api/clients ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const type   = req.query.type   || '';

    const query = {};

    if (search) {
      const safe = escapeRegex(search);
      query.$or = [
        { name:    { $regex: safe, $options: 'i' } },
        { email:   { $regex: safe, $options: 'i' } },
        { company: { $regex: safe, $options: 'i' } },
        { phone:   { $regex: safe, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (type)   query.type   = type;

    const total   = await Client.countDocuments(query);
    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: clients,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/clients/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, data: client });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/clients ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const client = await Client.create(req.body);
    await createNotification({ entity: 'Client', action: 'created', name: client.name, createdBy: who(req) });
    res.status(201).json({ success: true, data: client, message: 'Client created successfully' });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'A client with this email already exists' });
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PUT /api/clients/:id ──────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    await createNotification({ entity: 'Client', action: 'updated', name: client.name, createdBy: who(req) });
    res.json({ success: true, data: client, message: 'Client updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/clients/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    // Cascade: delete all cases (and their linked documents/tasks) belonging to this client
    const clientCases = await Case.find({ clientId: client._id }).select('_id');
    const caseIds = clientCases.map((c) => c._id);
    if (caseIds.length) {
      await Promise.all([
        Document.deleteMany({ caseId: { $in: caseIds } }),
        Task.deleteMany({ caseId: { $in: caseIds } }),
        Case.deleteMany({ clientId: client._id }),
      ]);
    }

    await createNotification({ entity: 'Client', action: 'deleted', name: client.name, createdBy: who(req) });
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
