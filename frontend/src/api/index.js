/**
 * Axios API client – all backend communication goes through here
 */
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

/**
 * Call this once after login so every request carries the user's
 * name and email (used by backend to attribute notifications).
 */
export function setApiUser({ name, email }) {
  api.defaults.headers.common['x-user-name']  = name  || '';
  api.defaults.headers.common['x-user-email'] = email || '';
}

// ── Response interceptor for uniform error surfacing ─────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || err.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── Resource helpers ──────────────────────────────────────────────────────────
const resource = (path) => ({
  getAll:   (params) => api.get(path, { params }),
  getById:  (id)     => api.get(`${path}/${id}`),
  create:   (data)   => api.post(path, data),
  update:   (id, d)  => api.put(`${path}/${id}`, d),
  remove:   (id)     => api.delete(`${path}/${id}`),
});

export const clientsAPI   = resource('/clients');
export const casesAPI     = resource('/cases');
export const documentsAPI = resource('/documents');
export const tasksAPI     = resource('/tasks');

export const statsAPI = {
  getDashboard: () => api.get('/stats'),
};

export const analyticsAPI = {
  getAnalytics: () => api.get('/analytics'),
};

export const billingAPI = {
  ...resource('/billing'),
  getSummary: ()   => api.get('/billing/summary'),
  markPaid:   (id) => api.put(`/billing/${id}/pay`),
};

export const notificationsAPI = {
  getAll:      ()   => api.get('/notifications'),
  markAllRead: ()   => api.put('/notifications/mark-all-read'),
  markRead:    (id) => api.put(`/notifications/${id}/read`),
  clearAll:    ()   => api.delete('/notifications'),
};

export const uploadAPI = {
  upload: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  remove: (filename) => api.delete(`/upload/${filename}`),
};

export const searchAPI = {
  search: (q) => api.get('/search', { params: { q } }),
};

export const calendarAPI = {
  getEvents: (year, month) => api.get('/calendar', { params: { year, month } }),
};

export const seedAPI = {
  seed: () => api.get('/seed', { params: { confirm: 'yes' } }),
};

export default api;
