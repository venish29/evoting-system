// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// POST /api/auth/register
router.post(
  '/register',
  [
    body('voterId').notEmpty().withMessage('Voter ID is required'),
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
      .matches(/[0-9]/).withMessage('Password must contain a number'),
    body('dob').notEmpty().withMessage('Date of birth is required'),
    body('state').notEmpty().withMessage('State is required'),
  ],
  validate,
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('voterId').notEmpty().withMessage('Voter ID is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
