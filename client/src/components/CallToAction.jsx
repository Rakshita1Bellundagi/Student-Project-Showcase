import React from 'react';
import { Sparkles, ArrowRight, Code2 } from 'lucide-react';

export default function CallToAction({ onOpenSubmit, onExploreGallery }) {
  return (
    <section className="cta-banner-section">
      <div className="cta-banner-card glass-panel">
        <div className="cta-ambient-glow" />
        
        <div className="cta-content">
          <div className="badge-pill cta-badge">
            <Sparkles size={13} className="text-primary" />
            <span>Open Submissions</span>
          </div>

          <h2 className="cta-heading">
            Ready to Showcase Your <span className="gradient-text">Engineering Project</span>?
          </h2>

          <p className="cta-subtext">
            Join hundreds of student developers publishing capstones, hackathon innovations, and research prototypes. Get verified credentials and share your work with recruiters worldwide.
          </p>

          <div className="cta-actions">
            <button className="btn-primary btn-cta-main" onClick={onOpenSubmit}>
              <span>Submit Your Project</span>
              <ArrowRight size={17} />
            </button>
            <button className="btn-secondary" onClick={onExploreGallery}>
              <Code2 size={16} />
              <span>Explore Public Showcase</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

