/**
 * API client for Student Project Showcase Portal
 */

const API_BASE = '/api';

export async function fetchPublicProjects({ search = '', tag = '', sort = 'newest' } = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.append('search', search.trim());
  if (tag.trim()) params.append('tag', tag.trim());
  if (sort) params.append('sort', sort);

  const res = await fetch(`${API_BASE}/projects?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch public projects');
  return data;
}

export async function fetchProjectDetails(id) {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load project details');
  return data.project;
}

export async function fetchTags() {
  const res = await fetch(`${API_BASE}/tags`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch tags');
  return data.tags || [];
}

export async function submitProject(formData) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || 'Submission failed');
    error.errors = data.errors || {};
    throw error;
  }
  return data;
}

export async function loginAdmin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Authentication failed');
  return data;
}

export async function verifyAdminToken(token) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user;
}

export async function fetchAdminStats(token) {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');
  return data.stats;
}

export async function fetchAdminProjects(token, { status = 'all', search = '' } = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  if (search.trim()) params.append('search', search.trim());

  const res = await fetch(`${API_BASE}/admin/projects?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch admin projects');
  return data.projects || [];
}

export async function updateProjectStatus(token, id, status, admin_notes = '') {
  const res = await fetch(`${API_BASE}/admin/projects/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status, admin_notes })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update project status');
  return data;
}

export async function deleteProject(token, id) {
  const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete project');
  return data;
}
