// models/ActivityLog.js — tracks login events and votes for admin panel

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    user: {
      type: String,         // voterId string
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'error'],
      default: 'success',
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
