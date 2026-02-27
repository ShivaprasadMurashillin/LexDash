/**
 * notificationStore.js
 * Manages in-app notifications in localStorage.
 * Seeds 5 demo notifications on first run.
 */

const NOTIF_KEY = 'lexdash_notifications';
const NOTIF_VERSION_KEY = 'lexdash_notifications_version';
const NOTIF_CURRENT_VERSION = 2; // bump to force localStorage refresh

const ago = (minutes) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'warning',
    title: 'Court date in 3 days',
    message: 'Henderson v. TechCorp Inc. hearing on Mar 1, 2026',
    time: ago(25),
    read: false,
  },
  {
    id: 'n2',
    type: 'info',
    title: 'New document uploaded',
    message: 'Motion for Summary Judgment filed – Case #2024-0012',
    time: ago(90),
    read: false,
  },
  {
    id: 'n3',
    type: 'success',
    title: 'Task marked complete',
    message: 'Isabela de la Cruz completed "Prepare deposition questions"',
    time: ago(300),
    read: false,
  },
  {
    id: 'n4',
    type: 'danger',
    title: 'Deadline overdue',
    message: 'Discovery response overdue – Williams Estate case',
    time: ago(60 * 26),
    read: true,
  },
  {
    id: 'n5',
    type: 'info',
    title: 'New case assigned',
    message: 'Patent Infringement case assigned to Chidi Okonkwo',
    time: ago(60 * 50),
    read: true,
  },
];

export function getNotifications() {
  try {
    const storedVersion = parseInt(localStorage.getItem(NOTIF_VERSION_KEY) || '0', 10);
    if (storedVersion < NOTIF_CURRENT_VERSION) {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      localStorage.setItem(NOTIF_VERSION_KEY, String(NOTIF_CURRENT_VERSION));
      return DEFAULT_NOTIFICATIONS;
    }
    const raw = localStorage.getItem(NOTIF_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
    localStorage.setItem(NOTIF_VERSION_KEY, String(NOTIF_CURRENT_VERSION));
    return DEFAULT_NOTIFICATIONS;
  } catch {
    return [...DEFAULT_NOTIFICATIONS];
  }
}

export function markAllRead() {
  const notifs = getNotifications().map((n) => ({ ...n, read: true }));
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
  return notifs;
}

export function markOneRead(id) {
  const notifs = getNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
  return notifs;
}

export function clearAll() {
  localStorage.setItem(NOTIF_KEY, JSON.stringify([]));
  return [];
}
