// controllers/profileController.js

const User = require('../models/User');
const Vote = require('../models/Vote');

/**
 * GET /api/profile
 * Protected — Get full profile of logged-in user
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('votedCandidateId', 'candidateId name party partyColor partyShort initials bgColor');

    let transactionId = null;
    let votedAt = null;

    if (user.hasVoted) {
      const vote = await Vote.findOne({ voter: req.user._id }).select('transactionId createdAt');
      transactionId = vote?.transactionId || null;
      votedAt = vote?.createdAt || null;
    }

    res.json({
      success: true,
      profile: {
        _id: user._id,
        voterId: user.voterId,
        name: user.name,
        email: user.email,
        dob: user.dob,
        state: user.state,
        role: user.role,
        hasVoted: user.hasVoted,
        votedCandidate: user.votedCandidateId || null,
        transactionId,
        votedAt,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

module.exports = { getProfile };
