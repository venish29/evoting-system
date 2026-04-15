// models/Candidate.js

const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    candidateId: {
      type: String,         // e.g. "c001" — matches frontend IDs
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
    },
    party: {
      type: String,
      required: [true, 'Party name is required'],
      trim: true,
    },
    partyColor: {
      type: String,
      default: '#3b82f6',
    },
    partyShort: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      default: 'Presidential Candidate',
    },
    age: {
      type: Number,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: '',
    },
    platform: {
      type: [String],
      default: [],
    },
    initials: {
      type: String,
      default: '',
    },
    bgColor: {
      type: String,
      default: 'from-blue-500 to-blue-700',
    },
    voteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Candidate', candidateSchema);
