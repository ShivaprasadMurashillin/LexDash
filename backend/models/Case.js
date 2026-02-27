/**
 * Case Model – legal cases managed by the firm
 */
const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Case title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Criminal', 'Civil', 'Family', 'Corporate', 'Immigration', 'Intellectual Property'],
      required: [true, 'Case type is required'],
    },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Closed', 'On Hold'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    assignedAttorney: { type: String, trim: true },
    courtDate:  { type: Date },
    filingDate: { type: Date },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

// ── Performance indexes ──────────────────────────────────────────────────────
caseSchema.index({ status: 1 });
caseSchema.index({ type: 1 });
caseSchema.index({ priority: 1 });
caseSchema.index({ clientId: 1 });
caseSchema.index({ courtDate: 1 });
caseSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Case', caseSchema);
