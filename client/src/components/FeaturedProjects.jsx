import React from 'react';
import { Sparkles, ArrowUpRight, Star, ExternalLink } from 'lucide-react';
import { GithubIcon } from './Icons';
import { getProjectDomain } from '../utils/domains';

export default function FeaturedProjects({ 
  projects = [], 
  onSelectProject, 
  onTagClick,
  favorites = [],
  onToggleFavorite,
  onExploreAll
}) {
  // Ensure Rakshita's Medical Store Billing System is featured first
  const rakshitaProject = projects.find(p => 
    (p.student_name && p.student_name.toLowerCase().includes('rakshita')) ||
    (p.title && p.title.toLowerCase().includes('medical store'))
  );
  const otherProjects = projects.filter(p => p.id !== rakshitaProject?.id);
  const featured = rakshitaProject 
    ? [rakshitaProject, ...otherProjects.slice(0, 2)] 
    : projects.slice(0, 3);

  if (featured.length === 0) return null;

  return (
    <section className="featured-section">
      <div className="section-header-compact">
        <div className="badge-pill featured-badge">
          <Sparkles size={13} className="text-amber" />
          <span>Faculty Spotlight</span>
        </div>
        <h2 className="section-title-large">
          Featured <span className="gradient-text">Student Innovations</span>
        </h2>
        <p className="section-subtitle">
          Handpicked top academic engineering projects recognized for architecture, originality, and impact.
        </p>
      </div>

      <div className="featured-grid">
        {featured.map((project) => {
          const domain = getProjectDomain(project);
          const isFav = favorites.includes(project.id);
          const initials = project.student_name
            ? project.student_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            : 'ST';

          return (
            <div 
              key={project.id} 
              className="featured-card glass-panel"
              onClick={() => onSelectProject && onSelectProject(project)}
            >
              <div className="featured-card-glow" style={{ background: domain.gradient }} />
              
              <div className="featured-card-top">
                <span 
                  className="domain-badge"
                  style={{ 
                    borderColor: `${domain.color}40`,
                    color: domain.color,
                    background: `${domain.color}15`
                  }}
                >
                  <span className="domain-dot" style={{ background: domain.color }} />
                  {domain.shortName}
                </span>

                <button 
                  className={`card-star-btn ${isFav ? 'starred' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleFavorite) onToggleFavorite(project.id);
                  }}
                  title={isFav ? 'Remove from saved' : 'Save project'}
                >
                  <Star 
                    size={16} 
                    fill={isFav ? '#fbbf24' : 'none'} 
                    color={isFav ? '#fbbf24' : 'currentColor'} 
                  />
                </button>
              </div>

              <h3 className="featured-card-title">{project.title}</h3>
              <p className="featured-card-desc">{project.description}</p>

              <div className="featured-card-meta">
                <div className="featured-author">
                  <div className="featured-author-avatar" style={{ background: domain.gradient }}>
                    {initials}
                  </div>
                  <div>
                    <div className="featured-author-name">{project.student_name}</div>
                    <div className="featured-author-role">Student Innovator</div>
                  </div>
                </div>
              </div>

              <div className="featured-card-tags">
                {(project.tags || []).slice(0, 3).map((tag) => (
                  <button
                    key={tag}
                    className="featured-tag-pill"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onTagClick) onTagClick(tag);
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              <div className="featured-card-footer" onClick={(e) => e.stopPropagation()}>
                {project.demo_url && (
                  <a 
                    href={project.demo_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-featured-demo"
                  >
                    <span className="live-demo-beacon" />
                    <span>Live Demo</span>
                    <ExternalLink size={13} />
                  </a>
                )}
                {project.github_url && (
                  <a 
                    href={project.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-featured-code"
                    title="View GitHub Repository"
                  >
                    <GithubIcon size={14} />
                    <span>Code</span>
                  </a>
                )}
                <button 
                  className="btn-featured-view"
                  onClick={() => onSelectProject && onSelectProject(project)}
                >
                  <span>Details</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="featured-bottom-cta">
        <button className="btn-secondary" onClick={onExploreAll}>
          <span>View All Verified Projects in Gallery</span>
          <ArrowUpRight size={15} />
        </button>
      </div>
    </section>
  );
}
