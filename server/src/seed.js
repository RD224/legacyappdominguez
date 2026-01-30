const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Comment = require('./models/Comment');
const History = require('./models/History');
const Notification = require('./models/Notification');
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
    const projectData = [
      { name: 'Proyecto Demo', description: 'Proyecto de ejemplo' },
      { name: 'Proyecto Alpha', description: 'Proyecto importante' },
      { name: 'Proyecto Beta', description: 'Proyecto secundario' }
    ];

    for (const p of projectData) {
      // eslint-disable-next-line no-await-in-loop
      const projectNo = await getNextSequence('project');
      // eslint-disable-next-line no-await-in-loop
      await Project.create({ projectNo, ...p });
    }
  }

  const taskCount = await Task.countDocuments();
  if (taskCount === 0) {
    const users = await User.find().lean();
    const projects = await Project.find().lean();
    if (users.length === 0 || projects.length === 0) return;

    const admin = users.find((u) => u.username === 'admin') || users[0];
    const user1 = users.find((u) => u.username === 'user1') || users[1] || users[0];
    const user2 = users.find((u) => u.username === 'user2') || users[2] || users[0];
    const projDemo = projects.find((p) => p.name === 'Proyecto Demo') || projects[0];
    const projAlpha = projects.find((p) => p.name === 'Proyecto Alpha') || projects[1] || projects[0];
    const projBeta = projects.find((p) => p.name === 'Proyecto Beta') || projects[2] || projects[0];

    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const tasksData = [
      {
        title: 'Configurar entorno de desarrollo',
        description: 'Instalar Node, MongoDB Compass y configurar variables de entorno.',
        status: 'Completada',
        priority: 'Alta',
        projectId: projDemo._id,
        assignedToId: admin._id,
        dueDate: lastWeek,
        estimatedHours: 4,
        createdById: admin._id
      },
      {
        title: 'Diseñar esquema de base de datos',
        description: 'Definir colecciones y relaciones para usuarios, tareas y proyectos.',
        status: 'Completada',
        priority: 'Alta',
        projectId: projDemo._id,
        assignedToId: user1._id,
        dueDate: lastWeek,
        estimatedHours: 6,
        createdById: admin._id
      },
      {
        title: 'Implementar API de autenticación',
        description: 'Login con JWT, middleware authRequired y rutas protegidas.',
        status: 'Completada',
        priority: 'Crítica',
        projectId: projAlpha._id,
        assignedToId: admin._id,
        dueDate: now,
        estimatedHours: 8,
        createdById: admin._id
      },
      {
        title: 'CRUD de tareas en el frontend',
        description: 'Formulario de tareas, lista, edición y eliminación con React.',
        status: 'En Progreso',
        priority: 'Alta',
        projectId: projAlpha._id,
        assignedToId: user1._id,
        dueDate: nextWeek,
        estimatedHours: 12,
        createdById: admin._id
      },
      {
        title: 'Panel de reportes',
        description: 'Reportes por estado, por proyecto y por usuario. Export CSV.',
        status: 'Pendiente',
        priority: 'Media',
        projectId: projAlpha._id,
        assignedToId: user2._id,
        dueDate: nextWeek,
        estimatedHours: 6,
        createdById: admin._id
      },
      {
        title: 'Notificaciones en tiempo real',
        description: 'Opción futura: WebSockets para notificaciones al instante.',
        status: 'Pendiente',
        priority: 'Baja',
        projectId: projBeta._id,
        assignedToId: null,
        dueDate: null,
        estimatedHours: 16,
        createdById: user1._id
      },
      {
        title: 'Tests unitarios del backend',
        description: 'Jest o Mocha para rutas y modelos.',
        status: 'Pendiente',
        priority: 'Media',
        projectId: projBeta._id,
        assignedToId: user2._id,
        dueDate: nextWeek,
        estimatedHours: 10,
        createdById: admin._id
      },
      {
        title: 'Documentación de la API',
        description: 'Swagger/OpenAPI o README con ejemplos de endpoints.',
        status: 'Bloqueada',
        priority: 'Baja',
        projectId: projDemo._id,
        assignedToId: user1._id,
        dueDate: nextWeek,
        estimatedHours: 4,
        createdById: admin._id
      }
    ];

    const createdTasks = [];
    for (const t of tasksData) {
      const taskNo = await getNextSequence('task');
      const task = await Task.create({
        taskNo,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        project: t.projectId,
        assignedTo: t.assignedToId,
        dueDate: t.dueDate,
        estimatedHours: t.estimatedHours,
        actualHours: t.status === 'Completada' ? t.estimatedHours : 0,
        createdBy: t.createdById
      });
      createdTasks.push(task);

      await History.create({
        task: task._id,
        user: t.createdById,
        action: 'CREATED',
        oldValue: '',
        newValue: t.title,
        timestamp: new Date()
      });
    }

    const [task1, task2, task3, task4] = createdTasks;
    await Comment.create([
      { task: task1._id, user: admin._id, commentText: 'Listo, entorno funcionando correctamente.' },
      { task: task2._id, user: user1._id, commentText: 'Esquema revisado y aprobado.' },
      { task: task3._id, user: admin._id, commentText: 'JWT configurado con expiración de 7 días.' },
      { task: task4._id, user: user1._id, commentText: 'Avanzando con el formulario de edición.' }
    ]);

    await History.create([
      { task: task1._id, user: admin._id, action: 'STATUS_CHANGED', oldValue: 'Pendiente', newValue: 'Completada', timestamp: new Date() },
      { task: task2._id, user: user1._id, action: 'STATUS_CHANGED', oldValue: 'Pendiente', newValue: 'Completada', timestamp: new Date() },
      { task: task3._id, user: admin._id, action: 'STATUS_CHANGED', oldValue: 'En Progreso', newValue: 'Completada', timestamp: new Date() }
    ]);

    await Notification.insertMany([
      { user: user1._id, message: 'Nueva tarea asignada: CRUD de tareas en el frontend', type: 'task_assigned', read: false },
      { user: user2._id, message: 'Nueva tarea asignada: Panel de reportes', type: 'task_assigned', read: false },
      { user: user2._id, message: 'Tarea actualizada: Tests unitarios del backend', type: 'task_updated', read: true }
    ]);
  }
}

module.exports = { seedIfEmpty };

