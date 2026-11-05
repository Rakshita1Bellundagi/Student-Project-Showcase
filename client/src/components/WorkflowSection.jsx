import React from 'react';
import { Send, FileCheck, ShieldCheck, Trophy, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Student Submission',
    desc: 'Students submit their title, architectural description, live demo URL, and open GitHub repository.',
    icon: Send,
    color: '#6366f1'
  },
  {
    step: '02',
    title: 'Automated Integrity Check',
    desc: 'The platform validates repository URLs, verifies live demo headers, and parses technology stack tags.',
    icon: FileCheck,
    color: '#38bdf8'
  },
  {
    step: '03',
    title: 'Faculty Moderation',
    desc: 'Authorized instructors and moderators review submissions for academic integrity, code quality, and documentation.',
    icon: ShieldCheck,
    color: '#10b981'
  },
  {
    step: '04',
    title: 'Verified Showcase',
    desc: 'Approved projects are published globally with direct citation links, live demonstrations, and portfolio badges.',
    icon: Trophy,
    color: '#fbbf24'
  }
];

export default function WorkflowSection({ onOpenSubmit }) {
  return (
    <section className="workflow-pipeline-section glass-panel">
      <div className="section-header-compact">
        <div className="badge-pill pipeline-badge">
          <span>Quality Standard</span>
        </div>
        <h2 className="section-title-large">
          Our <span className="gradient-text">Curation Pipeline</span>
        </h2>
        <p className="section-subtitle">
          How every student project is verified before receiving showcase honors.
        </p>
      </div>

      <div className="pipeline-steps-grid">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.step} className="pipeline-card">
              <div className="pipeline-step-top">
                <span className="pipeline-step-num" style={{ color: step.color }}>{step.step}</span>
                <div 
                  className="pipeline-icon-circle"
                  style={{ 
                    background: `${step.color}18`, 
                    color: step.color,
                    borderColor: `${step.color}35`
                  }}
                >
                  <Icon size={20} />
                </div>
              </div>

              <h3 className="pipeline-card-title">{step.title}</h3>
              <p className="pipeline-card-desc">{step.desc}</p>

              {idx < STEPS.length - 1 && (
                <div className="pipeline-arrow desktop-only">
                  <ArrowRight size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pipeline-footer-cta">
        <p>Are you a student developer with a project ready for review?</p>
        <button className="btn-primary" onClick={onOpenSubmit}>
          <span>Submit for Verification</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

