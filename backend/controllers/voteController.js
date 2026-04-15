// controllers/voteController.js

const Vote = require('../models/Vote');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const ActivityLog = require('../models/ActivityLog');

/**
 * POST /api/votes/cast
 * Protected (voter) — Cast a vote for a candidate
 * Body: { candidateId: "c001" }
 */
const castVote = async (req, res) => {
  try {
    const { candidateId } = req.body;
    const userId = req.user._id;

    // Check if user already voted
    if (req.user.hasVoted) {
      return res.status(400).json({ success: false, message: 'You have already voted' });
    }

    // Find candidate by candidateId string
    const candidate = await Candidate.findOne({ candidateId, isActive: true });
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Double-check vote record doesn't exist (race condition guard)
    const existingVote = await Vote.findOne({ voter: userId });
    if (existingVote) {
      return res.status(400).json({ success: false, message: 'You have already voted' });
    }

    // Generate transaction ID
    const transactionId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create vote record
    const vote = await Vote.create({
      voter: userId,
      candidate: candidate._id,
      voterId: req.user.voterId,
      candidateId: candidate.candidateId,
      transactionId,
      ipAddress: req.ip || '',
    });

    // Increment candidate vote count atomically
    await Candidate.findByIdAndUpdate(candidate._id, { $inc: { voteCount: 1 } });

    // Mark user as having voted
    await User.findByIdAndUpdate(userId, {
      hasVoted: true,
      votedCandidateId: candidate._id,
    });

    // Log activity
    await ActivityLog.create({
      action: 'Vote cast',
      user: req.user.voterId,
      status: 'success',
      meta: { candidateId: candidate.candidateId, candidateName: candidate.name },
    });

    res.status(201).json({
      success: true,
      message: `Vote cast for ${candidate.name}`,
      transactionId,
      candidateId: candidate.candidateId,
      candidateName: candidate.name,
    });
  } catch (err) {
    console.error('castVote error:', err);
    // Mongoose duplicate key = already voted
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already voted' });
    }
    res.status(500).json({ success: false, message: 'Failed to cast vote' });
  }
};

/**
 * GET /api/votes/status
 * Protected — Check if current user has voted and which candidate
 */
const getVoteStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'votedCandidateId',
      'candidateId name party partyColor partyShort initials bgColor'
    );

    let transactionId = null;
    if (user.hasVoted) {
      const vote = await Vote.findOne({ voter: req.user._id }).select('transactionId createdAt');
      transactionId = vote?.transactionId || null;
    }

    res.json({
      success: true,
      hasVoted: user.hasVoted,
      votedCandidate: user.votedCandidateId || null,
      transactionId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch vote status' });
  }
};

/**
 * GET /api/votes/results
 * Protected — Aggregated voting results for the results page
 */
const getResults = async (req, res) => {
  try {
    const candidates = await Candidate.find({ isActive: true }).sort({ voteCount: -1 });
    const total = candidates.reduce((sum, c) => sum + c.voteCount, 0);

    // Election info for turnout calculation
    const Election = require('../models/Election');
    const election = await Election.findOne({ isActive: true });
    const totalRegistered = election?.totalRegistered || 248750;

    const turnout = total > 0 ? ((total / totalRegistered) * 100).toFixed(1) : '0.0';

    res.json({
      success: true,
      candidates,
      total,
      turnout,
      totalRegistered,
      electionTitle: election?.title || '2026 General Presidential Election',
      deadline: election?.deadline || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch results' });
  }
};

module.exports = { castVote, getVoteStatus, getResults };
