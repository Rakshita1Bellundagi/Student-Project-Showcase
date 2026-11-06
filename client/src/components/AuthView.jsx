import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, User, ArrowRight, Shield, Sparkles, 
  Eye, EyeOff, CheckCircle2, AlertCircle, Compass 
} from 'lucide-react';
import { loginUser, registerStudent } from '../api';

export default function AuthView({ 
  onLoginSuccess, 
  onCancel, 
  showToast, 
  defaultRole = 'all',
  initialMode = 'login',
  noticeMessage = null
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
      setErrorMsg('');
    }
  }, [initialMode]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await loginUser(email.trim(), password);
      showToast(`Welcome back, ${data.user.name}! Signed in as ${data.user.role === 'admin' ? 'Administrator' : 'Student'}.`, 'success');
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await registerStudent({ name: name.trim(), email: email.trim(), password });
      showToast(`Account created successfully! Welcome to CodeNova, ${data.user.name}!`, 'success');
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick One-Click Demo Logins for Evaluators & Recruiters
  const handleQuickLogin = async (role) => {
    setErrorMsg('');
    setIsSubmitting(true);
    const demoEmail = role === 'admin' ? 'admin@showcase.edu' : 'student@showcase.edu';
    const demoPassword = role === 'admin' ? 'Admin@123' : 'Student@123';
    
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      const data = await loginUser(demoEmail, demoPassword);
      showToast(`Demo authenticated as ${role === 'admin' ? 'Lead Moderator' : 'Student Developer'}.`, 'success');
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setErrorMsg(err.message || 'Quick login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel">
        <div className="auth-ambient-glow" />

        {/* Header */}
        <div className="auth-header">
          <div className="auth-brand-badge">
            <Sparkles size={16} className="text-primary" />
            <span>Project Showcase Authentication</span>
          </div>

          <h2 className="auth-title">
            {mode === 'login' ? (
              <>Sign In to <span className="gradient-text">Project Showcase</span></>
            ) : (
              <>Join the <span className="gradient-text">Showcase</span></>
            )}
          </h2>

          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Access student project submissions, review pipeline, or faculty moderation portal.'
              : 'Create your student engineer profile to submit, track, and showcase projects.'}
          </p>

          {noticeMessage && (
            <div className="auth-notice-banner">
              <Sparkles size={15} className="text-primary" />
              <span>{noticeMessage}</span>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="auth-tabs">
            <button 
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setErrorMsg(''); }}
            >
              Sign In
            </button>
            <button 
              type="button"
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setErrorMsg(''); }}
            >
              Student Sign Up
            </button>
          </div>
        </div>

        {/* Quick Demo Login Bar for Evaluators */}
        <div className="auth-demo-shortcuts">
          <span className="demo-shortcuts-label">⚡ 1-Click Evaluation Logins:</span>
          <div className="demo-shortcuts-btns">
            <button 
              type="button"
              className="btn-demo-shortcut btn-demo-admin"
              onClick={() => handleQuickLogin('admin')}
              disabled={isSubmitting}
              title="Sign in with admin permissions to moderate submissions"
            >
              <Shield size={13} />
              <span>Moderator (Admin)</span>
            </button>
            <button 
              type="button"
              className="btn-demo-shortcut btn-demo-student"
              onClick={() => handleQuickLogin('student')}
              disabled={isSubmitting}
              title="Sign in as a student to view and submit projects"
            >
              <User size={13} />
              <span>Student (Aarav)</span>
            </button>
          </div>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="auth-error-banner">
            <AlertCircle size={16} className="text-rose" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="auth-name" className="form-label">
                Full Name <span className="text-rose">*</span>
              </label>
              <div className="input-with-icon">
                <User size={16} className="field-icon" />
                <input 
                  id="auth-name"
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email" className="form-label">
              Email Address <span className="text-rose">*</span>
            </label>
            <div className="input-with-icon">
              <Mail size={16} className="field-icon" />
              <input 
                id="auth-email"
                type="email"
                placeholder="name@university.edu or student@showcase.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-with-hint">
              <label htmlFor="auth-password" className="form-label">
                Password <span className="text-rose">*</span>
              </label>
              {mode === 'login' && (
                <span className="demo-hint-text">
                  (Default demo pass: <code>Admin@123</code> or <code>Student@123</code>)
                </span>
              )}
            </div>
            <div className="input-with-icon">
              <Lock size={16} className="field-icon" />
              <input 
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
              <button 
                type="button" 
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="auth-actions">
            <button 
              type="submit" 
              className="btn-primary btn-auth-submit"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Verifying...' : mode === 'login' ? 'Sign In to Portal' : 'Create Student Account'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          {mode === 'login' ? (
            <p>
              New student developer?{' '}
              <button 
                type="button" 
                className="auth-link-inline" 
                onClick={() => { setMode('register'); setErrorMsg(''); }}
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button 
                type="button" 
                className="auth-link-inline" 
                onClick={() => { setMode('login'); setErrorMsg(''); }}
              >
                Sign in to your account
              </button>
            </p>
          )}

          {onCancel && (
            <button 
              type="button" 
              className="btn-back-gallery"
              onClick={onCancel}
            >
              <Compass size={14} />
              <span>Continue Browsing as Guest</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

