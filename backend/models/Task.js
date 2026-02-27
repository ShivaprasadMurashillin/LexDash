/**
 * Task Model – tasks and action items linked to cases
 */
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: { type: String, trim: true },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
    },
    assignedTo: { type: String, trim: true },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Completed', 'Overdue'],
      default: 'To Do',
    },
    dueDate: { type: Date },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  { timestamps: true }
);

// ── Performance indexes ──────────────────────────────────────────────────────
taskSchema.index({ caseId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
