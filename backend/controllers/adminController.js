// controllers/adminController.js

const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const ActivityLog = require('../models/ActivityLog');
const Election = require('../models/Election');

/**
 * GET /api/admin/stats
 * Admin — Dashboard overview stats
 */
const getStats = async (req, res) => {
  try {
    const [registeredVoters, candidates, election] = await Promise.all([
      User.countDocuments({ role: 'voter' }),
      Candidate.find({ isActive: true }).sort({ voteCount: -1 }),
      Election.findOne({ isActive: true }),
    ]);

    const totalVotesCast = candidates.reduce((sum, c) => sum + c.voteCount, 0);
    const totalRegistered = election?.totalRegistered || 248750;
    const turnout = totalVotesCast > 0
      ? ((totalVotesCast / totalRegistered) * 100).toFixed(1)
      : '0.0';

    res.json({
      success: true,
      stats: {
        registeredVoters: totalRegistered,
        totalVotesCast,
        activePolls: election ? 1 : 0,
        systemStatus: 'Operational',
        turnout,
        candidatesCount: candidates.length,
      },
      candidates,
      total: totalVotesCast,
      turnout,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
};

/**
 * GET /api/admin/activity
 * Admin — Recent activity log (last 50 entries)
 */
const getActivityLog = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(50);

    // Shape to match what frontend expects: { action, user, time, status }
    const activity = logs.map(log => ({
      action: log.action,
      user: log.user,
      time: new Date(log.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: log.status,
    }));

    res.json({ success: true, activity });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch activity log' });
  }
};

/**
 * GET /api/admin/voters
 * Admin — List all registered voters
 */
const getVoters = async (req, res) => {
  try {
    const voters = await User.find({ role: 'voter' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, voters, total: voters.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch voters' });
  }
};

/**
 * GET /api/admin/export
 * Admin — Export results as JSON (frontend converts to CSV)
 */
const exportResults = async (req, res) => {
  try {
    const candidates = await Candidate.find({ isActive: true }).sort({ voteCount: -1 });
    const total = candidates.reduce((sum, c) => sum + c.voteCount, 0);

    const rows = candidates.map((c, i) => ({
      rank: i + 1,
      name: c.name,
      party: c.party,
      partyShort: c.partyShort,
      state: c.state,
      votes: c.voteCount,
      percentage: total > 0 ? ((c.voteCount / total) * 100).toFixed(2) : '0.00',
    }));

    res.json({ success: true, data: rows, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Export failed' });
  }
};

/**
 * GET /api/admin/election
 * Admin — Get current election info
 */
const getElection = async (req, res) => {
  try {
    const election = await Election.findOne({ isActive: true });
    res.json({ success: true, election });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch election info' });
  }
};

/**
 * PUT /api/admin/election
 * Admin — Update election deadline or title
 */
const updateElection = async (req, res) => {
  try {
    const { title, subtitle, deadline, totalRegistered } = req.body;
    const election = await Election.findOneAndUpdate(
      { isActive: true },
      { title, subtitle, deadline, totalRegistered },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, election });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update election' });
  }
};

/**
 * POST /api/admin/candidates
 * Admin — Add a new candidate
 */


const addCandidate = async (req, res) => {
  try {
    const io = req.app.get("io"); // 🔥 real-time

    const {
      candidateId,
      name,
      party,
      partyShort,
      age,
      state,
      position,
      partyColor,
      bgColor
    } = req.body;

    // check duplicate
    const exists = await Candidate.findOne({ candidateId });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Candidate already exists"
      });
    }

    // create candidate
    const candidate = await Candidate.create({
      candidateId,
      name,
      party,
      partyShort,
      age,
      state,
      position,
      partyColor,
      bgColor,
      voteCount: 0,
      isActive: true
    });

    // 🔥 realtime update
    const candidates = await Candidate.find({ isActive: true });
    io.emit("voteUpdate", candidates);

    res.status(201).json({
      success: true,
      message: "Candidate added successfully",
      candidate
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



/**
 * PUT /api/admin/candidates/:candidateId
 * Admin — Update candidate info (not vote count)
 */
const updateCandidate = async (req, res) => {
  try {
    const io = req.app.get("io"); // 🔥 ADD

    const { name, party, partyColor, partyShort, position, age, state, bio, platform, isActive } = req.body;

    const candidate = await Candidate.findOneAndUpdate(
      { candidateId: req.params.candidateId },
      { name, party, partyColor, partyShort, position, age, state, bio, platform, isActive },
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // 🔥 REAL-TIME UPDATE
    const candidates = await Candidate.find({ isActive: true });
    io.emit("voteUpdate", candidates);

    await ActivityLog.create({
      action: `Candidate updated: ${candidate.name}`,
      user: req.user.voterId,
      status: 'success'
    });

    res.json({ success: true, candidate });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update candidate' });
  }
};

/**
 * DELETE /api/admin/candidates/:candidateId
 * Admin — Soft-delete candidate (sets isActive=false)
 */
const deleteCandidate = async (req, res) => {
  try {
    const io = req.app.get("io"); // 🔥 ADD

    const candidate = await Candidate.findOneAndUpdate(
      { candidateId: req.params.candidateId },
      { isActive: false },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // 🔥 REAL-TIME UPDATE
    const candidates = await Candidate.find({ isActive: true });
    io.emit("voteUpdate", candidates);

    await ActivityLog.create({
      action: `Candidate removed: ${candidate.name}`,
      user: req.user.voterId,
      status: 'success'
    });

    res.json({ success: true, message: 'Candidate deactivated' });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete candidate' });
  }
};

module.exports = {
  getStats,
  getActivityLog,
  getVoters,
  exportResults,
  getElection,
  updateElection,
  addCandidate,
  updateCandidate,
  deleteCandidate,
};
