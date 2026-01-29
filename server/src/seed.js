const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const { getNextSequence } = require('./utils/counters');

async function seedIfEmpty() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const defaults = [
      { username: 'admin', password: 'admin' },
      { username: 'user1', password: 'user1' },
      { username: 'user2', password: 'user2' }
    ];

    for (const u of defaults) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      // eslint-disable-next-line no-await-in-loop
      await User.create({ username: u.username, passwordHash });
    }
  }

  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    const projects = [
      { name: 'Proyecto Demo', description: 'Proyecto de ejemplo' },
      { name: 'Proyecto Alpha', description: 'Proyecto importante' },
      { name: 'Proyecto Beta', description: 'Proyecto secundario' }
    ];

    for (const p of projects) {
      // eslint-disable-next-line no-await-in-loop
      const projectNo = await getNextSequence('project');
      // eslint-disable-next-line no-await-in-loop
      await Project.create({ projectNo, ...p });
    }
  }
}

module.exports = { seedIfEmpty };

