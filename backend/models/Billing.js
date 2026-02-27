/**
 * Billing Model – invoices and billing records for cases
 */
const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: [true, 'Case is required'],
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client is required'],
    },
    attorney: {
      type: String,
      required: [true, 'Attorney is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    hours: {
      type: Number,
      required: [true, 'Hours are required'],
      min: [0.1, 'Hours must be at least 0.1'],
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: [1, 'Rate must be positive'],
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
      default: 'Draft',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    paidDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Auto-calculate amount before save
billingSchema.pre('save', function (next) {
  this.amount = +(this.hours * this.hourlyRate).toFixed(2);
  next();
});

billingSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.hours != null && update.hourlyRate != null) {
    update.amount = +(update.hours * update.hourlyRate).toFixed(2);
  } else if (update.hours != null) {
    // hourlyRate will come from existing doc — handled in route
  } else if (update.hourlyRate != null) {
    // hours will come from existing doc — handled in route
  }
  next();
});

// ── Performance indexes ──────────────────────────────────────────────────────
billingSchema.index({ status: 1 });
billingSchema.index({ caseId: 1 });
billingSchema.index({ clientId: 1 });
billingSchema.index({ dueDate: 1 });
billingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Billing', billingSchema);
