/**
 * Document Model – legal documents associated with cases
 */
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
    },
    type: {
      type: String,
      enum: ['Contract', 'Affidavit', 'Motion', 'Brief', 'Evidence', 'Subpoena', 'Order'],
      required: [true, 'Document type is required'],
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Review', 'Reviewed', 'Approved', 'Filed'],
      default: 'Draft',
    },
    uploadedBy: { type: String, trim: true },
    fileUrl:    { type: String, trim: true },
    notes:      { type: String, trim: true },
    deadline:   { type: Date },
  },
  { timestamps: true }
);

// ── Performance indexes ──────────────────────────────────────────────────────
documentSchema.index({ caseId: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ deadline: 1 });
documentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
