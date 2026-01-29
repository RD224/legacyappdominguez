const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Comment = require('../models/Comment');
const History = require('../models/History');
const Notification = require('../models/Notification');
const { getNextSequence } = require('../utils/counters');

const router = express.Router();

function parseDueDate(value) {
  if (!value) return null;
  const s = String(value).trim();
  // Accept YYYY-MM-DD (legacy) or ISO.
  const d = new Date(s);
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(d.getTime())) return null;
  return d;
}

async function addHistory({ taskId, userId, action, oldValue, newValue }) {
  await History.create({
    task: taskId,
    user: userId,
    action,
    oldValue: oldValue || '',
    newValue: newValue || '',
    timestamp: new Date()
  });
}

async function addNotification({ userId, message, type }) {
  await Notification.create({
    user: userId,
    message,
    type,
    read: false
  });
}

router.get('/', async (req, res, next) => {
  try {
    const { searchText, status, priority, projectId } = req.query || {};
    const q = {};

    if (status) q.status = String(status);
    if (priority) q.priority = String(priority);
    if (projectId && String(projectId) !== '0') q.project = String(projectId);

    if (searchText) {
      const s = String(searchText).trim();
      q.$or = [{ title: { $regex: s, $options: 'i' } }, { description: { $regex: s, $options: 'i' } }];
    }

    const tasks = await Task.find(q)
      .sort({ taskNo: 1 })
      .populate('project', 'projectNo name')
      .populate('assignedTo', 'username')
      .populate('createdBy', 'username');

    res.json(
      tasks.map((t) => ({
        id: String(t._id),
        taskNo: t.taskNo,
        title: t.title,
        description: t.description || '',
        status: t.status,
        priority: t.priority,
        project: t.project
          ? { id: String(t.project._id), projectNo: t.project.projectNo, name: t.project.name }
          : null,
        assignedTo: t.assignedTo ? { id: String(t.assignedTo._id), username: t.assignedTo.username } : null,
        dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : '',
        estimatedHours: t.estimatedHours || 0,
        actualHours: t.actualHours || 0,
        createdBy: t.createdBy ? { id: String(t.createdBy._id), username: t.createdBy.username } : null,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      }))
    );
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, description, status, priority, projectId, assignedToId, dueDate, estimatedHours } = req.body || {};
    if (!title) return res.status(400).json({ error: 'El título es requerido' });

    const createdBy = req.user.sub;

    let project = null;
    if (projectId && String(projectId) !== '0') {
      project = await Project.findById(projectId);
      if (!project) return res.status(400).json({ error: 'Proyecto inválido' });
    }

    let assignedTo = null;
    if (assignedToId && String(assignedToId) !== '0') {
      assignedTo = await User.findById(assignedToId);
      if (!assignedTo) return res.status(400).json({ error: 'Usuario asignado inválido' });
    }

    const taskNo = await getNextSequence('task');
    const task = await Task.create({
      taskNo,
      title: String(title).trim(),
      description: description ? String(description) : '',
      status: status ? String(status) : 'Pendiente',
      priority: priority ? String(priority) : 'Media',
      project: project ? project._id : null,
      assignedTo: assignedTo ? assignedTo._id : null,
      dueDate: parseDueDate(dueDate),
      estimatedHours: estimatedHours ? Number(estimatedHours) : 0,
      actualHours: 0,
      createdBy
    });

    await addHistory({
      taskId: task._id,
      userId: createdBy,
      action: 'CREATED',
      oldValue: '',
      newValue: task.title
    });

    if (assignedTo) {
      await addNotification({
        userId: assignedTo._id,
        message: `Nueva tarea asignada: ${task.title}`,
        type: 'task_assigned'
      });
    }

    res.status(201).json({ id: String(task._id), taskNo: task.taskNo });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, projectId, assignedToId, dueDate, estimatedHours, actualHours } =
      req.body || {};

    const oldTask = await Task.findById(id);
    if (!oldTask) return res.status(404).json({ error: 'Tarea no encontrada' });

    if (!title) return res.status(400).json({ error: 'El título es requerido' });

    let project = null;
    if (projectId && String(projectId) !== '0') {
      project = await Project.findById(projectId);
      if (!project) return res.status(400).json({ error: 'Proyecto inválido' });
    }

    let assignedTo = null;
    if (assignedToId && String(assignedToId) !== '0') {
      assignedTo = await User.findById(assignedToId);
      if (!assignedTo) return res.status(400).json({ error: 'Usuario asignado inválido' });
    }

    const updated = await Task.findByIdAndUpdate(
      id,
      {
        title: String(title).trim(),
        description: description ? String(description) : '',
        status: status ? String(status) : 'Pendiente',
        priority: priority ? String(priority) : 'Media',
        project: project ? project._id : null,
        assignedTo: assignedTo ? assignedTo._id : null,
        dueDate: parseDueDate(dueDate),
        estimatedHours: estimatedHours ? Number(estimatedHours) : 0,
        actualHours: actualHours != null ? Number(actualHours) : oldTask.actualHours
      },
      { new: true }
    );

    const userId = req.user.sub;

    if (oldTask.status !== updated.status) {
      await addHistory({
        taskId: updated._id,
        userId,
        action: 'STATUS_CHANGED',
        oldValue: oldTask.status,
        newValue: updated.status
      });
    }

    if (oldTask.title !== updated.title) {
      await addHistory({
        taskId: updated._id,
        userId,
        action: 'TITLE_CHANGED',
        oldValue: oldTask.title,
        newValue: updated.title
      });
    }

    if (assignedTo) {
      await addNotification({
        userId: assignedTo._id,
        message: `Tarea actualizada: ${updated.title}`,
        type: 'task_updated'
      });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

    await addHistory({
      taskId: task._id,
      userId: req.user.sub,
      action: 'DELETED',
      oldValue: task.title,
      newValue: ''
    });

    await Comment.deleteMany({ task: task._id });
    await Task.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Comentarios de tarea
router.get('/:id/comments', async (req, res, next) => {
  try {
    const { id } = req.params;
    const comments = await Comment.find({ task: id })
      .sort({ createdAt: 1 })
      .populate('user', 'username');

    res.json(
      comments.map((c) => ({
        id: String(c._id),
        createdAt: c.createdAt,
        user: c.user ? { id: String(c.user._id), username: c.user.username } : null,
        commentText: c.commentText
      }))
    );
  } catch (err) {
    next(err);
  }
});

router.post('/:id/comments', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { commentText } = req.body || {};
    if (!commentText) return res.status(400).json({ error: 'El comentario no puede estar vacío' });

    const created = await Comment.create({
      task: id,
      user: req.user.sub,
      commentText: String(commentText)
    });

    res.status(201).json({ id: String(created._id) });
  } catch (err) {
    next(err);
  }
});

// Historial de tarea
router.get('/:id/history', async (req, res, next) => {
  try {
    const { id } = req.params;
    const history = await History.find({ task: id })
      .sort({ timestamp: 1 })
      .populate('user', 'username');

    res.json(
      history.map((h) => ({
        id: String(h._id),
        timestamp: h.timestamp,
        action: h.action,
        oldValue: h.oldValue || '',
        newValue: h.newValue || '',
        user: h.user ? { id: String(h.user._id), username: h.user.username } : null
      }))
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;

