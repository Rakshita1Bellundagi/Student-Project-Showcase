import React, { useState } from 'react';
import { 
  Cpu, Globe, Cloud, Smartphone, Radio, Terminal, 
  Code2, ArrowRight, Layers, Search 
} from 'lucide-react';
import { DOMAINS, getProjectDomain } from '../utils/domains';

const ICON_MAP = {
  Cpu,
  Globe,
  Cloud,
  Smartphone,
  Radio,
  Terminal
};

export default function CategoriesView({ 
  projects = [], 
  tags = [], 
  onSelectDomain, 
  onSelectTag 
}) {
  const [techSearch, setTechSearch] = useState('');

  // Count projects per domain
  const domainCounts = DOMAINS.reduce((acc, domain) => {
    acc[domain.id] = 0;
    return acc;
  }, {});

  projects.forEach((proj) => {
    const domain = getProjectDomain(proj);
    if (domainCounts[domain.id] !== undefined) {
      domainCounts[domain.id]++;
    }
  });

  const filteredTags = tags.filter(t => 
    t.name.toLowerCase().includes(techSearch.toLowerCase())
  );

  return (
    <div className="categories-page-container">
      {/* Header */}
      <div className="categories-page-header">
        <div className="badge-pill categories-badge">
          <Layers size={13} className="text-primary" />
          <span>Technical Taxonomy</span>
        </div>
        <h1 className="categories-page-title">
          Engineering Domains & <span className="gradient-text">Technology Stacks</span>
        </h1>
        <p className="categories-page-sub">
          Browse our academic catalog categorized by engineering discipline and core programming frameworks.
        </p>
      </div>

      {/* Engineering Domains Grid */}
      <section className="categories-section">
        <h2 className="categories-section-heading">
          <span>Major Engineering Domains</span>
          <span className="categories-section-count">({DOMAINS.length} Domains)</span>
        </h2>

        <div className="categories-domains-grid">
          {DOMAINS.map((domain) => {
            const Icon = ICON_MAP[domain.icon] || Globe;
            const count = domainCounts[domain.id] || 0;

            return (
              <div 
                key={domain.id} 
                className="category-domain-card glass-panel"
                onClick={() => onSelectDomain(domain.id)}
              >
                <div className="category-card-accent" style={{ background: domain.gradient }} />
                
                <div className="category-header-row">
                  <div 
                    className="category-icon-box"
                    style={{ 
                      background: `${domain.color}18`, 
                      color: domain.color,
                      borderColor: `${domain.color}35`
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <span className="category-badge-count">
                    {count} {count === 1 ? 'Project' : 'Projects'}
                  </span>
                </div>

                <h3 className="category-title">{domain.name}</h3>
                <p className="category-desc">{domain.description}</p>

                <div className="category-popular-tech">
                  <span className="category-tech-label">Key Technologies:</span>
                  <div className="category-tech-chips">
                    {domain.keywords.slice(0, 4).map((kw) => (
                      <span key={kw} className="category-tech-chip">#{kw}</span>
                    ))}
                  </div>
                </div>

                <div className="category-card-footer">
                  <span className="category-browse-btn" style={{ color: domain.color }}>
                    <span>Explore {domain.shortName} Projects</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Complete Technology Directory */}
      <section className="categories-section tech-directory-section glass-panel">
        <div className="tech-directory-header">
          <div>
            <h2 className="categories-section-heading">
              <Code2 size={20} className="text-primary" />
              <span>Complete Technology Stack Index</span>
              <span className="categories-section-count">({tags.length} Stacks)</span>
            </h2>
            <p className="tech-directory-sub">
              Click any programming language, library, or framework to filter the showcase gallery.
            </p>
          </div>

          <div className="tech-search-box">
            <Search size={16} className="tech-search-icon" />
            <input 
              type="text" 
              placeholder="Search stacks (e.g. 'React', 'Docker')..." 
              value={techSearch}
              onChange={(e) => setTechSearch(e.target.value)}
              className="tech-search-input"
            />
          </div>
        </div>

        <div className="tech-directory-grid">
          {filteredTags.map((tag) => (
            <button
              key={tag.name}
              className="tech-directory-card"
              onClick={() => onSelectTag(tag.name)}
            >
              <div className="tech-dir-left">
                <span className="tech-dir-hash">#</span>
                <span className="tech-dir-name">{tag.name}</span>
              </div>
              <span className="tech-dir-count">{tag.count}</span>
            </button>
          ))}
          {filteredTags.length === 0 && (
            <div className="tech-empty-state">
              <span>No technology stacks match "{techSearch}"</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
