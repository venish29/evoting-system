// routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getStats,
  getActivityLog,
  getVoters,
  exportResults,
  getElection,
  updateElection,
  addCandidate,
  updateCandidate,
  deleteCandidate,
} = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// GET /api/admin/stats
router.get('/stats', getStats);

// GET /api/admin/activity
router.get('/activity', getActivityLog);

// GET /api/admin/voters
router.get('/voters', getVoters);

// GET /api/admin/export
router.get('/export', exportResults);

// GET  /api/admin/election
// PUT  /api/admin/election
router.get('/election', getElection);
router.put('/election', updateElection);

// POST   /api/admin/candidates
// PUT    /api/admin/candidates/:candidateId
// DELETE /api/admin/candidates/:candidateId
router.post('/candidates', addCandidate);
router.put('/candidates/:candidateId', updateCandidate);
router.delete('/candidates/:candidateId', deleteCandidate);

module.exports = router;
