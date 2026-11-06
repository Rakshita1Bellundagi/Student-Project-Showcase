import React, { useState, useEffect } from 'react';
import {
  Send, Sparkles, CheckCircle2, AlertCircle, Globe, Tag,
  User, FileText, RotateCcw, Check, Eye, Edit3, Lock, ArrowRight, ShieldCheck
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
      github_url: 'https://github.com/topics/drone-telemetry',
      demo_url: 'https://betaflight.com'
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
      github_url: 'https://github.com/topics/service-mesh',
      demo_url: 'https://play.grafana.org'
    }
  },
  {
    id: 'health-ai',
    label: '🩺 HealthAI (Clinical Assistant)',
    data: {
      title: 'HealthAI - Clinical Diagnostic Assistant',
      student_name: 'Aarav Patel',
      description: 'A deep learning assistant for chest X-ray pathology classification with multi-label heatmap visualizations and clinical triaging support.',
      tags: ['React', 'FastAPI', 'Python', 'Machine Learning'],
      github_url: 'https://github.com/topics/health-ai',
      demo_url: 'https://huggingface.co/spaces/NihalGazi/AI-Doctor'
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

export default function SubmissionForm({
  onSuccess,
  onCancel,
  showToast,
  currentUser,
  authToken,
  onRequireAuth
}) {
  const [formData, setFormData] = useState(() => ({
    ...INITIAL_FORM,
    student_name: currentUser?.name || '',
    student_email: currentUser?.email || ''
  }));

  useEffect(() => {
    if (currentUser?.name) {
      setFormData(prev => ({
        ...prev,
        student_name: currentUser.name,
        student_email: currentUser.email || ''
      }));
    }
  }, [currentUser]);

  const [customTagInput, setCustomTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(null);
  const [duplicateError, setDuplicateError] = useState(null);
  const [mobileTab, setMobileTab] = useState('form'); // 'form' | 'preview'

  // ──────────────────────────────────────────────────────────────────────────
  // GATE: Unauthenticated visitors cannot submit projects.
  // ──────────────────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="auth-gate-wrapper">
        <div className="auth-gate-card glass-panel">
          <div className="auth-gate-glow" />

          <div className="auth-gate-badge">
            <Lock size={15} className="text-primary" />
            <span>Student Authentication Required</span>
          </div>

          <h2 className="auth-gate-title">
            Sign In to <span className="gradient-text">Submit Your Project</span>
          </h2>

          <p className="auth-gate-description">
            To ensure genuine authorship and prevent unauthorized submissions,
            only authenticated student developers can submit projects for review.
          </p>

          <div className="auth-gate-perks-grid">
            <div className="gate-perk-card">
              <div className="gate-perk-icon">🎓</div>
              <div className="gate-perk-body">
                <strong>Verified Authorship</strong>
                <p>Your project is permanently linked to your student credentials.</p>
              </div>
            </div>
            <div className="gate-perk-card">
              <div className="gate-perk-icon">📈</div>
              <div className="gate-perk-body">
                <strong>Track Review Status</strong>
                <p>Monitor pending, approved, or feedback updates in your dashboard.</p>
              </div>
            </div>
            <div className="gate-perk-card">
              <div className="gate-perk-icon">💬</div>
              <div className="gate-perk-body">
                <strong>Reviewer Feedback</strong>
                <p>Receive moderator notes on your repository and live demo.</p>
              </div>
            </div>
            <div className="gate-perk-card">
              <div className="gate-perk-icon">🛡️</div>
              <div className="gate-perk-body">
                <strong>Duplicate Protection</strong>
                <p>Guarantees no one else can submit duplicate copies of your project.</p>
              </div>
            </div>
          </div>

          <div className="auth-gate-actions">
            <button
              type="button"
              id="gate-signin-btn"
              className="btn-primary auth-gate-primary-btn"
              onClick={() => {
                if (onRequireAuth) {
                  onRequireAuth('login');
                } else {
                  window.location.hash = '#/login';
                }
              }}
            >
              <User size={16} />
              <span>Sign In with Student Account</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              id="gate-register-btn"
              className="btn-secondary auth-gate-secondary-btn"
              onClick={() => {
                if (onRequireAuth) {
                  onRequireAuth('register');
                } else {
                  window.location.hash = '#/login';
                }
              }}
            >
              <Sparkles size={16} />
              <span>Register as New Student</span>
            </button>

            <button
              type="button"
              className="auth-gate-back-btn"
              onClick={onCancel || (() => { window.location.hash = '#/gallery'; })}
            >
              <span>Explore Showcase Gallery Instead</span>
            </button>
          </div>

          <div
            className="auth-gate-demo-box"
            style={{ cursor: 'pointer' }}
            title="Click to sign in with demo student account"
            onClick={() => {
              if (onRequireAuth) {
                onRequireAuth('login');
              } else {
                window.location.hash = '#/login';
              }
            }}
          >
            <span className="demo-label">Quick Student Demo (Click to Sign In):</span>
            <code>student@codenova.edu</code>
            <span className="demo-sep">/</span>
            <code>Student@123</code>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VALIDATION LOGIC
  // ──────────────────────────────────────────────────────────────────────────
  const validateField = (name, value) => {
    let err = '';
    if (name === 'title') {
      if (!value.trim()) err = 'Project title is required.';
      else if (value.trim().length < 3) err = 'Title must be at least 3 characters.';
    } else if (name === 'student_name') {
      if (!value.trim()) err = 'Student author name is required.';
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
    setFormData({
      ...preset.data,
      student_name: currentUser?.name || preset.data.student_name,
      student_email: currentUser?.email || ''
    });
    setErrors({});
    setDuplicateError(null);
    showToast(`Loaded sample preset: "${preset.data.title}"`, 'info');
  };

  const handleReset = () => {
    setFormData({
      ...INITIAL_FORM,
      student_name: currentUser?.name || '',
      student_email: currentUser?.email || ''
    });
    setErrors({});
    setDuplicateError(null);
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
      if (key !== 'tags' && key !== 'student_email') {
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
    setDuplicateError(null);
    try {
      const response = await submitProject(formData, authToken);
      setSubmittedSuccess(response.project);
      showToast('Project submitted successfully! It is now pending moderation.', 'success');
      if (onSuccess) onSuccess(response.project);
    } catch (err) {
      // Handle duplicate submission (HTTP 409)
      if (err.duplicate) {
        setDuplicateError({ field: err.field, message: err.message });
        if (err.field) {
          setErrors(prev => ({ ...prev, [err.field]: err.message }));
        }
        showToast('Duplicate submission detected!', 'error');
      } else {
        showToast(err.message || 'Submission failed. Please check inputs.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview dummy project object
  const previewProject = {
    id: 'preview-draft',
    title: formData.title.trim() || 'Your Innovative Project Title',
    student_name: formData.student_name.trim() || currentUser?.name || 'Student Developer',
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
              You can track this submission in your <strong>My Submissions</strong> dashboard.
            </p>
          </div>
        </div>

        <div className="success-actions">
          <button
            id="btn-submit-another"
            className="btn-primary"
            onClick={() => {
              setSubmittedSuccess(null);
              setFormData({
                ...INITIAL_FORM,
                student_name: currentUser?.name || '',
                student_email: currentUser?.email || ''
              });
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
      <div className="submission-header-v2">
        <div className="sfh-copy">
          <div className="sfh-badge">
            <Sparkles size={12} />
            <span>Student Submission Portal</span>
          </div>
          <h1 className="sfh-title">Submit Your Project</h1>
          <p className="sfh-sub">
            Share your engineering work with the community. Every submission
            is verified by a moderator before receiving public showcase honors.
          </p>

          {/* 3-step mini process */}
          <div className="sfh-steps">
            <div className="sfh-step">
              <div className="sfh-step-num">1</div>
              <div className="sfh-step-text">
                <strong>Fill details</strong>
                <span>Title, description &amp; links</span>
              </div>
            </div>
            <div className="sfh-step-arrow">→</div>
            <div className="sfh-step">
              <div className="sfh-step-num">2</div>
              <div className="sfh-step-text">
                <strong>Admin reviews</strong>
                <span>Quality &amp; safety check</span>
              </div>
            </div>
            <div className="sfh-step-arrow">→</div>
            <div className="sfh-step">
              <div className="sfh-step-num">3</div>
              <div className="sfh-step-text">
                <strong>Goes live</strong>
                <span>Published in gallery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Authenticated student session badge */}
        <div className="sfh-auth-user-card">
          <div className="sauc-avatar">
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="sauc-info">
            <div className="sauc-badge">
              <ShieldCheck size={12} className="text-emerald" />
              <span>Verified Student Session</span>
            </div>
            <strong className="sauc-name">{currentUser.name}</strong>
            <span className="sauc-email">{currentUser.email}</span>
          </div>
          <div className="sauc-notice">
            <span>Submissions will appear in your <strong>My Submissions</strong> dashboard.</span>
          </div>
        </div>
      </div>

      {/* Quick Sample Presets Bar */}
      <div className="presets-bar-v2 glass-panel">
        <span className="presets-label">
          <Sparkles size={14} className="text-amber" />
          <span>Need inspiration? Quick-fill sample data:</span>
        </span>
        <div className="presets-buttons-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="preset-btn-pill"
              onClick={() => handleApplyPreset(p)}
              title={`Autofill ${p.label}`}
            >
              {p.label}
            </button>
          ))}
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

          {/* Duplicate Submission Banner */}
          {duplicateError && (
            <div className="duplicate-error-banner" role="alert">
              <div className="dup-banner-icon">⚠️</div>
              <div className="dup-banner-body">
                <strong>Duplicate Submission Detected</strong>
                <p>{duplicateError.message}</p>
              </div>
              <button
                type="button"
                className="dup-banner-close"
                onClick={() => setDuplicateError(null)}
                aria-label="Dismiss"
              >×</button>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* ── STEP 1: Project Identity ───────────────────────────────── */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-num">1</div>
                <div>
                  <span className="form-section-title">Project Identity</span>
                  <span className="form-section-hint">What is your project called and who built it?</span>
                </div>
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label htmlFor="title" className="form-label">
                    <FileText size={15} />
                    <span>Project Title <span className="req-star">*</span></span>
                  </label>
                  <span className="char-count">{formData.title.length}/100</span>
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
                <span className="field-hint">Give it a clear, descriptive name that shows what it does.</span>
                {errors.title && <span className="error-text"><AlertCircle size={13} /> {errors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="student_name" className="form-label">
                  <User size={15} />
                  <span>Student Author <span className="req-star">*</span></span>
                </label>
                <div className="input-locked-wrapper">
                  <input
                    id="student_name"
                    name="student_name"
                    type="text"
                    value={formData.student_name}
                    readOnly
                    className="form-input input-locked"
                  />
                  <div className="locked-pill">
                    <Lock size={12} />
                    <span>Verified Account</span>
                  </div>
                </div>
                <span className="field-hint text-emerald">
                  ✓ Automatically linked to your verified student account ({currentUser.email}).
                </span>
                {errors.student_name && <span className="error-text"><AlertCircle size={13} /> {errors.student_name}</span>}
              </div>
            </div>

            {/* ── STEP 2: Project Description ────────────────────────────── */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-num">2</div>
                <div>
                  <span className="form-section-title">What does it do?</span>
                  <span className="form-section-hint">Help viewers understand your project at a glance.</span>
                </div>
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label htmlFor="description" className="form-label">
                    <FileText size={15} />
                    <span>Project Description <span className="req-star">*</span></span>
                  </label>
                  <span className={`char-count ${formData.description.length < 15 ? 'char-count-warning' : 'char-count-ok'}`}>
                    {formData.description.length} chars {formData.description.length < 15 ? '(min 15)' : '✓'}
                  </span>
                </div>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="What problem does it solve? What are the key features? How is it built? (e.g. React frontend + Python FastAPI backend with ML model…)"
                  value={formData.description}
                  onChange={handleChange}
                  className={`form-textarea ${errors.description ? 'input-error' : ''}`}
                />
                <span className="field-hint">Write at least 15 characters. More detail = higher chance of approval.</span>
                {errors.description && <span className="error-text"><AlertCircle size={13} /> {errors.description}</span>}
              </div>
            </div>

            {/* ── STEP 3: Tech Stack Tags ────────────────────────────────── */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-num">3</div>
                <div>
                  <span className="form-section-title">Technologies Used</span>
                  <span className="form-section-hint">Pick up to 8 tags so students can find your project by stack.</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Tag size={15} />
                  <span>Tech Stack Tags <span className="req-star">*</span>
                    <span className="tag-count-badge">{formData.tags.length}/8 selected</span>
                  </span>
                </label>

                {/* Active Selected Tags */}
                {formData.tags.length > 0 && (

                  <div className="selected-tags-chips">
                    {formData.tags.map(tag => (
                      <span key={tag} className="tag-chip active-chip">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="chip-remove-btn"
                          aria-label={`Remove tag ${tag}`}
                        >×</button>
                      </span>
                    ))}
                  </div>
                )}

                <span className="field-hint">Click to add, click again to remove. Or add a custom tag below.</span>

                {/* Popular Tag Picker */}
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
                    placeholder="Custom tag (e.g. TensorFlow, Arduino…)"
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
                    + Add
                  </button>
                </div>
                {errors.tags && <span className="error-text"><AlertCircle size={13} /> {errors.tags}</span>}
              </div>
            </div>

            {/* ── STEP 4: Links ──────────────────────────────────────────── */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-num">4</div>
                <div>
                  <span className="form-section-title">Project Links</span>
                  <span className="form-section-hint">Both links are required — reviewers verify them before approval.</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="github_url" className="form-label">
                  <GithubIcon size={15} />
                  <span>GitHub Repository URL <span className="req-star">*</span></span>
                </label>
                <input
                  id="github_url"
                  name="github_url"
                  type="url"
                  placeholder="https://github.com/your-username/your-repo"
                  value={formData.github_url}
                  onChange={handleChange}
                  className={`form-input ${errors.github_url ? 'input-error' : ''}`}
                />
                <span className="field-hint">Must be a public repository on github.com — no private repositories.</span>
                {errors.github_url && <span className="error-text"><AlertCircle size={13} /> {errors.github_url}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="demo_url" className="form-label">
                  <Globe size={15} />
                  <span>Live Demo URL <span className="req-star">*</span></span>
                </label>
                <input
                  id="demo_url"
                  name="demo_url"
                  type="url"
                  placeholder="https://your-project.vercel.app"
                  value={formData.demo_url}
                  onChange={handleChange}
                  className={`form-input ${errors.demo_url ? 'input-error' : ''}`}
                />
                <span className="field-hint">A deployed URL where reviewers can interact with the live project.</span>
                {errors.demo_url && <span className="error-text"><AlertCircle size={13} /> {errors.demo_url}</span>}
              </div>
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
                onSelectProject={() => { }}
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
                  <span>Student Author verified ({currentUser.name})</span>
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
