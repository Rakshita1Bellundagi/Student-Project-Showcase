import React, { useState } from 'react';
import { 
  Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Code, Globe2, 
  Layers, Flame, Search, Terminal, Play
} from 'lucide-react';
import { GithubIcon } from './Icons';

const TRENDING_STACKS = ['React', 'Python', 'Machine Learning', 'Next.js', 'FastAPI', 'Docker'];

export default function HeroSection({ 
  onOpenSubmit, 
  onExploreGallery,
  approvedCount = 0, 
  tagCount = 0,
  onSelectTag,
  onQuickSearch,
  featuredProject,
  onSelectProject
}) {
  const [heroSearch, setHeroSearch] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onQuickSearch) {
      onQuickSearch(heroSearch);
    }
  };

  const handleTrendingClick = (tag) => {
    if (onSelectTag) {
      onSelectTag(tag);
    }
  };

  // Fallback spotlight data if no project loaded yet
  const spotlight = featuredProject || {
    id: 'proj_t9jnktw_1792394322176',
    title: 'Medical Store Billing System',
    student_name: 'Rakshita Bellundagi',
    description: 'An intuitive full-stack medical store billing and inventory management platform that reduces manual administrative overhead with fast POS invoicing, stock tracking, and automated summaries.',
    tags: ['Python', 'React', 'Node.js', 'Express'],
    github_url: 'https://github.com/Rakshita1Bellundagi/Samruddi-Med-Pro.git',
    demo_url: 'https://samruddi-med-pro.vercel.app'
  };

  return (
    <section className="hero-section">
      {/* Dynamic ambient background glow orbs */}
      <div className="hero-glow-orb hero-glow-1" />
      <div className="hero-glow-orb hero-glow-2" />
      <div className="hero-glow-orb hero-glow-3" />

      <div className="hero-container-split">
        {/* Left Column: Hero Copy & CTA */}
        <div className="hero-left-col">
          <div className="hero-badge-pill">
            <Sparkles size={14} className="hero-sparkle-icon" />
            <span>Student Project Showcase Portal</span>
            <span className="hero-live-beacon" />
          </div>

          <h1 className="hero-heading">
            Where Student Code Meets <span className="gradient-text">Real-World Impact</span>
          </h1>

          <p className="hero-description">
            Explore a curated gallery of high-impact academic software, AI prototypes, and full-stack applications built by student developers. Every showcase project is verified for engineering excellence.
          </p>

          {/* Instant Hero Search Bar */}
          <form className="hero-search-box glass-panel" onSubmit={handleSearchSubmit}>
            <Search size={18} className="hero-search-icon" />
            <input 
              type="text"
              placeholder="Search by topic, tech, or student (e.g. 'Machine Learning', 'React')..."
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              className="hero-search-input"
            />
            <button type="submit" className="hero-search-btn">
              <span>Explore</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Hero CTA actions */}
          <div className="hero-actions">
            <button 
              id="hero-explore-cta"
              className="btn-primary"
              onClick={onExploreGallery}
            >
              <Layers size={17} />
              <span>Explore Gallery ({approvedCount > 0 ? approvedCount : '12'})</span>
              <ArrowRight size={17} />
            </button>

            <button 
              id="hero-submit-cta"
              className="btn-secondary" 
              onClick={onOpenSubmit}
            >
              <span>Submit Your Project</span>
            </button>
          </div>

          {/* Trending Stacks Quick Filter Bar */}
          <div className="hero-trending-stacks">
            <span className="trending-label">
              <Flame size={14} className="text-amber" />
              <span>Trending Stacks:</span>
            </span>
            <div className="trending-tags-wrap">
              {TRENDING_STACKS.map((tag) => (
                <button
                  key={tag}
                  className="trending-tag-btn"
                  onClick={() => handleTrendingClick(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3D Spotlight Card Preview */}
        <div className="hero-right-col">
          <div className="hero-spotlight-card glass-panel" onClick={() => onSelectProject && onSelectProject(spotlight)}>
            <div className="spotlight-card-glow" />
            
            {/* Mock Window Top Bar */}
            <div className="spotlight-window-header">
              <div className="window-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <div className="spotlight-header-title">
                <span className="spotlight-pulse-dot" />
                <span>Featured Project Spotlight</span>
              </div>
              <span className="spotlight-verified-badge">
                <ShieldCheck size={13} />
                <span>Verified</span>
              </span>
            </div>

            {/* Spotlight Body */}
            <div className="spotlight-card-body">
              <div className="spotlight-author-row">
                <div className="spotlight-avatar">
                  {spotlight.student_name ? spotlight.student_name.slice(0, 2).toUpperCase() : 'AS'}
                </div>
                <div>
                  <h4 className="spotlight-author-name">{spotlight.student_name}</h4>
                  <span className="spotlight-author-sub">Student Engineer · Student Showcase</span>
                </div>
              </div>

              <h3 className="spotlight-title">{spotlight.title}</h3>
              <p className="spotlight-desc">{spotlight.description}</p>

              {/* Code/Terminal Snippet Visual */}
              <div className="spotlight-code-snippet">
                <div className="code-snippet-header">
                  <Terminal size={12} />
                  <span>bash · architecture preview</span>
                </div>
                <code>
                  <span className="code-cmd">$ git clone {spotlight.github_url || 'https://github.com/project'}</span><br />
                  <span className="code-comment"># Installing verified microservice dependencies</span><br />
                  <span className="code-out">✔ 24 packages audited · 0 vulnerabilities</span><br />
                  <span className="code-success">🚀 Service live on local port 3000</span>
                </code>
              </div>

              {/* Spotlight Tags */}
              <div className="spotlight-tags">
                {(spotlight.tags || []).slice(0, 4).map(t => (
                  <span key={t} className="spotlight-tag-pill">#{t}</span>
                ))}
              </div>

              {/* Spotlight Card Buttons */}
              <div className="spotlight-actions" onClick={(e) => e.stopPropagation()}>
                {spotlight.demo_url && (
                  <a 
                    href={spotlight.demo_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-spotlight-demo"
                  >
                    <Play size={13} fill="currentColor" />
                    <span>Launch Live Demo</span>
                  </a>
                )}
                {spotlight.github_url && (
                  <a 
                    href={spotlight.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-spotlight-code"
                  >
                    <GithubIcon size={14} />
                    <span>View Source</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="hero-metrics-grid">
        <div className="metric-box">
          <div className="metric-icon-wrap emerald">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="metric-value">{approvedCount > 0 ? approvedCount : '12'}+</div>
            <div className="metric-title">Approved Projects</div>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon-wrap indigo">
            <Code size={18} />
          </div>
          <div>
            <div className="metric-value">{tagCount > 0 ? tagCount : '27'}+</div>
            <div className="metric-title">Technologies</div>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon-wrap cyan">
            <Globe2 size={18} />
          </div>
          <div>
            <div className="metric-value">100%</div>
            <div className="metric-title">Live Demos & Repos</div>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon-wrap amber">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="metric-value">Verified</div>
            <div className="metric-title">Admin Moderated</div>
          </div>
        </div>
      </div>
    </section>
  );
}
