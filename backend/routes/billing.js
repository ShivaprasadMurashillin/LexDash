/**
 * Billing CRUD Routes  –  /api/billing
 */
const express              = require('express');
const router               = express.Router();
const Billing              = require('../models/Billing');
const { createNotification } = require('../utils/notificationHelper');
const escapeRegex          = require('../utils/escapeRegex');

const who = (req) => req.headers['x-user-name'] || 'An attorney';

// ── Helper: generate next invoice number ─────────────────────────────────────
async function generateInvoiceNumber() {
  const year  = new Date().getFullYear();
  const count = await Billing.countDocuments();
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
}

// ── GET /api/billing ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    const query = {};

    if (search) {
      const safe = escapeRegex(search);
      query.$or = [
        { invoiceNumber: { $regex: safe, $options: 'i' } },
        { attorney:      { $regex: safe, $options: 'i' } },
        { description:   { $regex: safe, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    const total    = await Billing.countDocuments(query);
    const invoices = await Billing.find(query)
      .populate('caseId',   'caseNumber title')
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: invoices,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/billing/summary ──────────────────────────────────────────────────
router.get('/summary', async (_req, res) => {
  try {
    const [statusAgg, totalAgg, monthlyAgg] = await Promise.all([
      // Status breakdown
      Billing.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]),
      // Grand totals
      Billing.aggregate([
        {
          $group: {
            _id: null,
            totalBilled: { $sum: '$amount' },
            totalPaid:   {
              $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, '$amount', 0] },
            },
            totalOutstanding: {
              $sum: {
                $cond: [{ $in: ['$status', ['Sent', 'Overdue']] }, '$amount', 0],
              },
            },
            totalOverdue: {
              $sum: { $cond: [{ $eq: ['$status', 'Overdue'] }, '$amount', 0] },
            },
            invoiceCount: { $sum: 1 },
          },
        },
      ]),
      // Monthly revenue (last 6 months)
      Billing.aggregate([
        { $match: { status: 'Paid' } },
        {
          $group: {
            _id: {
              year:  { $year: '$paidDate' },
              month: { $month: '$paidDate' },
            },
            revenue: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 },
      ]),
    ]);

    const overview = totalAgg[0] || {
      totalBilled: 0, totalPaid: 0, totalOutstanding: 0,
      totalOverdue: 0, invoiceCount: 0,
    };

    const byStatus = {};
    statusAgg.forEach((s) => {
      byStatus[s._id] = { count: s.count, total: s.total };
    });

    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = monthlyAgg
      .reverse()
      .map((m) => ({
        month: `${months[m._id.month]} ${m._id.year}`,
        revenue: m.revenue,
      }));

    res.json({
      success: true,
      data: { overview, byStatus, monthlyRevenue },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/billing/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Billing.findById(req.params.id)
      .populate('caseId',   'caseNumber title')
      .populate('clientId', 'name email');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/billing ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const invoiceNumber = await generateInvoiceNumber();
    const invoice       = await Billing.create({ ...req.body, invoiceNumber });
    const populated     = await invoice.populate([
      { path: 'caseId',   select: 'caseNumber title' },
      { path: 'clientId', select: 'name email' },
    ]);

    await createNotification({
      entity: 'Invoice', action: 'created',
      name: `${invoiceNumber} – $${invoice.amount.toLocaleString()}`,
      createdBy: who(req),
    });

    res.status(201).json({ success: true, data: populated, message: 'Invoice created' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PUT /api/billing/:id ──────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const existing = await Billing.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Invoice not found' });

    // Recalculate amount if hours or rate changed
    const hours      = req.body.hours      ?? existing.hours;
    const hourlyRate = req.body.hourlyRate  ?? existing.hourlyRate;
    req.body.amount  = +(hours * hourlyRate).toFixed(2);

    // If marking as Paid and no paidDate provided, set it
    if (req.body.status === 'Paid' && !req.body.paidDate) {
      req.body.paidDate = new Date();
    }

    const updated = await Billing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'caseId',   select: 'caseNumber title' },
      { path: 'clientId', select: 'name email' },
    ]);

    await createNotification({
      entity: 'Invoice', action: 'updated',
      name: `${updated.invoiceNumber} → ${updated.status}`,
      createdBy: who(req),
    });

    res.json({ success: true, data: updated, message: 'Invoice updated' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PUT /api/billing/:id/pay ──────────────────────────────────────────────────
router.put('/:id/pay', async (req, res) => {
  try {
    const invoice = await Billing.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    invoice.status   = 'Paid';
    invoice.paidDate = new Date();
    await invoice.save();

    const populated = await invoice.populate([
      { path: 'caseId',   select: 'caseNumber title' },
      { path: 'clientId', select: 'name email' },
    ]);

    await createNotification({
      entity: 'Invoice', action: 'updated',
      name: `${invoice.invoiceNumber} marked as Paid`,
      createdBy: who(req),
    });

    res.json({ success: true, data: populated, message: 'Invoice marked as paid' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/billing/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Billing.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Invoice not found' });

    await createNotification({
      entity: 'Invoice', action: 'deleted',
      name: `${deleted.invoiceNumber}`,
      createdBy: who(req),
    });

    res.json({ success: true, message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
