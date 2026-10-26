/**
 * Validation utilities for Student Project Showcase Portal
 * Strictly adheres to PRD FR-01, FR-08, TC-02, TC-03
 */

function isValidHttpUrl(string) {
  try {
    const url = new URL(string.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function isValidGitHubUrl(string) {
  if (!isValidHttpUrl(string)) return false;
  try {
    const url = new URL(string.trim());
    const hostname = url.hostname.toLowerCase();
    const isGitHubHost = hostname === 'github.com' || hostname === 'www.github.com';
    if (!isGitHubHost) return false;
    
    // Path must contain at least /username (and usually /username/repo)
    const pathParts = url.pathname.split('/').filter(Boolean);
    return pathParts.length >= 1;
  } catch (_) {
    return false;
  }
}

function validateProjectSubmission(data) {
  const errors = {};

  // Title validation
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    errors.title = 'Project title is required.';
  } else if (data.title.trim().length < 3) {
    errors.title = 'Project title must be at least 3 characters.';
  } else if (data.title.trim().length > 150) {
    errors.title = 'Project title cannot exceed 150 characters.';
  }

  // Student Name validation
  if (!data.student_name || typeof data.student_name !== 'string' || !data.student_name.trim()) {
    errors.student_name = 'Student name is required.';
  } else if (data.student_name.trim().length < 2) {
    errors.student_name = 'Student name must be at least 2 characters.';
  } else if (data.student_name.trim().length > 100) {
    errors.student_name = 'Student name cannot exceed 100 characters.';
  }

  // Description validation
  if (!data.description || typeof data.description !== 'string' || !data.description.trim()) {
    errors.description = 'Project description is required.';
  } else if (data.description.trim().length < 15) {
    errors.description = 'Please provide a more descriptive summary (at least 15 characters).';
  } else if (data.description.trim().length > 3000) {
    errors.description = 'Description cannot exceed 3000 characters.';
  }

  // Technology Tags validation
  let tags = [];
  if (Array.isArray(data.tags)) {
    tags = data.tags.map(t => String(t).trim()).filter(Boolean);
  } else if (typeof data.tags === 'string') {
    tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
  }

  if (tags.length === 0) {
    errors.tags = 'At least one technology tag is required (e.g. React, Node.js, Python).';
  } else if (tags.length > 10) {
    errors.tags = 'You can specify at most 10 tags.';
  }

  // GitHub URL validation (FR-08, TC-03)
  if (!data.github_url || typeof data.github_url !== 'string' || !data.github_url.trim()) {
    errors.github_url = 'GitHub repository URL is required.';
  } else if (!isValidGitHubUrl(data.github_url)) {
    errors.github_url = 'Must be a valid GitHub URL pointing to github.com (e.g. https://github.com/username/repo).';
  }

  // Live Demo URL validation (FR-08)
  if (!data.demo_url || typeof data.demo_url !== 'string' || !data.demo_url.trim()) {
    errors.demo_url = 'Live demo URL is required.';
  } else if (!isValidHttpUrl(data.demo_url)) {
    errors.demo_url = 'Must be a valid HTTP or HTTPS web address (e.g. https://myproject.vercel.app).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleanedData: {
      title: data.title ? data.title.trim() : '',
      student_name: data.student_name ? data.student_name.trim() : '',
      description: data.description ? data.description.trim() : '',
      tags: tags,
      github_url: data.github_url ? data.github_url.trim() : '',
      demo_url: data.demo_url ? data.demo_url.trim() : ''
    }
  };
}

module.exports = {
  isValidHttpUrl,
  isValidGitHubUrl,
  validateProjectSubmission
};
