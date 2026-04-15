// routes/voteRoutes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { castVote, getVoteStatus, getResults } = require('../controllers/voteController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// POST /api/votes/cast
router.post(
  '/cast',
  protect,
  [body('candidateId').notEmpty().withMessage('Candidate ID is required')],
  validate,
  castVote
);

// GET /api/votes/status  — has current user voted?
router.get('/status', protect, getVoteStatus);

// GET /api/votes/results — public results (for results page)
router.get('/results', protect, getResults);

module.exports = router;
