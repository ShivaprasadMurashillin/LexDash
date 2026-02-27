/**
 * Global Search  –  GET /api/search?q=...
 * Searches Cases, Clients, Documents and Tasks in parallel.
 */
const express  = require('express');
const router   = express.Router();
const Case     = require('../models/Case');
const Client   = require('../models/Client');
const Document = require('../models/Document');
const Task     = require('../models/Task');
const escapeRegex = require('../utils/escapeRegex');

router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ success: true, data: [] });

    const rx = { $regex: escapeRegex(q), $options: 'i' };

    const [cases, clients, docs, tasks] = await Promise.all([
      Case.find({ $or: [{ title: rx }, { caseNumber: rx }, { assignedAttorney: rx }] })
          .populate('clientId', 'name')
          .select('title caseNumber status type assignedAttorney')
          .limit(8),

      Client.find({ $or: [{ name: rx }, { email: rx }, { company: rx }] })
            .select('name email company phone')
            .limit(8),

      Document.find({ $or: [{ title: rx }, { type: rx }, { uploadedBy: rx }] })
              .populate('caseId', 'caseNumber title')
              .select('title type status deadline caseId')
              .limit(8),

      Task.find({ $or: [{ title: rx }, { description: rx }, { assignedTo: rx }] })
          .populate('caseId', 'caseNumber title')
          .select('title status priority dueDate assignedTo caseId')
          .limit(8),
    ]);

    const data = [
      ...cases.map((c)   => ({ kind: 'case',     id: c._id, label: `${c.caseNumber} – ${c.title}`,       sub: `${c.type} · ${c.status}`,           meta: c })),
      ...clients.map((c) => ({ kind: 'client',   id: c._id, label: c.name,                                sub: c.email || c.company || '',           meta: c })),
      ...docs.map((d)    => ({ kind: 'document', id: d._id, label: d.title,                               sub: `${d.type} · ${d.status}`,            meta: d })),
      ...tasks.map((t)   => ({ kind: 'task',     id: t._id, label: t.title,                               sub: `${t.priority} · ${t.status}`,        meta: t })),
    ];

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
