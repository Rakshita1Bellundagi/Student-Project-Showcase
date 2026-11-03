import React from 'react';
import { 
  Cpu, Globe, Cloud, Smartphone, Radio, Terminal, 
  ArrowRight, Layers 
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

export default function DomainGrid({ projects = [], onSelectDomain }) {
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

  return (
    <section className="domain-section">
      <div className="section-header-compact">
        <div className="badge-pill domain-badge-pill">
          <Layers size={13} className="text-cyan" />
          <span>Curated Ecosystem</span>
        </div>
        <h2 className="section-title-large">
          Explore by <span className="gradient-text">Engineering Domain</span>
        </h2>
        <p className="section-subtitle">
          Discover student capstones and open-source applications grouped by technical field.
        </p>
      </div>

      <div className="domain-grid">
        {DOMAINS.map((domain) => {
          const IconComp = ICON_MAP[domain.icon] || Globe;
          const count = domainCounts[domain.id] || 0;

          return (
            <div 
              key={domain.id} 
              className="domain-card glass-panel"
              onClick={() => onSelectDomain && onSelectDomain(domain.id)}
            >
              <div className="domain-card-accent" style={{ background: domain.gradient }} />
              
              <div className="domain-card-header">
                <div 
                  className="domain-icon-wrapper"
                  style={{ 
                    background: `${domain.color}18`,
                    color: domain.color,
                    borderColor: `${domain.color}35`
                  }}
                >
                  <IconComp size={22} />
                </div>
                <span className="domain-count-badge">
                  {count} {count === 1 ? 'Project' : 'Projects'}
                </span>
              </div>

              <h3 className="domain-card-title">{domain.name}</h3>
              <p className="domain-card-desc">{domain.description}</p>

              <div className="domain-card-footer">
                <span className="domain-explore-link" style={{ color: domain.color }}>
                  <span>Browse Projects</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

