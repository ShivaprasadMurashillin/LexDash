/**
 * Analytics Route  –  /api/analytics
 * Returns advanced metrics for the Analytics page:
 *   - Monthly case intake trend (last 12 months)
 *   - Attorney workload distribution
 *   - Case outcome / success metrics
 *   - Document turnaround (avg days from Draft → Filed)
 *   - Client growth over time
 *   - Task velocity (completed per month)
 *   - Priority breakdown per attorney
 *   - Overdue task analysis
 */
const express  = require('express');
const router   = express.Router();
const Case     = require('../models/Case');
const Document = require('../models/Document');
const Task     = require('../models/Task');
const Client   = require('../models/Client');
const Billing  = require('../models/Billing');

// Month name helper
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

router.get('/', async (req, res) => {
  try {
    const now = new Date();

    // ── 1. Monthly Case Intake (last 12 months) ────────────────────────────
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const caseIntakeRaw = await Case.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Fill in missing months with 0
    const monthlyIntake = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const found = caseIntakeRaw.find((r) => r._id.year === y && r._id.month === m);
      monthlyIntake.push({
        month: `${MONTHS[m - 1]} ${y.toString().slice(-2)}`,
        cases: found ? found.count : 0,
      });
    }

    // ── 2. Attorney Workload ───────────────────────────────────────────────
    const workloadRaw = await Case.aggregate([
      { $match: { status: { $in: ['Active', 'Pending'] } } },
      { $group: { _id: '$assignedAttorney', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    const attorneyWorkload = workloadRaw
      .filter((w) => w._id)
      .map((w) => ({ name: w._id, cases: w.total }));

    // ── 3. Case Outcomes (success rate) ────────────────────────────────────
    const [totalClosed, totalActive, totalPending, totalOnHold] = await Promise.all([
      Case.countDocuments({ status: 'Closed' }),
      Case.countDocuments({ status: 'Active' }),
      Case.countDocuments({ status: 'Pending' }),
      Case.countDocuments({ status: 'On Hold' }),
    ]);
    const totalAll = totalClosed + totalActive + totalPending + totalOnHold;
    const caseOutcomes = {
      closed: totalClosed,
      active: totalActive,
      pending: totalPending,
      onHold: totalOnHold,
      total: totalAll,
      closureRate: totalAll > 0 ? Math.round((totalClosed / totalAll) * 100) : 0,
    };

    // ── 4. Task Velocity (completed per month, last 6 months) ──────────────
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const taskVelocityRaw = await Task.aggregate([
      { $match: { status: 'Completed', updatedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$updatedAt' }, month: { $month: '$updatedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const taskVelocity = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const found = taskVelocityRaw.find((r) => r._id.year === y && r._id.month === m);
      taskVelocity.push({
        month: `${MONTHS[m - 1]}`,
        completed: found ? found.count : 0,
      });
    }

    // ── 5. Document Status Pipeline ────────────────────────────────────────
    const docPipelineRaw = await Document.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const docPipeline = docPipelineRaw.map((d) => ({ name: d._id, value: d.count }));

    // ── 6. Client Growth (cumulative by month, last 12) ────────────────────
    const clientGrowthRaw = await Client.aggregate([
      { $match: { joinedDate: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$joinedDate' }, month: { $month: '$joinedDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const clientGrowth = [];
    let cumulative = await Client.countDocuments({ joinedDate: { $lt: twelveMonthsAgo } });
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const found = clientGrowthRaw.find((r) => r._id.year === y && r._id.month === m);
      cumulative += found ? found.count : 0;
      clientGrowth.push({
        month: `${MONTHS[m - 1]} ${y.toString().slice(-2)}`,
        clients: cumulative,
      });
    }

    // ── 7. Priority Distribution per Attorney ──────────────────────────────
    const priorityByAttorneyRaw = await Case.aggregate([
      { $match: { status: { $in: ['Active', 'Pending'] }, assignedAttorney: { $ne: null } } },
      { $group: { _id: { attorney: '$assignedAttorney', priority: '$priority' }, count: { $sum: 1 } } },
    ]);

    const priorityByAttorney = {};
    priorityByAttorneyRaw.forEach((r) => {
      const name = r._id.attorney;
      if (!priorityByAttorney[name]) priorityByAttorney[name] = { name, High: 0, Medium: 0, Low: 0 };
      priorityByAttorney[name][r._id.priority] = r.count;
    });
    const priorityBreakdown = Object.values(priorityByAttorney);

    // ── 8. Overdue Task Analysis ───────────────────────────────────────────
    const overdueTasks = await Task.countDocuments({
      status: { $in: ['To Do', 'In Progress', 'Overdue'] },
      dueDate: { $lt: now },
    });
    const totalActiveTasks = await Task.countDocuments({
      status: { $in: ['To Do', 'In Progress', 'Overdue'] },
    });

    // ── 9. Revenue by Practice Area (from real billing data) ──────────────
    const revenueByTypeRaw = await Billing.aggregate([
      { $match: { status: { $in: ['Paid', 'Sent', 'Overdue'] } } },
      { $lookup: { from: 'cases', localField: 'caseId', foreignField: '_id', as: 'case' } },
      { $unwind: '$case' },
      { $group: { _id: '$case.type', totalRevenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { totalRevenue: -1 } },
    ]);
    const revenueByType = revenueByTypeRaw.map((r) => ({
      type: r._id,
      cases: r.count,
      estimatedRevenue: r.totalRevenue,
    }));

    // ── 10. Billing Overview (totals & counts) ─────────────────────────────
    const billingOverviewRaw = await Billing.aggregate([
      {
        $group: {
          _id: null,
          totalBilled: { $sum: '$amount' },
          totalPaid: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, '$amount', 0] } },
          totalOutstanding: {
            $sum: { $cond: [{ $in: ['$status', ['Sent', 'Overdue']] }, '$amount', 0] },
          },
          totalOverdue: { $sum: { $cond: [{ $eq: ['$status', 'Overdue'] }, '$amount', 0] } },
          invoiceCount: { $sum: 1 },
          paidCount: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] } },
          overdueCount: { $sum: { $cond: [{ $eq: ['$status', 'Overdue'] }, 1, 0] } },
        },
      },
    ]);
    const billingOverview = billingOverviewRaw[0] || {
      totalBilled: 0, totalPaid: 0, totalOutstanding: 0, totalOverdue: 0,
      invoiceCount: 0, paidCount: 0, overdueCount: 0,
    };
    delete billingOverview._id;

    // ── 11. Monthly Revenue Trend (paid invoices, last 6 months) ───────────
    const monthlyRevenueRaw = await Billing.aggregate([
      { $match: { status: 'Paid', paidDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$paidDate' }, month: { $month: '$paidDate' } },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const found = monthlyRevenueRaw.find((r) => r._id.year === y && r._id.month === m);
      monthlyRevenue.push({
        month: `${MONTHS[m - 1]}`,
        revenue: found ? found.revenue : 0,
      });
    }

    // ── 12. Recent Activity Feed (last 10 notifications) ─────────────────
    const Notification = require('../models/Notification');
    const recentActivity = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        monthlyIntake,
        attorneyWorkload,
        caseOutcomes,
        taskVelocity,
        docPipeline,
        clientGrowth,
        priorityBreakdown,
        overdueAnalysis: {
          overdue: overdueTasks,
          totalActive: totalActiveTasks,
          overdueRate: totalActiveTasks > 0
            ? Math.round((overdueTasks / totalActiveTasks) * 100) : 0,
        },
        revenueByType,
        billingOverview,
        monthlyRevenue,
        recentActivity,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
