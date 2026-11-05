import React, { useState, useEffect } from 'react';
import { 
  User, PlusCircle, CheckCircle2, Clock, AlertTriangle, 
  Trash2, ExternalLink, RefreshCw, MessageSquare, ArrowUpRight,
  ShieldCheck, LogOut, Code2, Sparkles 
} from 'lucide-react';
import { GithubIcon } from './Icons';
import { fetchMySubmissions, deleteMySubmission } from '../api';

export default function StudentDashboard({ 
  token, 
  user, 
  onLogout, 
  onOpenSubmit, 
  onSelectProject, 
  showToast 
}) {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const list = await fetchMySubmissions(token);
      setSubmissions(list);
    } catch (err) {
      showToast(err.message || 'Failed to load your submissions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [token]);

  const handleDelete = async (project) => {
    if (!window.confirm(`Are you sure you want to withdraw "${project.title}"?`)) {
      return;
    }

    setDeletingId(project.id);
    try {
      await deleteMySubmission(token, project.id);
      showToast(`Submission "${project.title}" withdrawn successfully.`, 'info');
      loadSubmissions();
    } catch (err) {
      showToast(err.message || 'Failed to withdraw project.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;

  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

  return (
    <div className="student-dashboard-container">
      {/* Student Profile Header */}
      <div className="student-header-card glass-panel">
        <div className="student-profile-left">
          <div className="student-large-avatar">
            {initials}
          </div>
          <div>
            <div className="student-badge-row">
              <span className="badge-pill student-badge">
                <Sparkles size={13} className="text-primary" />
                <span>Student Developer</span>
              </span>
              <span className="student-email-tag">{user?.email}</span>
            </div>
            <h1 className="student-welcome-title">Welcome, {user?.name}!</h1>
            <p className="student-welcome-sub">
              Manage your project submissions, track faculty review feedback, and monitor your live showcase entries.
            </p>
          </div>
        </div>

        <div className="student-header-actions">
          <button className="btn-primary" onClick={onOpenSubmit}>
            <PlusCircle size={16} />
            <span>Submit New Project</span>
          </button>

          <button className="btn-secondary" onClick={onLogout} title="Sign out of student account">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="student-stats-grid">
        <div className="student-stat-card glass-panel">
          <div className="stat-icon-wrap indigo">
            <Code2 size={20} />
          </div>
          <div>
            <div className="stat-number">{submissions.length}</div>
            <div className="stat-label">Total Submissions</div>
          </div>
        </div>

        <div className="student-stat-card glass-panel">
          <div className="stat-icon-wrap emerald">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="stat-number text-emerald">{approvedCount}</div>
            <div className="stat-label">Published & Live</div>
          </div>
        </div>

        <div className="student-stat-card glass-panel">
          <div className="stat-icon-wrap amber">
            <Clock size={20} />
          </div>
          <div>
            <div className="stat-number text-amber">{pendingCount}</div>
            <div className="stat-label">Under Review</div>
          </div>
        </div>

        <div className="student-stat-card glass-panel">
          <div className="stat-icon-wrap rose">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="stat-number text-rose">{rejectedCount}</div>
            <div className="stat-label">Needs Revision</div>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <section className="student-submissions-section">
        <div className="submissions-section-header">
          <div>
            <h2 className="section-title">Your Project Portfolio</h2>
            <p className="section-subtitle">Real-time status of all projects you have submitted to Project Showcase.</p>
          </div>
          <button className="btn-secondary btn-refresh" onClick={loadSubmissions} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div className="submissions-loading glass-panel">
            <span>Loading your project portfolio...</span>
          </div>
        ) : submissions.length === 0 ? (
          <div className="empty-submissions glass-panel">
            <div className="empty-icon-wrap">
              <Code2 size={40} />
            </div>
            <h3>No Submissions Found Yet</h3>
            <p>You haven't submitted any projects under your account. Publish your capstone, hackathon project, or research prototype today!</p>
            <button className="btn-primary" onClick={onOpenSubmit}>
              <PlusCircle size={16} />
              <span>Submit Your First Project</span>
            </button>
          </div>
        ) : (
          <div className="student-submissions-grid">
            {submissions.map((project) => {
              const isApproved = project.status === 'approved';
              const isPending = project.status === 'pending';
              const isRejected = project.status === 'rejected';

              return (
                <div key={project.id} className="student-project-card glass-panel">
                  {/* Status Banner */}
                  <div className="student-card-status-row">
                    {isApproved && (
                      <span className="status-badge-pill status-approved">
                        <CheckCircle2 size={13} />
                        <span>Approved & Live on Showcase</span>
                      </span>
                    )}
                    {isPending && (
                      <span className="status-badge-pill status-pending">
                        <Clock size={13} />
                        <span>Pending Faculty Moderation</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="status-badge-pill status-rejected">
                        <AlertTriangle size={13} />
                        <span>Revision Requested</span>
                      </span>
                    )}

                    <span className="student-card-date">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="student-card-title">{project.title}</h3>
                  <p className="student-card-desc">{project.description}</p>

                  {/* Tags */}
                  <div className="student-card-tags">
                    {(project.tags || []).map(t => (
                      <span key={t} className="student-tag">#{t}</span>
                    ))}
                  </div>

                  {/* Feedback Note if present */}
                  {project.admin_notes && (
                    <div className="student-feedback-box">
                      <div className="feedback-header">
                        <MessageSquare size={14} className="text-amber" />
                        <span>Moderator Feedback:</span>
                      </div>
                      <p className="feedback-text">{project.admin_notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="student-card-footer">
                    <div className="student-card-links">
                      {project.github_url && (
                        <a 
                          href={project.github_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn-card-link"
                          title="View Repository"
                        >
                          <GithubIcon size={14} />
                          <span>Code</span>
                        </a>
                      )}
                      {project.demo_url && (
                        <a 
                          href={project.demo_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn-card-link"
                          title="Open Live Demonstration"
                        >
                          <ExternalLink size={14} />
                          <span>Live Demo</span>
                        </a>
                      )}
                      <button 
                        className="btn-card-link" 
                        onClick={() => onSelectProject && onSelectProject(project)}
                        title="Inspect full modal view"
                      >
                        <ArrowUpRight size={14} />
                        <span>Inspect</span>
                      </button>
                    </div>

                    {!isApproved && (
                      <button 
                        className="btn-withdraw-sub" 
                        onClick={() => handleDelete(project)}
                        disabled={deletingId === project.id}
                        title="Withdraw and remove this submission"
                      >
                        <Trash2 size={14} />
                        <span>Withdraw</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

