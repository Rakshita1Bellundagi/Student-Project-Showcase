const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAdminAuth } = require('../middleware/auth');

// Helper to safely parse tags JSON
function parseTags(tagsStr) {
  try {
    return JSON.parse(tagsStr);
  } catch (_) {
    return [];
  }
}

// Protect all routes in this router with requireAdminAuth (FR-04, TC-10)
router.use(requireAdminAuth);

/**
 * GET /api/admin/stats
 * Summary counts for admin dashboard
 */
router.get('/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as c FROM projects').get().c;
    const pending = db.prepare(`SELECT COUNT(*) as c FROM projects WHERE status = 'pending'`).get().c;
    const approved = db.prepare(`SELECT COUNT(*) as c FROM projects WHERE status = 'approved'`).get().c;
    const rejected = db.prepare(`SELECT COUNT(*) as c FROM projects WHERE status = 'rejected'`).get().c;

    return res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected
      }
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
});

/**
 * GET /api/admin/projects
 * List all submissions (pending, approved, rejected)
 * FR-04, FR-05
 */
router.get('/projects', (req, res) => {
  try {
    const { status, search } = req.query;

    let query = `SELECT id, title, student_name, description, tags, github_url, demo_url, status, admin_notes, created_at, updated_at FROM projects`;
    const params = [];
    const conditions = [];

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search && search.trim()) {
      conditions.push('(LOWER(title) LIKE ? OR LOWER(student_name) LIKE ? OR LOWER(description) LIKE ?)');
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Pending projects prioritized at top, then newest created
    query += ` ORDER BY 
      CASE WHEN status = 'pending' THEN 0 
           WHEN status = 'approved' THEN 1 
           ELSE 2 END ASC,
      created_at DESC`;

    const rows = db.prepare(query).all(...params);

    const projects = rows.map(r => ({
      ...r,
      tags: parseTags(r.tags)
    }));

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (err) {
    console.error('Error fetching admin projects:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin project submissions' });
  }
});

/**
 * PATCH /api/admin/projects/:id/status
 * Approve or Reject project
 * FR-06, TC-05, TC-06
 */
router.patch('/projects/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be "approved", "rejected", or "pending".'
      });
    }

    const existing = db.prepare('SELECT id, title, status FROM projects WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Project submission not found.'
      });
    }

    const now = new Date().toISOString();
    const update = db.prepare(`
      UPDATE projects 
      SET status = ?, admin_notes = COALESCE(?, admin_notes), updated_at = ?
      WHERE id = ?
    `);

    update.run(status, admin_notes !== undefined ? admin_notes : null, now, id);

    const updatedProject = db.prepare('SELECT id, title, student_name, description, tags, github_url, demo_url, status, admin_notes, created_at, updated_at FROM projects WHERE id = ?').get(id);

    return res.status(200).json({
      success: true,
      message: `Project status successfully updated to ${status}.`,
      project: {
        ...updatedProject,
        tags: parseTags(updatedProject.tags)
      }
    });
  } catch (err) {
    console.error('Error updating project status:', err);
    return res.status(500).json({ success: false, message: 'Failed to update project status' });
  }
});

/**
 * DELETE /api/admin/projects/:id
 * Delete a submission
 */
router.delete('/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id, title FROM projects WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    db.prepare('DELETE FROM projects WHERE id = ?').run(id);

    return res.status(200).json({
      success: true,
      message: `Project "${existing.title}" was permanently removed.`
    });
  } catch (err) {
    console.error('Error deleting project:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
});

module.exports = router;
