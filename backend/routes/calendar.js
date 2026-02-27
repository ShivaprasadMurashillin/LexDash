/**
 * Calendar Events  –  GET /api/calendar?year=YYYY&month=MM
 * Returns all events (tasks, documents, cases) that fall within the month.
 */
const express  = require('express');
const router   = express.Router();
const Case     = require('../models/Case');
const Document = require('../models/Document');
const Task     = require('../models/Task');

router.get('/', async (req, res) => {
  try {
    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1; // 1-based

    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month,     1); // first day of NEXT month

    const [tasks, docs, cases] = await Promise.all([
      Task.find({ dueDate: { $gte: start, $lt: end } })
          .populate('caseId', 'caseNumber title')
          .select('title status priority dueDate caseId'),

      Document.find({ deadline: { $gte: start, $lt: end } })
              .populate('caseId', 'caseNumber title')
              .select('title type status deadline caseId'),

      Case.find({ $or: [
          { courtDate:  { $gte: start, $lt: end } },
          { filingDate: { $gte: start, $lt: end } },
        ]})
        .populate('clientId', 'name')
        .select('title caseNumber status courtDate filingDate clientId'),
    ]);

    const events = [
      ...tasks.map((t) => ({
        kind:  'task',
        id:    t._id,
        date:  t.dueDate,
        label: t.title,
        sub:   t.caseId ? `${t.caseId.caseNumber}` : '',
        status: t.status,
        priority: t.priority,
        caseId: t.caseId,
      })),
      ...docs.map((d) => ({
        kind:  'document',
        id:    d._id,
        date:  d.deadline,
        label: d.title,
        sub:   d.type,
        status: d.status,
        caseId: d.caseId,
      })),
      ...cases.flatMap((c) => {
        const evts = [];
        if (c.courtDate)  evts.push({ kind: 'court',  id: c._id, date: c.courtDate,  label: c.title, sub: 'Court Date',   status: c.status, caseId: c });
        if (c.filingDate) evts.push({ kind: 'filing', id: c._id, date: c.filingDate, label: c.title, sub: 'Filing Date',  status: c.status, caseId: c });
        return evts;
      }),
    ];

    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
