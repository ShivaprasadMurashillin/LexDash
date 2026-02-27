/**
 * Notifications Routes  –  /api/notifications
 */
const express      = require('express');
const router       = express.Router();
const Notification = require('../models/Notification');

// ── GET /api/notifications ────────────────────────────────────────────────────
// Returns last 40 notifications; each item includes `read` field for the
// requesting user (identified by X-User-Email header).
router.get('/', async (req, res) => {
  try {
    const userEmail = (req.headers['x-user-email'] || '').toLowerCase().trim();
    const limit     = parseInt(req.query.limit) || 40;

    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Attach per-user read state
    const result = notifications.map((n) => ({
      ...n,
      read: userEmail ? n.readBy.includes(userEmail) : false,
    }));

    const unreadCount = result.filter((n) => !n.read).length;

    res.json({ success: true, data: result, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/notifications/mark-all-read ──────────────────────────────────────
router.put('/mark-all-read', async (req, res) => {
  try {
    const userEmail = (req.headers['x-user-email'] || '').toLowerCase().trim();
    if (!userEmail) return res.status(400).json({ success: false, message: 'User email required' });

    // Add user email to readBy for all notifications where not already present
    await Notification.updateMany(
      { readBy: { $ne: userEmail } },
      { $push: { readBy: userEmail } }
    );

    res.json({ success: true, message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/notifications/:id/read ──────────────────────────────────────────
router.put('/:id/read', async (req, res) => {
  try {
    const userEmail = (req.headers['x-user-email'] || '').toLowerCase().trim();
    if (!userEmail) return res.status(400).json({ success: false, message: 'User email required' });

    await Notification.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: userEmail } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/notifications (clear all) ────────────────────────────────────
router.delete('/', async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
