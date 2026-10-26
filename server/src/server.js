const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./database');
const projectsRouter = require('./routes/projects');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint (PRD Section 8.1)
app.get('/api/health', (req, res) => {
  try {
    // Quick DB query test
    const count = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Student Project Showcase API',
      database: 'connected',
      projectsCount: count
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'Database connection check failed'
    });
  }
});

// Mount API routes
app.use('/api', projectsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Global error handler (FR-05: avoid exposing internal server details)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal error occurred. Please try again later.'
  });
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Showcase Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📚 Public Projects: http://localhost:${PORT}/api/projects`);
  console.log(`🛡️  Admin API: http://localhost:${PORT}/api/admin/projects`);
  console.log(`🔑 Default Admin: admin@codenova.edu / Admin@123`);
  console.log(`====================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already active. Utilizing running server instance.`);
  } else {
    throw err;
  }
});

module.exports = { app, server };
