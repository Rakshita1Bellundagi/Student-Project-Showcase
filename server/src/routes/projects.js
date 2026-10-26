const express = require('express');
const router = express.Router();
const db = require('../database');
const { validateProjectSubmission } = require('../validation');

// Helper to safely parse tags JSON
function parseTags(tagsStr) {
  try {
    return JSON.parse(tagsStr);
  } catch (_) {
    return [];
  }
}

/**
 * POST /api/projects
 * Public project submission
 * FR-01, TC-01, TC-02, TC-03
 */
router.post('/projects', (req, res) => {
  try {
    const { isValid, errors, cleanedData } = validateProjectSubmission(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please correct the highlighted fields.',
        errors
      });
    }

    const projectId = 'proj_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const now = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO projects (id, title, student_name, description, tags, github_url, demo_url, status, admin_notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', null, ?, ?)
    `);

    insert.run(
      projectId,
      cleanedData.title,
      cleanedData.student_name,
      cleanedData.description,
      JSON.stringify(cleanedData.tags),
      cleanedData.github_url,
      cleanedData.demo_url,
      now,
      now
    );

    return res.status(201).json({
      success: true,
      message: 'Project submitted successfully! It is now pending administrator review before appearing in the public gallery.',
      project: {
        id: projectId,
        title: cleanedData.title,
        student_name: cleanedData.student_name,
        status: 'pending',
        created_at: now
      }
    });
  } catch (err) {
    console.error('Error creating project submission:', err);
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred while processing your submission.'
    });
  }
});

/**
 * GET /api/projects
 * Public gallery of APPROVED projects only
 * Supports search and tag filters reactively
 * FR-02, FR-03, FR-07, FR-09, TC-04, TC-07, TC-08, TC-09
 */
router.get('/projects', (req, res) => {
  try {
    const { search, tag, tags, sort } = req.query;

    // Build query with STRICT status = 'approved' rule
    let query = `SELECT id, title, student_name, description, tags, github_url, demo_url, status, created_at, updated_at 
                 FROM projects 
                 WHERE status = 'approved'`;
    const params = [];

    // Search filter (title & description)
    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      query += ` AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(student_name) LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Sort options
    if (sort === 'title') {
      query += ` ORDER BY title ASC`;
    } else if (sort === 'oldest') {
      query += ` ORDER BY created_at ASC`;
    } else {
      // Default: newest first
      query += ` ORDER BY created_at DESC`;
    }

    const rows = db.prepare(query).all(...params);

    // Filter by tags in memory or query
    const targetTags = [];
    if (tag && tag.trim()) targetTags.push(tag.trim().toLowerCase());
    if (tags) {
      const splitTags = Array.isArray(tags) ? tags : tags.split(',');
      splitTags.forEach(t => {
        if (t.trim()) targetTags.push(t.trim().toLowerCase());
      });
    }

    const formattedProjects = rows
      .map(row => ({
        ...row,
        tags: parseTags(row.tags)
      }))
      .filter(project => {
        if (targetTags.length === 0) return true;
        // Project must contain all selected tags (or any depending on filter)
        const projectLowerTags = project.tags.map(t => t.toLowerCase());
        return targetTags.some(selectedTag => projectLowerTags.includes(selectedTag));
      });

    return res.status(200).json({
      success: true,
      count: formattedProjects.length,
      projects: formattedProjects
    });
  } catch (err) {
    console.error('Error fetching public projects:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve projects from gallery.'
    });
  }
});

/**
 * GET /api/projects/:id
 * Public, approved only! (FR-02, FR-07)
 */
router.get('/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const project = db.prepare('SELECT id, title, student_name, description, tags, github_url, demo_url, status, created_at, updated_at FROM projects WHERE id = ?').get(id);

    if (!project || project.status !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Project not found or not currently publicly published.'
      });
    }

    return res.status(200).json({
      success: true,
      project: {
        ...project,
        tags: parseTags(project.tags)
      }
    });
  } catch (err) {
    console.error('Error fetching single project:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve project details.'
    });
  }
});

/**
 * GET /api/tags
 * Returns list of distinct tags across APPROVED projects with counts
 */
router.get('/tags', (req, res) => {
  try {
    const rows = db.prepare(`SELECT tags FROM projects WHERE status = 'approved'`).all();
    const tagCounts = {};

    rows.forEach(row => {
      const parsed = parseTags(row.tags);
      parsed.forEach(t => {
        const normalized = t.trim();
        if (normalized) {
          tagCounts[normalized] = (tagCounts[normalized] || 0) + 1;
        }
      });
    });

    const tagList = Object.keys(tagCounts)
      .map(tag => ({ name: tag, count: tagCounts[tag] }))
      .sort((a, b) => b.count - a.count);

    return res.status(200).json({
      success: true,
      tags: tagList
    });
  } catch (err) {
    console.error('Error fetching tags:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load technology tags.'
    });
  }
});

module.exports = router;
