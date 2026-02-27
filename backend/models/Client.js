/**
 * Client Model – individual or corporate clients
 */
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    type: {
      type: String,
      enum: ['Individual', 'Corporate'],
      default: 'Individual',
    },
    address: { type: String, trim: true },
    activeCases: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    joinedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ── Performance indexes ──────────────────────────────────────────────────────
clientSchema.index({ status: 1 });
clientSchema.index({ type: 1 });
clientSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Client', clientSchema);
