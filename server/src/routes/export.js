const express = require('express');
const Task = require('../models/Task');

const router = express.Router();

function csvEscape(value) {
  const s = String(value ?? '');
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replaceAll('"', '""')}"`;
  }
  return s;
}

router.get('/tasks.csv', async (_req, res, next) => {
  try {
    const tasks = await Task.find()
      .sort({ taskNo: 1 })
      .populate('project', 'name');

    let csv = 'ID,Título,Estado,Prioridad,Proyecto\n';
    for (const t of tasks) {
      csv += `${t.taskNo},${csvEscape(t.title)},${csvEscape(t.status || 'Pendiente')},${csvEscape(
        t.priority || 'Media'
      )},${csvEscape(t.project ? t.project.name : 'Sin proyecto')}\n`;
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="export_tasks.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

