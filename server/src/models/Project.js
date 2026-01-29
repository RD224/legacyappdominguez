const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    projectNo: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Project', ProjectSchema);

