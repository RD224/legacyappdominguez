const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { authRequired } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const projectsRoutes = require('./routes/projects');
const tasksRoutes = require('./routes/tasks');
const historyRoutes = require('./routes/history');
const notificationsRoutes = require('./routes/notifications');
const reportsRoutes = require('./routes/reports');
const exportRoutes = require('./routes/export');

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || true,
      credentials: true
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'legacyapp-api' });
  });

  app.use('/api/auth', authRoutes);

  // Auth required below
  app.use('/api/users', authRequired, usersRoutes);
  app.use('/api/projects', authRequired, projectsRoutes);
  app.use('/api/tasks', authRequired, tasksRoutes);
  app.use('/api/history', authRequired, historyRoutes);
  app.use('/api/notifications', authRequired, notificationsRoutes);
  app.use('/api/reports', authRequired, reportsRoutes);
  app.use('/api/export', authRequired, exportRoutes);

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = err.statusCode || 500;
    res.status(status).json({
      error: err.message || 'Error interno',
      ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
    });
  });

  return app;
}

module.exports = { createApp };

