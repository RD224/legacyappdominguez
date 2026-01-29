const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    taskNo: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pendiente', 'En Progreso', 'Completada', 'Bloqueada', 'Cancelada'],
      default: 'Pendiente'
    },
    priority: { type: String, enum: ['Baja', 'Media', 'Alta', 'Crítica'], default: 'Media' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    dueDate: { type: Date, default: null },
    estimatedHours: { type: Number, default: 0 },
    actualHours: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Task', TaskSchema);

