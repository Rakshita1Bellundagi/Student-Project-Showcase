import React, { useState } from 'react';
import { ExternalLink, ArrowUpRight, Calendar, Star, Share2, Check } from 'lucide-react';
import { GithubIcon } from './Icons';

// Generates a consistent pleasant background gradient based on name
function getAvatarGradient(name = '') {
  const gradients = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #3b82f6, #06b6d4)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #ec4899, #8b5cf6)',
    'linear-gradient(135deg, #0ea5e9, #6366f1)'
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return gradients[sum % gradients.length];
}

export default function ProjectCard({ 
  project, 
  onSelectProject, 
  viewMode = 'grid',
  isFavorited = false,
  onToggleFavorite,
  onTagClick,
  onCopyLink
}) {
  const [copied, setCopied] = useState(false);
  const { id, title, student_name, description, tags = [], github_url, demo_url, created_at } = project;

  const initials = student_name
    ? student_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'ST';

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  // Interactive spotlight cursor tracking
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    if (onCopyLink) {
      onCopyLink(project);
    } else {
      const url = `${window.location.origin}/?project=${id}`;
      navigator.clipboard.writeText(url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(id);
    }
  };

  const handleTagClick = (e, tag) => {
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  // Render List View
  if (viewMode === 'list') {
    return (
      <article 
        className="project-card project-card-list"
        id={`project-card-${id}`}
        onMouseMove={handleMouseMove}
        onClick={() => onSelectProject(project)}
      >
        <div className="card-spotlight-glow" />

        <div className="card-list-left">
          <div 
            className="student-avatar avatar-list" 
            style={{ background: getAvatarGradient(student_name) }}
            title={student_name}
          >
            {initials}
          </div>

          <div className="card-list-info">
            <div className="card-list-header">
              <h3 className="project-title-list" title={title}>{title}</h3>
              <span className="card-list-author">by {student_name}</span>
              {formattedDate && (
                <span className="project-date date-list">
                  <Calendar size={11} />
                  {formattedDate}
                </span>
              )}
            </div>
            <p className="project-desc-list">{description}</p>
          </div>
        </div>

        <div className="card-list-right" onClick={(e) => e.stopPropagation()}>
          <div className="project-tags tags-list">
            {tags.slice(0, 3).map((tag, idx) => (
              <button 
                key={idx} 
                className="tech-tag tech-tag-btn"
                onClick={(e) => handleTagClick(e, tag)}
                title={`Filter by #${tag}`}
              >
                #{tag}
              </button>
            ))}
            {tags.length > 3 && (
              <span className="tech-tag tag-more">
                +{tags.length - 3}
              </span>
            )}
          </div>

          <div className="card-list-actions">
            <button 
              className={`icon-action-btn ${isFavorited ? 'favorited' : ''}`}
              onClick={handleStarClick}
              title={isFavorited ? 'Remove from saved' : 'Save project'}
              aria-label="Favorite project"
            >
              <Star size={16} fill={isFavorited ? '#fbbf24' : 'none'} color={isFavorited ? '#fbbf24' : 'currentColor'} />
            </button>

            <button 
              className="icon-action-btn"
              onClick={handleShareClick}
              title={copied ? 'Link copied!' : 'Share project'}
              aria-label="Share link"
            >
              {copied ? <Check size={16} className="text-emerald" /> : <Share2 size={16} />}
            </button>

            {github_url && (
              <a 
                href={github_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="action-btn-compact btn-github"
                title="GitHub Repository"
                id={`btn-github-${id}`}
              >
                <GithubIcon size={14} />
              </a>
            )}

            {demo_url && (
              <a 
                href={demo_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="action-btn-compact btn-demo"
                title="Live Demo"
                id={`btn-demo-${id}`}
              >
                <ExternalLink size={14} />
              </a>
            )}

            <button 
              className="inspect-card-btn"
              onClick={() => onSelectProject(project)}
              title="View full project modal"
              aria-label={`Inspect ${title}`}
            >
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </article>
    );
  }

  // Render Grid View (Default)
  return (
    <article 
      className="project-card" 
      id={`project-card-${id}`}
      onMouseMove={handleMouseMove}
    >
      <div className="card-spotlight-glow" />

      {/* Top Header */}
      <div className="card-header">
        <div className="student-profile">
          <div 
            className="student-avatar" 
            style={{ background: getAvatarGradient(student_name) }}
            title={student_name}
          >
            {initials}
          </div>
          <div className="student-info">
            <span className="student-name">{student_name}</span>
            {formattedDate && (
              <span className="project-date">
                <Calendar size={12} />
                {formattedDate}
              </span>
            )}
          </div>
        </div>

        <div className="card-top-actions">
          <button 
            className={`icon-action-btn ${isFavorited ? 'favorited' : ''}`}
            onClick={handleStarClick}
            title={isFavorited ? 'Remove from saved' : 'Save to favorites'}
            aria-label="Favorite project"
          >
            <Star size={16} fill={isFavorited ? '#fbbf24' : 'none'} color={isFavorited ? '#fbbf24' : 'currentColor'} />
          </button>

          <button 
            className="icon-action-btn"
            onClick={handleShareClick}
            title={copied ? 'Link copied!' : 'Share project link'}
            aria-label="Share link"
          >
            {copied ? <Check size={16} className="text-emerald" /> : <Share2 size={16} />}
          </button>

          <button 
            className="inspect-card-btn"
            onClick={() => onSelectProject(project)}
            title="View detailed project overview"
            aria-label={`Inspect ${title}`}
          >
            <ArrowUpRight size={18} />
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div className="card-body" onClick={() => onSelectProject(project)}>
        <h3 className="project-title" title={title}>{title}</h3>
        <p className="project-desc">{description}</p>
      </div>

      {/* Technology Tags */}
      <div className="project-tags">
        {tags.slice(0, 4).map((tag, idx) => (
          <button 
            key={idx} 
            className="tech-tag tech-tag-btn"
            onClick={(e) => handleTagClick(e, tag)}
            title={`Filter by #${tag}`}
          >
            #{tag}
          </button>
        ))}
        {tags.length > 4 && (
          <span 
            className="tech-tag tag-more"
            onClick={() => onSelectProject(project)}
            title="View all tags in modal"
          >
            +{tags.length - 4} more
          </span>
        )}
      </div>

      {/* Action Links */}
      <div className="card-footer">
        {github_url && (
          <a 
            href={github_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="action-btn btn-github"
            title="Open GitHub Repository"
            id={`btn-github-${id}`}
          >
            <GithubIcon size={16} />
            <span>Repository</span>
          </a>
        )}

        {demo_url && (
          <a 
            href={demo_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="action-btn btn-demo"
            title="Launch Live Demo"
            id={`btn-demo-${id}`}
          >
            <ExternalLink size={16} />
            <span>Live Demo</span>
          </a>
        )}
      </div>
    </article>
  );
}
