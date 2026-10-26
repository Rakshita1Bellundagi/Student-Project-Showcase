import React, { useState, useEffect } from 'react';
import { 
  Shield, Check, X, Trash2, ExternalLink, Search, 
  RefreshCw, LogOut, AlertTriangle, Eye, MessageSquare, 
  CheckCircle, Clock, XCircle, Download, Sparkles
} from 'lucide-react';
import { GithubIcon } from './Icons';
import { fetchAdminProjects, fetchAdminStats, updateProjectStatus, deleteProject } from '../api';

const REJECTION_PRESETS = [
  'Missing comprehensive README or local execution instructions.',
  'Live demonstration URL is unreachable or returning HTTP errors.',
  'GitHub repository appears private or contains incomplete source files.',
  'Submission does not meet code quality or project guidelines.'
];

export default function AdminDashboard({ token, adminUser, onLogout, onSelectProject, showToast, onStatusChange }) {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [activeStatusTab, setActiveStatusTab] = useState('pending'); // PRD: Pending submissions visible first
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [rejectModalData, setRejectModalData] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projectsList, statsData] = await Promise.all([
        fetchAdminProjects(token, { status: activeStatusTab, search: searchQuery }),
        fetchAdminStats(token)
      ]);
      setProjects(projectsList);
      setStats(statsData);
    } catch (err) {
      showToast(err.message || 'Failed to load moderation data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeStatusTab, searchQuery]);

  const handleApprove = async (project) => {
    setActionInProgress(project.id);
    try {
      await updateProjectStatus(token, project.id, 'approved', 'Approved by administrator for public showcase.');
      showToast(`Project "${project.title}" approved and published to public gallery!`, 'success');
      loadData();
      if (onStatusChange) onStatusChange();
    } catch (err) {
      showToast(err.message || 'Failed to approve project', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleOpenRejectModal = (project) => {
    setRejectModalData(project);
    setRejectReason(project.admin_notes || REJECTION_PRESETS[0]);
  };

  const handleConfirmReject = async () => {
    if (!rejectModalData) return;
    setActionInProgress(rejectModalData.id);
    try {
      await updateProjectStatus(token, rejectModalData.id, 'rejected', rejectReason);
      showToast(`Project "${rejectModalData.title}" rejected and hidden from public gallery.`, 'info');
      setRejectModalData(null);
      loadData();
      if (onStatusChange) onStatusChange();
    } catch (err) {
      showToast(err.message || 'Failed to reject project', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${project.title}"?`)) {
      return;
    }
    setActionInProgress(project.id);
    try {
      await deleteProject(token, project.id);
      showToast(`Project deleted successfully.`, 'info');
      loadData();
      if (onStatusChange) onStatusChange();
    } catch (err) {
      showToast(err.message || 'Failed to delete project', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // Export submissions to CSV for faculty/evaluation records
  const handleExportCSV = () => {
    if (!projects || projects.length === 0) {
      showToast('No projects available to export in the current view.', 'warning');
      return;
    }

    const headers = ['ID', 'Title', 'Student Name', 'Status', 'Tags', 'GitHub URL', 'Demo URL', 'Created At', 'Admin Notes'];
    const rows = projects.map(p => [
      `"${p.id}"`,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${(p.student_name || '').replace(/"/g, '""')}"`,
      `"${p.status}"`,
      `"${(p.tags || []).join('; ')}"`,
      `"${p.github_url || ''}"`,
      `"${p.demo_url || ''}"`,
      `"${p.created_at || ''}"`,
      `"${(p.admin_notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `codenova_showcase_export_${activeStatusTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${projects.length} submissions to CSV!`, 'success');
  };

  // Calculate approval rate
  const decidedCount = (stats.approved || 0) + (stats.rejected || 0);
  const approvalRate = decidedCount > 0 ? Math.round(((stats.approved || 0) / decidedCount) * 100) : 100;

  return (
    <div className="admin-dashboard-container">
      {/* Top Header */}
      <div className="admin-header glass-panel">
        <div className="admin-profile-info">
          <div className="admin-avatar-badge">
            <Shield size={22} className="text-primary" />
          </div>
          <div>
            <div className="admin-role-tag">
              <span>Authorized Administrator</span>
              <span className="approval-rate-pill">Approval Rate: {approvalRate}%</span>
            </div>
            <h2 className="admin-welcome-name">{adminUser?.name || 'Moderator'} ({adminUser?.email})</h2>
          </div>
        </div>

        <div className="admin-header-actions">
          <button 
            className="btn-admin-export"
            onClick={handleExportCSV}
            title="Download CSV report of current submissions"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          <button 
            className="btn-admin-refresh" 
            onClick={loadData}
            title="Refresh submissions"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>

          <button 
            className="btn-admin-logout"
            onClick={onLogout}
            title="Log out of admin session"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="admin-stats-grid">
        <div 
          className={`stat-card ${activeStatusTab === 'pending' ? 'active-stat-card' : ''}`}
          onClick={() => setActiveStatusTab('pending')}
        >
          <div className="stat-card-top">
            <span className="stat-label">Pending Reviews</span>
            <div className="stat-icon-wrap amber">
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-number stat-amber">
            {stats.pending}
            {stats.pending > 0 && <span className="pulsing-dot" />}
          </div>
          <span className="stat-subtext">Needs administrator decision</span>
        </div>

        <div 
          className={`stat-card ${activeStatusTab === 'approved' ? 'active-stat-card' : ''}`}
          onClick={() => setActiveStatusTab('approved')}
        >
          <div className="stat-card-top">
            <span className="stat-label">Approved Showcase</span>
            <div className="stat-icon-wrap emerald">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="stat-number stat-emerald">{stats.approved}</div>
          <span className="stat-subtext">Visible in public gallery</span>
        </div>

        <div 
          className={`stat-card ${activeStatusTab === 'rejected' ? 'active-stat-card' : ''}`}
          onClick={() => setActiveStatusTab('rejected')}
        >
          <div className="stat-card-top">
            <span className="stat-label">Rejected Submissions</span>
            <div className="stat-icon-wrap rose">
              <XCircle size={18} />
            </div>
          </div>
          <div className="stat-number stat-rose">{stats.rejected}</div>
          <span className="stat-subtext">Hidden from public view</span>
        </div>

        <div 
          className={`stat-card ${activeStatusTab === 'all' ? 'active-stat-card' : ''}`}
          onClick={() => setActiveStatusTab('all')}
        >
          <div className="stat-card-top">
            <span className="stat-label">Total Submissions</span>
            <div className="stat-icon-wrap indigo">
              <Shield size={18} />
            </div>
          </div>
          <div className="stat-number stat-indigo">{stats.total}</div>
          <span className="stat-subtext">All historical submissions</span>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="admin-controls-bar glass-panel">
        <div className="admin-tabs">
          <button 
            id="tab-pending"
            className={`admin-tab-btn ${activeStatusTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveStatusTab('pending')}
          >
            <span>Pending Reviews</span>
            <span className="tab-count-badge badge-pending">{stats.pending}</span>
          </button>

          <button 
            id="tab-approved"
            className={`admin-tab-btn ${activeStatusTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveStatusTab('approved')}
          >
            <span>Approved Showcase</span>
            <span className="tab-count-badge badge-approved">{stats.approved}</span>
          </button>

          <button 
            id="tab-rejected"
            className={`admin-tab-btn ${activeStatusTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveStatusTab('rejected')}
          >
            <span>Rejected</span>
            <span className="tab-count-badge badge-rejected">{stats.rejected}</span>
          </button>

          <button 
            id="tab-all"
            className={`admin-tab-btn ${activeStatusTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveStatusTab('all')}
          >
            <span>All Submissions ({stats.total})</span>
          </button>
        </div>

        <div className="admin-search-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text"
            placeholder="Search by project or student name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
          {searchQuery && (
            <button 
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Submissions List */}
      <div className="admin-submissions-section">
        {isLoading ? (
          <div className="admin-loading-state">
            <div className="pulsing-dot" />
            <span>Loading submissions database...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="admin-empty-state glass-panel">
            <CheckCircle size={40} className="text-secondary" />
            <h3>No submissions found</h3>
            <p>There are no projects currently matching the "{activeStatusTab}" status filter.</p>
          </div>
        ) : (
          <div className="admin-cards-list">
            {projects.map((project) => {
              const isWorking = actionInProgress === project.id;
              const dateStr = new Date(project.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div key={project.id} className="admin-project-item glass-panel" id={`admin-item-${project.id}`}>
                  <div className="admin-item-header">
                    <div className="admin-item-title-col">
                      <div className="admin-item-meta-top">
                        <span className={`badge badge-${project.status}`}>
                          {project.status === 'pending' && <span className="pulsing-dot" />}
                          {project.status}
                        </span>
                        <span className="admin-item-date">Submitted: {dateStr}</span>
                        <span className="admin-item-id">#{project.id.slice(-6)}</span>
                      </div>
                      <h3 className="admin-item-title">{project.title}</h3>
                      <div className="admin-item-student">
                        By <strong>{project.student_name}</strong>
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div className="admin-item-actions">
                      {project.status !== 'approved' && (
                        <button 
                          className="btn-action-approve"
                          onClick={() => handleApprove(project)}
                          disabled={isWorking}
                          title="Approve and publish to public gallery"
                          id={`btn-approve-${project.id}`}
                        >
                          <Check size={16} />
                          <span>Approve</span>
                        </button>
                      )}

                      {project.status !== 'rejected' && (
                        <button 
                          className="btn-action-reject"
                          onClick={() => handleOpenRejectModal(project)}
                          disabled={isWorking}
                          title="Reject submission"
                          id={`btn-reject-${project.id}`}
                        >
                          <X size={16} />
                          <span>Reject</span>
                        </button>
                      )}

                      <button 
                        className="btn-action-inspect"
                        onClick={() => onSelectProject(project)}
                        title="View full project modal"
                      >
                        <Eye size={16} />
                      </button>

                      <button 
                        className="btn-action-delete"
                        onClick={() => handleDelete(project)}
                        disabled={isWorking}
                        title="Delete record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="admin-item-description">{project.description}</p>

                  {/* Tags */}
                  <div className="admin-item-tags">
                    {project.tags.map((tag, idx) => (
                      <span key={idx} className="tech-tag">#{tag}</span>
                    ))}
                  </div>

                  {/* Links Row */}
                  <div className="admin-item-links">
                    <a 
                      href={project.github_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="admin-link-pill"
                      title="Inspect GitHub repository"
                    >
                      <GithubIcon size={14} />
                      <span>{project.github_url.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink size={12} />
                    </a>

                    <a 
                      href={project.demo_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="admin-link-pill pill-demo"
                      title="Test live demo"
                    >
                      <ExternalLink size={14} />
                      <span>{project.demo_url.replace(/^https?:\/\//, '')}</span>
                    </a>
                  </div>

                  {/* Moderator notes */}
                  {project.admin_notes && (
                    <div className="admin-item-note">
                      <MessageSquare size={13} />
                      <span>Moderator Note: {project.admin_notes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Modal with reason input & quick presets */}
      {rejectModalData && (
        <div className="modal-backdrop" onClick={() => setRejectModalData(null)}>
          <div className="reject-modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="admin-title-group">
                <AlertTriangle size={20} className="text-danger" />
                <h3 className="modal-heading">Reject Submission</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setRejectModalData(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p>
                Provide constructive feedback explaining why <strong>"{rejectModalData.title}"</strong> is being rejected. This keeps moderation transparent.
              </p>

              {/* Quick rejection presets */}
              <div className="rejection-presets-box">
                <span className="rejection-presets-label">
                  <Sparkles size={13} /> Quick Presets:
                </span>
                <div className="presets-list">
                  {REJECTION_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="preset-chip"
                      onClick={() => setRejectReason(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Rejection Reason / Feedback Note</label>
                <textarea 
                  rows={3}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="form-textarea"
                  placeholder="Explain why repository or demo did not meet standards..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setRejectModalData(null)}>
                Cancel
              </button>
              <button 
                id="btn-confirm-reject"
                className="btn-danger" 
                onClick={handleConfirmReject}
                disabled={actionInProgress === rejectModalData.id}
              >
                <X size={16} />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
