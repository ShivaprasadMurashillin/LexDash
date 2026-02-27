/**
 * Documents CRUD Routes  –  /api/documents
 */
const express              = require('express');
const router               = express.Router();
const path                 = require('path');
const fs                   = require('fs');
const Document             = require('../models/Document');
const { createNotification } = require('../utils/notificationHelper');
const escapeRegex          = require('../utils/escapeRegex');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

const who = (req) => req.headers['x-user-name'] || 'An attorney';

// ── GET /api/documents ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const type   = req.query.type   || '';
    const caseId = req.query.caseId || '';

    const query = {};

    if (search) {
      const safe = escapeRegex(search);
      query.$or = [
        { title:      { $regex: safe, $options: 'i' } },
        { uploadedBy: { $regex: safe, $options: 'i' } },
        { notes:      { $regex: safe, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (type)   query.type   = type;
    if (caseId) query.caseId = caseId;

    const total     = await Document.countDocuments(query);
    const documents = await Document.find(query)
      .populate('caseId', 'title caseNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: documents,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/documents/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate('caseId', 'title caseNumber');
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/documents ───────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const doc = await Document.create(req.body);
    const populated = await doc.populate('caseId', 'title caseNumber');
    await createNotification({ entity: 'Document', action: 'created', name: doc.title, createdBy: who(req) });
    res.status(201).json({ success: true, data: populated, message: 'Document created successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PUT /api/documents/:id ────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('caseId', 'title caseNumber');

    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    await createNotification({ entity: 'Document', action: 'updated', name: doc.title, createdBy: who(req) });
    res.json({ success: true, data: doc, message: 'Document updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/documents/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    // Delete the physical uploaded file if it exists
    if (doc.fileUrl) {
      try {
        const filename = doc.fileUrl.split('/').pop();
        // Prevent path traversal — only delete from uploads dir
        const safe = path.basename(filename);
        const filePath = path.join(UPLOADS_DIR, safe);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch { /* file may already be gone */ }
    }

    await createNotification({ entity: 'Document', action: 'deleted', name: doc.title, createdBy: who(req) });
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
