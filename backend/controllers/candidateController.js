// controllers/candidateController.js

const Candidate = require('../models/Candidate');

/**
 * GET /api/candidates
 * Protected — Get all active candidates (with optional search)
 * Query: ?search=name_or_party_or_state
 */
const getCandidates = async (req, res) => {
  try {
    const { search } = req.query;

    let query = { isActive: true };

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { party: regex },
        { state: regex },
        { partyShort: regex },
      ];
    }

    const candidates = await Candidate.find(query).sort({ voteCount: -1 });

    res.json({ success: true, candidates });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch candidates' });
  }
};

/**
 * GET /api/candidates/:candidateId
 * Protected — Get single candidate by candidateId string (c001, c002…)
 */
const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ candidateId: req.params.candidateId, isActive: true });

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    res.json({ success: true, candidate });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch candidate' });
  }
};

module.exports = { getCandidates, getCandidateById };
