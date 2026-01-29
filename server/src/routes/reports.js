const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

const router = express.Router();

router.get('/tasks', async (_req, res, next) => {
  try {
    const tasks = await Task.find({}, { status: 1 });
    const statusCount = {};
    for (const t of tasks) {
      const s = t.status || 'Pendiente';
      statusCount[s] = (statusCount[s] || 0) + 1;
    }
    res.json({ type: 'tasks', statusCount });
  } catch (err) {
    next(err);
  }
});

router.get('/projects', async (_req, res, next) => {
  try {
    const projects = await Project.find({}, { name: 1, projectNo: 1 });
    const tasks = await Task.find({}, { project: 1 });
    const counts = {};
    for (const p of projects) counts[String(p._id)] = 0;
    for (const t of tasks) {
      if (t.project) counts[String(t.project)] = (counts[String(t.project)] || 0) + 1;
    }

    res.json({
      type: 'projects',
      projects: projects.map((p) => ({
        id: String(p._id),
        projectNo: p.projectNo,
        name: p.name,
        taskCount: counts[String(p._id)] || 0
      }))
    });
  } catch (err) {
    next(err);
  }
});

router.get('/users', async (_req, res, next) => {
  try {
    const users = await User.find({}, { username: 1 });
    const tasks = await Task.find({}, { assignedTo: 1 });
    const counts = {};
    for (const u of users) counts[String(u._id)] = 0;
    for (const t of tasks) {
      if (t.assignedTo) counts[String(t.assignedTo)] = (counts[String(t.assignedTo)] || 0) + 1;
    }

    res.json({
      type: 'users',
      users: users.map((u) => ({
        id: String(u._id),
        username: u.username,
        assignedTaskCount: counts[String(u._id)] || 0
      }))
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

