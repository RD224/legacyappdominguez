const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const users = await User.find({}, { username: 1 }).sort({ username: 1 });
    res.json(
      users.map((u) => ({
        id: String(u._id),
        username: u.username
      }))
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;

