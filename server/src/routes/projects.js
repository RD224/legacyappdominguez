const express = require('express');
const Project = require('../models/Project');
const { getNextSequence } = require('../utils/counters');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const projects = await Project.find().sort({ projectNo: 1 });
    res.json(
      projects.map((p) => ({
        id: String(p._id),
        projectNo: p.projectNo,
        name: p.name,
        description: p.description || ''
      }))
    );
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body || {};
    if (!name) return res.status(400).json({ error: 'El nombre es requerido' });

    const projectNo = await getNextSequence('project');
    const created = await Project.create({
      projectNo,
      name: String(name).trim(),
      description: description ? String(description) : ''
    });

    res.status(201).json({
      id: String(created._id),
      projectNo: created.projectNo,
      name: created.name,
      description: created.description || ''
    });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body || {};
    if (!name) return res.status(400).json({ error: 'El nombre es requerido' });

    const updated = await Project.findByIdAndUpdate(
      id,
      { name: String(name).trim(), description: description ? String(description) : '' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Proyecto no encontrado' });

    res.json({
      id: String(updated._id),
      projectNo: updated.projectNo,
      name: updated.name,
      description: updated.description || ''
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

