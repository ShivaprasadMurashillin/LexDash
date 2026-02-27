/**
 * Notification Model
 * Stores app-wide activity notifications in MongoDB.
 * Shared across all users — read state tracked per user email.
 */
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'danger'],
      default: 'info',
    },
    title:     { type: String, required: true, trim: true },
    message:   { type: String, required: true, trim: true },
    createdBy: { type: String, trim: true, default: 'System' }, // attorney name
    entity:    { type: String, trim: true },   // 'Case', 'Document', 'Task', 'Client'
    action:    { type: String, trim: true },   // 'created', 'updated', 'deleted'
    // Array of user emails who have read this notification
    readBy:    [{ type: String, lowercase: true, trim: true }],
  },
  { timestamps: true }
);

// Index for fast time-sorted queries
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
