// routes/profileRoutes.js

const express = require('express');
const router = express.Router();
const { getProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

// GET /api/profile
router.get('/', protect, getProfile);

module.exports = router;
