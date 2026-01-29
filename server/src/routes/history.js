const express = require('express');
const History = require('../models/History');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 100), 500);
    const history = await History.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('user', 'username')
      .populate('task', 'taskNo title');

    res.json(
      history.map((h) => ({
        id: String(h._id),
        timestamp: h.timestamp,
        action: h.action,
        oldValue: h.oldValue || '',
        newValue: h.newValue || '',
        user: h.user ? { id: String(h.user._id), username: h.user.username } : null,
        task: h.task ? { id: String(h.task._id), taskNo: h.task.taskNo, title: h.task.title } : null
      }))
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;

