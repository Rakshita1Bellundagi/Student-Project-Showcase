import React, { useState } from 'react';
import { 
  Home, Layers, PlusCircle, Shield, Menu, X, Sparkles, 
  Star, Cpu, LogIn, LogOut, User, FileText 
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  pendingCount = 0, 
  approvedCount = 0,
  favoritesCount = 0,
  currentUser = null,
  onLogout,
  onOpenAuth
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const isStudent = currentUser?.role === 'student';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="navbar-container glass-panel">
      <div className="navbar-content">
        {/* Brand / Logo */}
        <div className="brand" onClick={() => handleNav('home')}>
          <div className="brand-icon-wrapper">
            <Sparkles className="brand-icon" size={20} />
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-title">CodeNova</span>
              <span className="brand-pill-tag">B-01</span>
            </div>
            <span className="brand-subtitle">Project Showcase</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav-links desktop-only">
          <button 
            id="nav-home-btn"
            className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleNav('home')}
          >
            <Home size={16} />
            <span>Home</span>
          </button>

          <button 
            id="nav-gallery-btn"
            className={`nav-btn ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => handleNav('gallery')}
          >
            <Layers size={16} />
            <span>Explore Gallery</span>
            {approvedCount > 0 && (
              <span className="nav-count-badge" title={`${approvedCount} verified projects`}>
                {approvedCount}
              </span>
            )}
          </button>

          <button 
            id="nav-categories-btn"
            className={`nav-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => handleNav('categories')}
          >
            <Cpu size={16} />
            <span>Domains & Stacks</span>
          </button>

          <button 
            id="nav-saved-btn"
            className={`nav-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => handleNav('saved')}
          >
            <Star 
              size={16} 
              fill={favoritesCount > 0 ? '#fbbf24' : 'none'} 
              color={favoritesCount > 0 ? '#fbbf24' : 'currentColor'} 
            />
            <span>Saved</span>
            {favoritesCount > 0 && (
              <span className="nav-saved-badge">
                {favoritesCount}
              </span>
            )}
          </button>

          <button 
            id="nav-submit-btn"
            className={`nav-btn nav-btn-highlight ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => handleNav('submit')}
          >
            <PlusCircle size={16} />
            <span>Submit Project</span>
          </button>

          {/* Conditional Role-Based Nav Button */}
          {isStudent && (
            <button 
              id="nav-student-dashboard-btn"
              className={`nav-btn nav-btn-student ${activeTab === 'student-dashboard' ? 'active' : ''}`}
              onClick={() => handleNav('student-dashboard')}
            >
              <FileText size={16} />
              <span>My Submissions</span>
            </button>
          )}

          {isAdmin && (
            <button 
              id="nav-admin-btn"
              className={`nav-btn nav-btn-admin ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => handleNav('admin')}
            >
              <Shield size={16} />
              <span>Admin Portal</span>
              {pendingCount > 0 && (
                <span className="nav-pending-badge" title={`${pendingCount} submissions pending review`}>
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {/* Auth Action / Profile Pill */}
          <div className="nav-auth-wrapper">
            {currentUser ? (
              <div className="user-profile-menu">
                <div 
                  className={`user-nav-pill ${isAdmin ? 'pill-admin' : 'pill-student'}`}
                  onClick={() => handleNav(isAdmin ? 'admin' : 'student-dashboard')}
                  title={`Logged in as ${currentUser.name} (${currentUser.role})`}
                >
                  <span className="user-avatar-tiny">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </span>
                  <span className="user-nav-name">{currentUser.name.split(' ')[0]}</span>
                  <span className="user-role-badge">{isAdmin ? 'Admin' : 'Student'}</span>
                </div>
                <button 
                  className="btn-nav-logout"
                  onClick={onLogout}
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button 
                id="nav-login-btn"
                className={`btn-nav-login ${activeTab === 'login' ? 'active' : ''}`}
                onClick={onOpenAuth}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
            )}
          </div>
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

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer glass-panel">
          <button 
            className={`mobile-nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleNav('home')}
          >
            <Home size={18} />
            <span>Home</span>
          </button>

          <button 
            className={`mobile-nav-btn ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => handleNav('gallery')}
          >
            <Layers size={18} />
            <span>Explore Gallery ({approvedCount})</span>
          </button>

          <button 
            className={`mobile-nav-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => handleNav('categories')}
          >
            <Cpu size={18} />
            <span>Domains & Stacks</span>
          </button>

          <button 
            className={`mobile-nav-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => handleNav('saved')}
          >
            <Star size={18} />
            <span>Saved Projects ({favoritesCount})</span>
          </button>

          <button 
            className={`mobile-nav-btn mobile-nav-highlight ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => handleNav('submit')}
          >
            <PlusCircle size={18} />
            <span>Submit a Project</span>
          </button>

          {isStudent && (
            <button 
              className={`mobile-nav-btn ${activeTab === 'student-dashboard' ? 'active' : ''}`}
              onClick={() => handleNav('student-dashboard')}
            >
              <FileText size={18} />
              <span>My Submissions (Student)</span>
            </button>
          )}

          {isAdmin && (
            <button 
              className={`mobile-nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => handleNav('admin')}
            >
              <Shield size={18} />
              <span>Moderator Admin Portal</span>
              {pendingCount > 0 && (
                <span className="nav-pending-badge">{pendingCount}</span>
              )}
            </button>
          )}

          <div className="mobile-auth-section">
            {currentUser ? (
              <div className="mobile-user-row">
                <div className="mobile-user-info">
                  <span className="user-avatar-tiny">{currentUser.name[0].toUpperCase()}</span>
                  <span>{currentUser.name} ({currentUser.role})</span>
                </div>
                <button 
                  className="btn-danger-outline"
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button 
                className="btn-primary mobile-login-btn"
                onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
              >
                <LogIn size={18} />
                <span>Sign In / Student Registration</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
