const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database');
const { generateToken, requireAuth } = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Unified credentials verification (Admin or Student)
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
    console.error('Error during login:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
});

/**
 * POST /api/auth/register
 * Student account registration
 */
router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim() || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required (minimum 2 characters).'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Valid email address is required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email format.'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.'
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = 'usr_stu_' + Math.random().toString(36).substring(2, 8) + '_' + Date.now();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, created_at)
      VALUES (?, ?, ?, ?, 'student', ?)
    `).run(userId, cleanEmail, passwordHash, name.trim(), now);

    const newUser = {
      id: userId,
      email: cleanEmail,
      name: name.trim(),
      role: 'student'
    };

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Student account created successfully!',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Error during registration:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during account registration.'
    });
  }
});

/**
 * GET /api/auth/me
 * Validate current token for either student or admin
 */
router.get('/me', requireAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
});

/**
 * GET /api/auth/my-submissions
 * Get submissions for the authenticated student
 */
router.get('/my-submissions', requireAuth, (req, res) => {
  try {
    const studentEmail = req.user.email.toLowerCase();
    const studentName = req.user.name.toLowerCase();

    const submissions = db.prepare(`
      SELECT id, title, student_name, description, tags, github_url, demo_url, status, admin_notes, created_at, updated_at
      FROM projects
      WHERE (student_email IS NOT NULL AND LOWER(student_email) = ?)
         OR LOWER(student_name) = ?
      ORDER BY created_at DESC
    `).all(studentEmail, studentName);

    const formatted = submissions.map(p => {
      let tags = [];
      try { tags = JSON.parse(p.tags); } catch (_) { tags = []; }
      return { ...p, tags };
    });

    return res.status(200).json({
      success: true,
      submissions: formatted
    });
  } catch (err) {
    console.error('Error fetching student submissions:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your submissions.'
    });
  }
});

/**
 * DELETE /api/auth/my-submissions/:id
 * Student can withdraw/delete their own pending or rejected submission
 */
router.delete('/my-submissions/:id', requireAuth, (req, res) => {
  try {
    const projectId = req.params.id;
    const studentEmail = req.user.email.toLowerCase();
    const studentName = req.user.name.toLowerCase();

    const proj = db.prepare('SELECT id, status, student_name, student_email FROM projects WHERE id = ?').get(projectId);
    if (!proj) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    const isOwner = (proj.student_email && proj.student_email.toLowerCase() === studentEmail) ||
                    (proj.student_name && proj.student_name.toLowerCase() === studentName);

    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to withdraw this project.' });
    }

    db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);

    return res.status(200).json({
      success: true,
      message: 'Submission successfully withdrawn and removed.'
    });
  } catch (err) {
    console.error('Error deleting submission:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete submission.'
    });
  }
});

module.exports = router;
