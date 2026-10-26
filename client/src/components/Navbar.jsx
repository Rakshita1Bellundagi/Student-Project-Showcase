import React, { useState } from 'react';
import { Layers, PlusCircle, Shield, Menu, X, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, pendingCount = 0, isAdminLoggedIn, onOpenAdminLogin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-container glass-panel">
      <div className="navbar-content">
        {/* Brand / Logo */}
        <div className="brand" onClick={() => handleNav('gallery')}>
          <div className="brand-icon-wrapper">
            <Sparkles className="brand-icon" size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-title">CodeNova</span>
            <span className="brand-subtitle">Project Showcase</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-links desktop-only">
          <button 
            id="nav-gallery-btn"
            className={`nav-btn ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => handleNav('gallery')}
          >
            <Layers size={17} />
            <span>Explore Gallery</span>
          </button>

          <button 
            id="nav-submit-btn"
            className={`nav-btn nav-btn-highlight ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => handleNav('submit')}
          >
            <PlusCircle size={17} />
            <span>Submit Project</span>
          </button>

          <button 
            id="nav-admin-btn"
            className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => {
              if (isAdminLoggedIn) {
                handleNav('admin');
              } else {
                onOpenAdminLogin();
              }
            }}
          >
            <Shield size={17} />
            <span>Admin Portal</span>
            {pendingCount > 0 && (
              <span className="nav-pending-badge" title={`${pendingCount} submissions pending review`}>
                {pendingCount}
              </span>
            )}
            {isAdminLoggedIn && (
              <span className="admin-status-dot" title="Admin logged in" />
            )}
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="mobile-toggle mobile-only">
          <button 
            className="icon-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <button 
            className={`mobile-nav-btn ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => handleNav('gallery')}
          >
            <Layers size={18} />
            <span>Explore Gallery</span>
          </button>

          <button 
            className={`mobile-nav-btn ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => handleNav('submit')}
          >
            <PlusCircle size={18} />
            <span>Submit a Project</span>
          </button>

          <button 
            className={`mobile-nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => {
              if (isAdminLoggedIn) {
                handleNav('admin');
              } else {
                onOpenAdminLogin();
              }
              setMobileMenuOpen(false);
            }}
          >
            <Shield size={18} />
            <span>Admin Moderation Portal</span>
            {pendingCount > 0 && (
              <span className="nav-pending-badge">{pendingCount}</span>
            )}
          </button>
        </div>
      )}
    </header>
  );
}
