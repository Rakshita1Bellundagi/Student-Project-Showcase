import React, { useState } from 'react';
import { X, Shield, Lock, Mail, Key, Sparkles, AlertCircle } from 'lucide-react';
import { loginAdmin } from '../api';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFillDemoCredentials = () => {
    setEmail('admin@codenova.edu');
    setPassword('Admin@123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both administrator email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await loginAdmin(email, password);
      showToast('Administrator authenticated successfully.', 'success');
      onLoginSuccess(data.token, data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials.');
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="admin-login-card glass-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="admin-title-group">
            <div className="admin-icon-pill">
              <Shield size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="admin-modal-heading">Admin Moderation Access</h2>
              <p className="admin-modal-subheading">Authorized moderators only</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <div className="login-error-alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">
              <Mail size={14} />
              <span>Admin Email</span>
            </label>
            <input 
              id="admin-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@codenova.edu"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              <Lock size={14} />
              <span>Password</span>
            </label>
            <input 
              id="admin-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="form-input"
              required
            />
          </div>

          <div className="demo-credentials-banner">
            <div className="demo-text">
              <strong>Evaluation Credentials:</strong>
              <code>admin@codenova.edu</code> / <code>Admin@123</code>
            </div>
            <button 
              type="button" 
              className="btn-autofill-admin"
              onClick={handleFillDemoCredentials}
            >
              <Sparkles size={13} />
              <span>Auto-Fill</span>
            </button>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              id="btn-admin-login-submit"
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              <Key size={16} />
              <span>{isLoading ? 'Verifying...' : 'Sign In as Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
