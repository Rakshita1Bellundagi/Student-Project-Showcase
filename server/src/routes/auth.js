const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database');
const { generateToken, requireAdminAuth } = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Admin credentials verification
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = db.prepare('SELECT id, email, password_hash, name, role FROM users WHERE LOWER(email) = ?').get(email.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or credentials.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password.'
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error during admin login:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
});

/**
 * GET /api/auth/me
 * Validate current token
 */
router.get('/me', requireAdminAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
});

module.exports = router;
