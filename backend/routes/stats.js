/**
 * Stats Route  –  /api/stats
 * Returns aggregated dashboard metrics
 */
const express  = require('express');
const router   = express.Router();
const Case     = require('../models/Case');
const Document = require('../models/Document');
const Task     = require('../models/Task');
const Client   = require('../models/Client');

router.get('/', async (req, res) => {
  try {
    const now       = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // ── Basic counts ──────────────────────────────────────────────────────────
    const [totalCases, totalDocuments, totalClients, activeCases, pendingTasks, documentsFiled] =
      await Promise.all([
        Case.countDocuments(),
        Document.countDocuments(),
        Client.countDocuments(),
        Case.countDocuments({ status: 'Active' }),
        Task.countDocuments({ status: { $in: ['To Do', 'In Progress'] } }),
        Document.countDocuments({ status: 'Filed' }),
      ]);

    // ── Task completion rate ──────────────────────────────────────────────────
    const [totalTasks, completedTasks] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: 'Completed' }),
    ]);
    const taskCompletionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    // ── Case status distribution ──────────────────────────────────────────────
    const casesByStatusRaw = await Case.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const casesByStatus = casesByStatusRaw.map(i => ({ name: i._id, value: i.count }));

    // ── Cases by type ─────────────────────────────────────────────────────────
    const casesByTypeRaw = await Case.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const casesByType = casesByTypeRaw.map(i => ({ name: i._id, value: i.count }));

    // ── Recent cases (last 5) ─────────────────────────────────────────────────
    const recentCases = await Case.find()
      .populate('clientId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // ── Upcoming court dates (next 30 days) ───────────────────────────────────
    const upcomingDeadlines = await Case.find({
      courtDate: { $gte: now, $lte: nextMonth },
    })
      .populate('clientId', 'name')
      .sort({ courtDate: 1 })
      .limit(10);

    // ── Recent incomplete tasks (for progress widget) ─────────────────────────
    const recentTasks = await Task.find({ status: { $ne: 'Completed' } })
      .populate('caseId', 'title caseNumber')
      .sort({ dueDate: 1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        overview: {
          totalCases,
          activeCases,
          pendingTasks,
          documentsFiled,
          totalDocuments,
          totalClients,
          taskCompletionRate,
        },
        casesByStatus,
        casesByType,
        recentCases,
        upcomingDeadlines,
        recentTasks,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
