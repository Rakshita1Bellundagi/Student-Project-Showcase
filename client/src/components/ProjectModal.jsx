import React, { useState, useEffect } from 'react';
import { 
  X, ExternalLink, Calendar, User, Tag, CheckCircle2, 
  ShieldCheck, Copy, Check, Terminal, Share2, BookOpen, Sparkles
} from 'lucide-react';
import { GithubIcon } from './Icons';

export default function ProjectModal({ project, onClose, onTagClick }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'code' | 'share'
  const [copiedClone, setCopiedClone] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  const { id, title, student_name, description, tags = [], github_url, demo_url, created_at, status, admin_notes } = project;

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recently';

  const shareUrl = `${window.location.origin}/?project=${id}`;
  const cloneCommand = github_url ? `git clone ${github_url}.git` : '';
  const projectYear = created_at ? new Date(created_at).getFullYear() : 2026;
  const citationText = `${student_name} (${projectYear}). "${title}" — CodeNova Student Showcase Portal. Available at: ${github_url || shareUrl}`;

  const handleCopyClone = () => {
    if (!cloneCommand) return;
    navigator.clipboard.writeText(cloneCommand);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(citationText);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const handleTagBadgeClick = (tag) => {
    if (onTagClick) {
      onTagClick(tag);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="status-row">
              <span className={`badge badge-${status || 'approved'}`}>
                {status === 'approved' && <CheckCircle2 size={12} />}
                {status === 'pending' && <span className="pulsing-dot" />}
                {status || 'approved'}
              </span>
              <span className="modal-date">
                <Calendar size={13} />
                Submitted on {formattedDate}
              </span>
            </div>
            <h2 className="modal-heading">{title}</h2>
            <div className="modal-author">
              <User size={15} />
              <span>Created by <strong>{student_name}</strong></span>
            </div>
          </div>

          <button 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-tabs-bar">
          <button 
            className={`modal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BookOpen size={15} />
            <span>Overview</span>
          </button>

          <button 
            className={`modal-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            <Terminal size={15} />
            <span>Code & Clone</span>
          </button>

          <button 
            className={`modal-tab-btn ${activeTab === 'share' ? 'active' : ''}`}
            onClick={() => setActiveTab('share')}
          >
            <Share2 size={15} />
            <span>Share & Citation</span>
          </button>
        </div>

        {/* Body based on tab */}
        <div className="modal-body">
          {activeTab === 'overview' && (
            <>
              <div className="modal-section">
                <h4 className="section-label">Project Overview & Architecture</h4>
                <p className="modal-full-desc">{description}</p>
              </div>

              <div className="modal-section">
                <h4 className="section-label">
                  <Tag size={15} />
                  Technologies & Frameworks
                </h4>
                <div className="modal-tags">
                  {tags.map((tag, idx) => (
                    <button 
                      key={idx} 
                      className="tech-tag modal-tag-item modal-tag-clickable"
                      onClick={() => handleTagBadgeClick(tag)}
                      title={`Filter gallery by #${tag}`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {admin_notes && (
                <div className="modal-admin-note">
                  <ShieldCheck size={18} className="text-primary" />
                  <div>
                    <strong>Moderator Audit Note:</strong>
                    <p>{admin_notes}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'code' && (
            <div className="modal-code-tab">
              <div className="modal-section">
                <h4 className="section-label">
                  <Terminal size={15} />
                  Clone Repository via Git CLI
                </h4>
                <div className="terminal-code-block">
                  <div className="terminal-header">
                    <div className="terminal-dots">
                      <span className="dot dot-red" />
                      <span className="dot dot-yellow" />
                      <span className="dot dot-green" />
                    </div>
                    <span className="terminal-title">bash — clone repository</span>
                    <button 
                      className="copy-code-btn"
                      onClick={handleCopyClone}
                      title="Copy clone command"
                    >
                      {copiedClone ? (
                        <>
                          <Check size={14} className="text-emerald" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="terminal-code">
                    <code>{cloneCommand || 'Repository URL unavailable'}</code>
                  </pre>
                </div>
              </div>

              <div className="repo-metadata-grid">
                <div className="repo-meta-card">
                  <span className="repo-meta-label">Git Host</span>
                  <span className="repo-meta-value">GitHub</span>
                </div>
                <div className="repo-meta-card">
                  <span className="repo-meta-label">Target Branch</span>
                  <span className="repo-meta-value">main</span>
                </div>
                <div className="repo-meta-card">
                  <span className="repo-meta-label">Verification</span>
                  <span className="repo-meta-value text-emerald">Verified Active</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="modal-share-tab">
              <div className="modal-section">
                <h4 className="section-label">
                  <Share2 size={15} />
                  Direct Showcase Link
                </h4>
                <div className="share-link-box">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl} 
                    className="share-link-input"
                  />
                  <button 
                    className="btn-primary btn-copy-link"
                    onClick={handleCopyUrl}
                  >
                    {copiedUrl ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedUrl ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              <div className="modal-section">
                <div className="citation-header-row">
                  <h4 className="section-label">
                    <Sparkles size={15} />
                    Academic & Portfolio Citation
                  </h4>
                  <button 
                    className="copy-citation-btn"
                    onClick={handleCopyCitation}
                  >
                    {copiedCitation ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                    <span>{copiedCitation ? 'Copied' : 'Copy Citation'}</span>
                  </button>
                </div>
                <div className="citation-card">
                  <p>{citationText}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <div className="modal-footer-hint">
            <span className="kbd-shortcut">Esc</span> to dismiss
          </div>

          <div className="modal-footer-buttons">
            {github_url && (
              <a 
                href={github_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-modal-action btn-github"
              >
                <GithubIcon size={17} />
                <span>GitHub Repository</span>
              </a>
            )}

            {demo_url && (
              <a 
                href={demo_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-modal-action btn-primary"
              >
                <ExternalLink size={17} />
                <span>Launch Demo</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
