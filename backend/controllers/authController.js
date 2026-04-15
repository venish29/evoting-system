// controllers/authController.js

const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const generateToken = require('../utils/generateToken');

/**
 * POST /api/auth/register
 * Public — Register a new voter
 */
const register = async (req, res) => {
  try {
    const { voterId, name, email, password, dob, state } = req.body;

    // Check duplicates
    const existingVoterId = await User.findOne({ voterId: voterId.toUpperCase() });
    if (existingVoterId) {
      return res.status(400).json({ success: false, message: 'Voter ID already registered' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Age check (must be 18+)
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    if (currentYear - birthYear < 18) {
      return res.status(400).json({ success: false, message: 'You must be 18 or older to register' });
    }

    const user = await User.create({
      voterId: voterId.toUpperCase(),
      name,
      email,
      password,
      dob,
      state,
      role: 'voter',
    });

    await ActivityLog.create({
      action: 'User registered',
      user: user.voterId,
      status: 'success',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        voterId: user.voterId,
        name: user.name,
        email: user.email,
        dob: user.dob,
        state: user.state,
        role: user.role,
        hasVoted: user.hasVoted,
        votedCandidateId: user.votedCandidateId,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: err.message || 'Registration failed' });
  }
};

/**
 * POST /api/auth/login
 * Public — Login with voterId + password
 */
const login = async (req, res) => {
  try {
    const { voterId, password } = req.body;

    if (!voterId || !password) {
      return res.status(400).json({ success: false, message: 'Voter ID and password are required' });
    }

    // Find user and explicitly select password
    const user = await User.findOne({ voterId: voterId.toUpperCase() }).select('+password');

    if (!user) {
      await ActivityLog.create({
        action: 'Failed login attempt',
        user: voterId.toUpperCase(),
        status: 'error',
      });
      return res.status(401).json({ success: false, message: 'Invalid Voter ID or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await ActivityLog.create({
        action: 'Failed login attempt',
        user: user.voterId,
        status: 'error',
      });
      return res.status(401).json({ success: false, message: 'Invalid Voter ID or password' });
    }

    await ActivityLog.create({
      action: 'User logged in',
      user: user.voterId,
      status: 'success',
    });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        voterId: user.voterId,
        name: user.name,
        email: user.email,
        dob: user.dob,
        state: user.state,
        role: user.role,
        hasVoted: user.hasVoted,
        votedCandidateId: user.votedCandidateId,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

/**
 * GET /api/auth/me
 * Protected — Get current logged-in user
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('votedCandidateId', 'candidateId name party partyColor partyShort');

    res.json({
      success: true,
      user: {
        _id: user._id,
        voterId: user.voterId,
        name: user.name,
        email: user.email,
        dob: user.dob,
        state: user.state,
        role: user.role,
        hasVoted: user.hasVoted,
        votedCandidateId: user.votedCandidateId,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch user' });
  }
};

module.exports = { register, login, getMe };
