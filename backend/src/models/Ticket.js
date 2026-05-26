const mongoose = require('mongoose');

const SLA_TARGETS = {
  urgent: 60,      // 1 hour
  high: 240,       // 4 hours
  medium: 1440,    // 24 hours
  low: 4320        // 72 hours
};

const TicketSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Priority must be low, medium, high, or urgent'
    },
    default: 'medium'
  },
  status: {
    type: String,
    enum: {
      values: ['open', 'in_progress', 'resolved', 'closed'],
      message: 'Status must be open, in_progress, resolved, or closed'
    },
    default: 'open'
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Derived Field: ageMinutes
TicketSchema.virtual('ageMinutes').get(function() {
  const endTime = this.resolvedAt || new Date();
  const elapsedMs = endTime - this.createdAt;
  return Math.max(0, Math.floor(elapsedMs / 60000));
});

// Derived Field: slaBreached
TicketSchema.virtual('slaBreached').get(function() {
  const targetMinutes = SLA_TARGETS[this.priority] || SLA_TARGETS.medium;
  return this.ageMinutes > targetMinutes;
});

module.exports = mongoose.model('Ticket', TicketSchema);
