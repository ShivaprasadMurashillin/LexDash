/**
 * notificationHelper.js
 * Call createNotification() from any route to fire a notification to all users.
 */
const Notification = require('../models/Notification');

const TYPE_MAP = {
  created: 'success',
  updated: 'info',
  deleted: 'danger',
};

const ENTITY_ICON = {
  Case:     '⚖️',
  Document: '📄',
  Task:     '✅',
  Client:   '👤',
};

/**
 * @param {Object} opts
 * @param {'Case'|'Document'|'Task'|'Client'} opts.entity
 * @param {'created'|'updated'|'deleted'} opts.action
 * @param {string} opts.name        - Name/title of the affected record
 * @param {string} [opts.createdBy] - Attorney name who made the change
 */
async function createNotification({ entity, action, name, createdBy = 'System' }) {
  try {
    const icon  = ENTITY_ICON[entity] ?? '🔔';
    const type  = TYPE_MAP[action]    ?? 'info';
    const title = `${icon} ${entity} ${action}`;
    const message = `"${name}" was ${action} by ${createdBy}`;

    await Notification.create({ type, title, message, createdBy, entity, action });
  } catch (err) {
    // Notifications are non-critical — log but don't throw
    console.error('[notification]', err.message);
  }
}

module.exports = { createNotification };
