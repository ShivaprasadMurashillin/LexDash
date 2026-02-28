/**
 * Brieflytix – Express Server Entry Point
 */
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// ── Security & Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Static file serving (uploaded documents) ─────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/upload',        require('./routes/upload'));
app.use('/api/clients',       require('./routes/clients'));
app.use('/api/cases',         require('./routes/cases'));
app.use('/api/documents',     require('./routes/documents'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/stats',         require('./routes/stats'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/search',        require('./routes/search'));
app.use('/api/calendar',      require('./routes/calendar'));
app.use('/api/analytics',     require('./routes/analytics'));
app.use('/api/billing',       require('./routes/billing'));
app.use('/api/seed',          require('./routes/seed'));

// Health check
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', message: '⚖️  Brieflytix API is running' })
);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Brieflytix server running on http://localhost:${PORT}`);
  console.log(`📊 Seed the database: GET http://localhost:${PORT}/api/seed`);
});
