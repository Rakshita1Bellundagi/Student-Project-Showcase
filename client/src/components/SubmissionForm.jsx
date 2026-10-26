import React, { useState } from 'react';
import { 
  Send, Sparkles, CheckCircle2, AlertCircle, Globe, Tag, 
  User, FileText, RotateCcw, Check, Eye, Edit3
} from 'lucide-react';
import { GithubIcon } from './Icons';
import { submitProject } from '../api';
import ProjectCard from './ProjectCard';

const POPULAR_TAGS = [
  'React', 'Next.js', 'Node.js', 'Python', 'MongoDB', 
  'SQLite', 'MySQL', 'PostgreSQL', 'Docker', 'Machine Learning', 
  'FastAPI', 'Tailwind', 'WebSockets', 'GraphQL', 'Redis', 'TypeScript'
];

const PRESETS = [
  {
    id: 'ai-drone',
    label: '🤖 Autonomous Drone (AI & Telemetry)',
    data: {
      title: 'AeroDrone - Autonomous Flight Navigation & Telemetry',
      student_name: 'Tarun Mehra',
      description: 'An open-source telemetry dashboard for low-altitude quadcopters featuring 3D waypoint planning, battery voltage alerts, and automated return-to-home algorithms.',
      tags: ['React', 'Python', 'WebSockets', 'Machine Learning'],
      github_url: 'https://github.com/tarunmehra/aerodrone-telemetry',
      demo_url: 'https://aerodrone-flight.surge.sh'
    }
  },
  {
    id: 'cloud-mesh',
    label: '🌐 CloudMesh (Distributed DevOps)',
    data: {
      title: 'CloudMesh - Distributed Microservices Orchestrator',
      student_name: 'Priya Sharma',
      description: 'A resilient service mesh control plane featuring eBPF traffic monitoring, zero-downtime canary deployments, and Prometheus metrics telemetry.',
      tags: ['Next.js', 'Docker', 'Go', 'Redis', 'PostgreSQL'],
      github_url: 'https://github.com/priyasharma/cloudmesh-orchestrator',
      demo_url: 'https://cloudmesh-platform.vercel.app'
    }
  },
  {
    id: 'health-ai',
    label: '🩺 HealthAI (Clinical Assistant)',
    data: {
      title: 'HealthAI - Clinical Diagnostic Assistant',
      student_name: 'Aarav Patel',
      description: 'A deep learning assistant for chest X-ray pathology classification with multi-label heatmap visualizations and HIPAA-compliant patient report generation.',
      tags: ['React', 'FastAPI', 'Python', 'Machine Learning'],
      github_url: 'https://github.com/aaravpatel/healthai-diagnostics',
      demo_url: 'https://healthai-clinical.demo.app'
    }
  }
];

const INITIAL_FORM = {
  title: '',
  student_name: '',
  description: '',
  tags: ['React'],
  github_url: '',
  demo_url: ''
};

export default function SubmissionForm({ onSuccess, onCancel, showToast }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [customTagInput, setCustomTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(null);
  const [mobileTab, setMobileTab] = useState('form'); // 'form' | 'preview'

  // Validation logic
  const validateField = (name, value) => {
    let err = '';
    if (name === 'title') {
      if (!value.trim()) err = 'Project title is required.';
      else if (value.trim().length < 3) err = 'Title must be at least 3 characters.';
    } else if (name === 'student_name') {
      if (!value.trim()) err = 'Student name is required.';
      else if (value.trim().length < 2) err = 'Student name must be at least 2 characters.';
    } else if (name === 'description') {
      if (!value.trim()) err = 'Project description is required.';
      else if (value.trim().length < 15) err = 'Description must be at least 15 characters.';
    } else if (name === 'github_url') {
      if (!value.trim()) err = 'GitHub URL is required.';
      else {
        try {
          const u = new URL(value.trim());
          const host = u.hostname.toLowerCase();
          if (host !== 'github.com' && host !== 'www.github.com') {
            err = 'URL must point to github.com (e.g. https://github.com/user/repo).';
          }
        } catch {
          err = 'Invalid URL format. Include http:// or https://';
        }
      }
    } else if (name === 'demo_url') {
      if (!value.trim()) err = 'Live demo URL is required.';
      else {
        try {
          const u = new URL(value.trim());
          if (u.protocol !== 'http:' && u.protocol !== 'https:') {
            err = 'Live demo must be a valid HTTP or HTTPS web address.';
          }
        } catch {
          err = 'Invalid URL format. Include http:// or https://';
        }
      }
    }
    return err;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    const err = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleToggleTag = (tag) => {
    setFormData(prev => {
      const exists = prev.tags.includes(tag);
      let newTags;
      if (exists) {
        newTags = prev.tags.filter(t => t !== tag);
      } else {
        if (prev.tags.length >= 8) {
          showToast('Maximum 8 technology tags allowed.', 'warning');
          return prev;
        }
        newTags = [...prev.tags, tag];
      }
      return { ...prev, tags: newTags };
    });
  };

  const handleAddCustomTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const trimmed = customTagInput.trim().replace(/^#/, '');
      if (!trimmed) return;
      if (formData.tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
        setCustomTagInput('');
        return;
      }
      if (formData.tags.length >= 8) {
        showToast('Maximum 8 technology tags allowed.', 'warning');
        return;
      }
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setCustomTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleApplyPreset = (preset) => {
    setFormData(preset.data);
    setErrors({});
    showToast(`Loaded sample project: "${preset.data.title}"`, 'info');
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
  };

  // Checklist verification calculations
  const checkTitle = formData.title.trim().length >= 3;
  const checkName = formData.student_name.trim().length >= 2;
  const checkDesc = formData.description.trim().length >= 15;
  const checkGithub = !validateField('github_url', formData.github_url) && formData.github_url.trim().length > 0;
  const checkDemo = !validateField('demo_url', formData.demo_url) && formData.demo_url.trim().length > 0;
  const checkTags = formData.tags.length >= 1;

  const validCount = [checkTitle, checkName, checkDesc, checkGithub, checkDemo, checkTags].filter(Boolean).length;
  const progressPercent = Math.round((validCount / 6) * 100);

  const getProgressColor = () => {
    if (progressPercent < 40) return '#ef4444';
    if (progressPercent < 80) return '#f59e0b';
    return '#10b981';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'tags') {
        const err = validateField(key, formData[key]);
        if (err) newErrors[key] = err;
      }
    });

    if (formData.tags.length === 0) {
      newErrors.tags = 'Please select or add at least one technology tag.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please resolve all validation errors before submitting.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitProject(formData);
      setSubmittedSuccess(response.project);
      showToast('Project submitted successfully! It is now pending moderation.', 'success');
      if (onSuccess) onSuccess(response.project);
    } catch (err) {
      showToast(err.message || 'Submission failed. Please check inputs.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview dummy project object
  const previewProject = {
    id: 'preview-draft',
    title: formData.title.trim() || 'Your Innovative Project Title',
    student_name: formData.student_name.trim() || 'Student Developer',
    description: formData.description.trim() || 'Your project architecture overview will be previewed here in real-time as you type in the submission form.',
    tags: formData.tags.length > 0 ? formData.tags : ['React', 'Node.js'],
    github_url: formData.github_url || 'https://github.com',
    demo_url: formData.demo_url || 'https://demo.example.com',
    created_at: '2026-10-20T00:00:00.000Z',
    status: 'pending'
  };

  if (submittedSuccess) {
    return (
      <div className="submission-success-card glass-panel">
        <div className="success-badge-icon">
          <CheckCircle2 size={54} className="text-emerald" />
        </div>
        <h2 className="success-title">Project Successfully Submitted!</h2>
        <p className="success-subtitle">
          Your project <strong>"{submittedSuccess.title}"</strong> has been saved with status <span className="badge badge-pending">PENDING</span>.
        </p>

        <div className="success-workflow-notice">
          <div className="workflow-notice-icon">
            <Sparkles size={20} className="text-primary" />
          </div>
          <div>
            <strong>Moderation Review Queue</strong>
            <p>
              An administrator will review your repository and verify your live demo before publishing it to the public showcase gallery.
            </p>
          </div>
        </div>

        <div className="success-actions">
          <button 
            id="btn-submit-another"
            className="btn-primary" 
            onClick={() => {
              setSubmittedSuccess(null);
              setFormData(INITIAL_FORM);
              setErrors({});
            }}
          >
            <span>Submit Another Project</span>
          </button>
          <button 
            id="btn-return-gallery"
            className="btn-secondary" 
            onClick={onCancel}
          >
            <span>Return to Gallery</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="submission-container">
      {/* Form Page Header */}
      <div className="submission-header glass-panel">
        <div>
          <div className="hero-badge-pill" style={{ margin: '0 0 10px 0' }}>
            <Sparkles size={13} />
            <span>Interactive Project Submission</span>
          </div>
          <h1 className="submission-title">Submit Your Project Showcase</h1>
          <p className="submission-subtitle">
            Fill out the details below. Our reactive card preview updates live as you type.
          </p>
        </div>

        {/* Quick Sample Presets Bar */}
        <div className="sample-presets-bar">
          <span className="presets-label">
            <Sparkles size={14} className="text-amber" />
            <span>Fill Sample Data:</span>
          </span>
          <div className="presets-buttons">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="preset-btn"
                onClick={() => handleApplyPreset(p)}
                title={`Autofill ${p.label}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="form-preview-mobile-tabs mobile-only">
        <button 
          className={`mobile-tab-btn ${mobileTab === 'form' ? 'active' : ''}`}
          onClick={() => setMobileTab('form')}
        >
          <Edit3 size={15} />
          <span>Editor Form</span>
        </button>
        <button 
          className={`mobile-tab-btn ${mobileTab === 'preview' ? 'active' : ''}`}
          onClick={() => setMobileTab('preview')}
        >
          <Eye size={15} />
          <span>Live Card Preview</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="submission-grid">
        {/* Left: Input Form */}
        <div className={`submission-form-card glass-panel ${mobileTab === 'preview' ? 'mobile-hidden' : ''}`}>
          {/* Real-time Quality / Progress Bar */}
          <div className="form-progress-box">
            <div className="progress-header">
              <span className="progress-title">Submission Completeness</span>
              <span className="progress-percent" style={{ color: getProgressColor() }}>
                {progressPercent}% Complete
              </span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, #6366f1, ${getProgressColor()})`
                }} 
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Project Title */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="title" className="form-label">
                  <FileText size={15} />
                  <span>Project Title <span className="req-star">*</span></span>
                </label>
                <span className="char-count">{formData.title.length} chars</span>
              </div>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. AeroDrone - Autonomous Flight Telemetry"
                value={formData.title}
                onChange={handleChange}
                className={`form-input ${errors.title ? 'input-error' : ''}`}
                maxLength={100}
              />
              {errors.title && <span className="error-text"><AlertCircle size={13} /> {errors.title}</span>}
            </div>

            {/* Student Author */}
            <div className="form-group">
              <label htmlFor="student_name" className="form-label">
                <User size={15} />
                <span>Student / Author Name <span className="req-star">*</span></span>
              </label>
              <input
                id="student_name"
                name="student_name"
                type="text"
                placeholder="e.g. Tarun Mehra"
                value={formData.student_name}
                onChange={handleChange}
                className={`form-input ${errors.student_name ? 'input-error' : ''}`}
                maxLength={60}
              />
              {errors.student_name && <span className="error-text"><AlertCircle size={13} /> {errors.student_name}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="description" className="form-label">
                  <FileText size={15} />
                  <span>Project Description & Architecture <span className="req-star">*</span></span>
                </label>
                <span className={`char-count ${formData.description.length < 15 ? 'char-count-warning' : 'char-count-ok'}`}>
                  {formData.description.length} / 15 min chars
                </span>
              </div>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Explain the problem your project solves, key features, and engineering architecture..."
                value={formData.description}
                onChange={handleChange}
                className={`form-textarea ${errors.description ? 'input-error' : ''}`}
              />
              {errors.description && <span className="error-text"><AlertCircle size={13} /> {errors.description}</span>}
            </div>

            {/* Technology Tags */}
            <div className="form-group">
              <label className="form-label">
                <Tag size={15} />
                <span>Technology Stack Tags (Select up to 8) <span className="req-star">*</span></span>
              </label>

              {/* Active Selected Tags */}
              <div className="selected-tags-chips">
                {formData.tags.map(tag => (
                  <span key={tag} className="tag-chip active-chip">
                    #{tag}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="chip-remove-btn"
                      aria-label={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Popular Tag Picker Chips */}
              <div className="popular-tags-row">
                {POPULAR_TAGS.map(tag => {
                  const isSelected = formData.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-picker-btn ${isSelected ? 'tag-picked' : ''}`}
                      onClick={() => handleToggleTag(tag)}
                    >
                      {isSelected ? '✓ ' : '+ '}#{tag}
                    </button>
                  );
                })}
              </div>

              {/* Custom Tag Input */}
              <div className="custom-tag-row">
                <input
                  type="text"
                  placeholder="Add custom technology tag..."
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                  className="custom-tag-input"
                  maxLength={25}
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="btn-add-tag"
                  disabled={!customTagInput.trim()}
                >
                  Add Tag
                </button>
              </div>
              {errors.tags && <span className="error-text"><AlertCircle size={13} /> {errors.tags}</span>}
            </div>

            {/* GitHub URL */}
            <div className="form-group">
              <label htmlFor="github_url" className="form-label">
                <GithubIcon size={15} />
                <span>GitHub Repository URL <span className="req-star">*</span></span>
              </label>
              <input
                id="github_url"
                name="github_url"
                type="url"
                placeholder="https://github.com/username/repository"
                value={formData.github_url}
                onChange={handleChange}
                className={`form-input ${errors.github_url ? 'input-error' : ''}`}
              />
              {errors.github_url && <span className="error-text"><AlertCircle size={13} /> {errors.github_url}</span>}
            </div>

            {/* Live Demo URL */}
            <div className="form-group">
              <label htmlFor="demo_url" className="form-label">
                <Globe size={15} />
                <span>Live Demonstration URL <span className="req-star">*</span></span>
              </label>
              <input
                id="demo_url"
                name="demo_url"
                type="url"
                placeholder="https://my-project-demo.vercel.app"
                value={formData.demo_url}
                onChange={handleChange}
                className={`form-input ${errors.demo_url ? 'input-error' : ''}`}
              />
              {errors.demo_url && <span className="error-text"><AlertCircle size={13} /> {errors.demo_url}</span>}
            </div>

            {/* Action Buttons */}
            <div className="form-actions-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleReset}
              >
                <RotateCcw size={15} />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                id="submit-project-btn"
                className="btn-primary btn-submit-now"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinning-ring" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Project for Moderation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Interactive Card Preview & Quality Checklist */}
        <div className={`submission-preview-col ${mobileTab === 'form' ? 'mobile-hidden' : ''}`}>
          <div className="preview-sticky-wrap">
            <div className="preview-header-pill">
              <Sparkles size={14} className="text-primary" />
              <span>Live Showcase Card Preview</span>
            </div>

            <div className="preview-card-wrap">
              <ProjectCard 
                project={previewProject} 
                onSelectProject={() => {}} 
              />
            </div>

            {/* Real-time Interactive Checklist */}
            <div className="checklist-card glass-panel">
              <h4 className="checklist-title">
                <CheckCircle2 size={16} className="text-primary" />
                <span>Submission Checklist</span>
              </h4>

              <div className="checklist-items">
                <div className={`checklist-item ${checkTitle ? 'item-pass' : 'item-pending'}`}>
                  {checkTitle ? <Check size={14} className="text-emerald" /> : <div className="dot-pending" />}
                  <span>Project Title (at least 3 characters)</span>
                </div>

                <div className={`checklist-item ${checkName ? 'item-pass' : 'item-pending'}`}>
                  {checkName ? <Check size={14} className="text-emerald" /> : <div className="dot-pending" />}
                  <span>Student Name provided</span>
                </div>

                <div className={`checklist-item ${checkDesc ? 'item-pass' : 'item-pending'}`}>
                  {checkDesc ? <Check size={14} className="text-emerald" /> : <div className="dot-pending" />}
                  <span>Architecture description (15+ characters)</span>
                </div>

                <div className={`checklist-item ${checkGithub ? 'item-pass' : 'item-pending'}`}>
                  {checkGithub ? <Check size={14} className="text-emerald" /> : <div className="dot-pending" />}
                  <span>Valid GitHub repository (github.com/...)</span>
                </div>

                <div className={`checklist-item ${checkDemo ? 'item-pass' : 'item-pending'}`}>
                  {checkDemo ? <Check size={14} className="text-emerald" /> : <div className="dot-pending" />}
                  <span>Live demonstration URL (http/https)</span>
                </div>

                <div className={`checklist-item ${checkTags ? 'item-pass' : 'item-pending'}`}>
                  {checkTags ? <Check size={14} className="text-emerald" /> : <div className="dot-pending" />}
                  <span>At least one technology tag selected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
