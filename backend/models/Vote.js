// models/Vote.js

const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,         // One vote per user — enforced at DB level
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    voterId: {
      type: String,         // Stored for quick audit lookups
      required: true,
    },
    candidateId: {
      type: String,         // candidateId string (c001, c002…)
      required: true,
    },
    transactionId: {
      type: String,         // Unique tx reference shown on frontend
      required: true,
      unique: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vote', voteSchema);
