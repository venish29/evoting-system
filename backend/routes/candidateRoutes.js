// routes/candidateRoutes.js

const express = require('express');
const router = express.Router();
const { getCandidates, getCandidateById } = require('../controllers/candidateController');
const { protect } = require('../middleware/auth');

// GET /api/candidates?search=...
router.get('/', protect, getCandidates);

// GET /api/candidates/:candidateId
router.get('/:candidateId', protect, getCandidateById);

module.exports = router;
