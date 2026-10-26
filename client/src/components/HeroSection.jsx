import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Code, Globe2, Layers, Flame } from 'lucide-react';

const TRENDING_STACKS = ['React', 'Python', 'Machine Learning', 'Next.js', 'FastAPI', 'Docker'];

export default function HeroSection({ 
  onOpenSubmit, 
  approvedCount = 0, 
  tagCount = 0,
  onSelectTag
}) {
  const handleScrollToGallery = () => {
    const el = document.getElementById('gallery-filters');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTrendingClick = (tag) => {
    if (onSelectTag) {
      onSelectTag(tag);
      handleScrollToGallery();
    }
  };

  return (
    <section className="hero-section">
      {/* Ambient background glow orbs */}
      <div className="hero-glow-orb hero-glow-1" />
      <div className="hero-glow-orb hero-glow-2" />

      <div className="hero-badge-pill">
        <Sparkles size={14} className="hero-sparkle-icon" />
        <span>CodeNova Batch 01 Showcase Portal</span>
        <span className="hero-live-beacon" />
      </div>

      <h1 className="hero-heading">
        Discover <span className="gradient-text">Student Innovations</span> & Engineering Excellence
      </h1>

      <p className="hero-description">
        Explore a curated gallery of high-impact academic software, AI prototypes, and open-source applications built by student developers. Every showcase project is verified for quality and safety.
      </p>

      {/* Workflow steps visualization */}
      <div className="workflow-steps">
        <div className="workflow-step">
          <span className="step-num">1</span>
          <span className="step-label">Submit</span>
        </div>
        <div className="step-divider">→</div>
        <div className="workflow-step">
          <span className="step-num">2</span>
          <span className="step-label">Review</span>
        </div>
        <div className="step-divider">→</div>
        <div className="workflow-step">
          <span className="step-num">3</span>
          <span className="step-label">Approve</span>
        </div>
        <div className="step-divider">→</div>
        <div className="workflow-step highlight">
          <span className="step-num">4</span>
          <span className="step-label">Showcase</span>
        </div>
      </div>

      {/* Hero CTA actions */}
      <div className="hero-actions">
        <button 
          id="hero-submit-cta"
          className="btn-primary" 
          onClick={onOpenSubmit}
        >
          <span>Submit Your Project</span>
          <ArrowRight size={18} />
        </button>

        <button 
          id="hero-explore-cta"
          className="btn-secondary"
          onClick={handleScrollToGallery}
        >
          <Layers size={17} />
          <span>Explore Gallery ({approvedCount})</span>
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

      {/* Metrics Row */}
      <div className="hero-metrics-grid">
        <div className="metric-box">
          <div className="metric-icon-wrap emerald">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="metric-value">{approvedCount}+</div>
            <div className="metric-title">Approved Projects</div>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon-wrap indigo">
            <Code size={18} />
          </div>
          <div>
            <div className="metric-value">{tagCount > 0 ? tagCount : '12'}+</div>
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
