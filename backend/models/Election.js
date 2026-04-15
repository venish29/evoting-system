// models/Election.js — stores active election info shown in the UI

const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: '2026 General Presidential Election',
    },
    subtitle: {
      type: String,
      default: 'Cast your vote for the next President',
    },
    deadline: {
      type: Date,
      required: true,
    },
    totalRegistered: {
      type: Number,
      default: 248750,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Election', electionSchema);
