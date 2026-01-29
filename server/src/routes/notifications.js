const express = require('express');
const Notification = require('../models/Notification');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const unreadOnly = String(req.query.unread || 'true') === 'true';
    const q = { user: req.user.sub };
    if (unreadOnly) q.read = false;

    const notifications = await Notification.find(q).sort({ createdAt: -1 }).limit(200);
    res.json(
      notifications.map((n) => ({
        id: String(n._id),
        message: n.message,
        type: n.type,
        read: Boolean(n.read),
        createdAt: n.createdAt
      }))
    );
  } catch (err) {
    next(err);
  }
});

router.post('/mark-read', async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.sub, read: false }, { $set: { read: true } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

