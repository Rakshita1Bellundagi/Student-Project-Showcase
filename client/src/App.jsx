import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturedProjects from './components/FeaturedProjects';
import DomainGrid from './components/DomainGrid';
import WorkflowSection from './components/WorkflowSection';
import CallToAction from './components/CallToAction';
import GalleryView from './components/GalleryView';
import CategoriesView from './components/CategoriesView';
import SavedProjectsView from './components/SavedProjectsView';
import ProjectModal from './components/ProjectModal';
import SubmissionForm from './components/SubmissionForm';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import AuthView from './components/AuthView';
import Toast from './components/Toast';
import { fetchPublicProjects, fetchTags, verifyAuthToken, fetchAdminStats } from './api';
import { getProjectDomain } from './utils/domains';
import './App.css';

const VALID_TABS = ['home', 'gallery', 'categories', 'saved', 'submit', 'student-dashboard', 'admin', 'login'];

export default function App() {
  // Support hash-based navigation: '#/home', '#/gallery', '#/categories', '#/saved', '#/submit', '#/student-dashboard', '#/admin', '#/login'
  const getInitialTab = () => {
    const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
    if (VALID_TABS.includes(hash)) {
      return hash;
    }
    return 'home'; // default to Home page!
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [projects, setProjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isLoading, setIsLoading] = useState(true);

  // Favorites stored in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('codenova_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Selected project for modal inspection
  const [selectedProject, setSelectedProject] = useState(null);

  // Unified User Authentication (Student or Admin)
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('codenova_auth_token') || localStorage.getItem('codenova_admin_token') || '';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('codenova_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [pendingCount, setPendingCount] = useState(0);
  const [postLoginRedirect, setPostLoginRedirect] = useState(null);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [authNotice, setAuthNotice] = useState('');

  const handleRequireAuth = (mode = 'login', notice = 'Please sign in with your student account to submit a project.') => {
    setPostLoginRedirect('submit');
    setAuthInitialMode(mode);
    setAuthNotice(notice);
    navigateToTab('login');
  };

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Sync activeTab with URL hash for browser history / direct links
  const navigateToTab = (tab) => {
    setActiveTab(tab);
    window.location.hash = `#/${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
      if (VALID_TABS.includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Debounce search input for instant reactive filtering
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Load public projects reactively whenever filters change
  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPublicProjects({
        search: debouncedSearch,
        tag: selectedTag,
        sort: sortBy
      });
      setProjects(data.projects || []);

      // Check URL query param for deep linking (?project=id)
      const urlParams = new URLSearchParams(window.location.search);
      const projectIdFromUrl = urlParams.get('project');
      if (projectIdFromUrl && !selectedProject) {
        const found = (data.projects || []).find(p => p.id === projectIdFromUrl);
        if (found) {
          setSelectedProject(found);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to load gallery', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load tags
  const loadTags = async () => {
    try {
      const tagList = await fetchTags();
      setTags(tagList);
    } catch {
      // Ignore network error on tags
    }
  };

  // Check auth session & stats
  useEffect(() => {
    if (authToken) {
      verifyAuthToken(authToken).then(user => {
        if (user) {
          setCurrentUser(user);
          localStorage.setItem('codenova_auth_user', JSON.stringify(user));
          if (user.role === 'admin') {
            fetchAdminStats(authToken).then(stats => {
              if (stats) setPendingCount(stats.pending || 0);
            }).catch(() => {});
          }
        } else {
          setAuthToken('');
          setCurrentUser(null);
          localStorage.removeItem('codenova_auth_token');
          localStorage.removeItem('codenova_admin_token');
          localStorage.removeItem('codenova_auth_user');
        }
      });
    }
  }, [authToken]);

  // Initial and reactive fetch
  useEffect(() => {
    loadProjects();
  }, [debouncedSearch, selectedTag, sortBy]);

  useEffect(() => {
    loadTags();
  }, []);

  // Unified login handler
  const handleLoginSuccess = (token, user) => {
    setAuthToken(token);
    setCurrentUser(user);
    localStorage.setItem('codenova_auth_token', token);
    localStorage.setItem('codenova_auth_user', JSON.stringify(user));

    if (user.role === 'admin') {
      localStorage.setItem('codenova_admin_token', token);
      navigateToTab('admin');
      fetchAdminStats(token).then(stats => {
        if (stats) setPendingCount(stats.pending || 0);
      }).catch(() => {});
    } else {
      navigateToTab('student-dashboard');
    }
  };

  const handleLogout = () => {
    setAuthToken('');
    setCurrentUser(null);
    localStorage.removeItem('codenova_auth_token');
    localStorage.removeItem('codenova_admin_token');
    localStorage.removeItem('codenova_auth_user');
    navigateToTab('home');
    showToast('You have been signed out successfully.', 'info');
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedTag('');
    setSelectedDomain('');
    setSortBy('newest');
    setShowFavoritesOnly(false);
  };

  const handleSubmissionSuccess = () => {
    loadProjects();
    loadTags();
    if (currentUser?.role === 'student') {
      navigateToTab('student-dashboard');
    } else {
      navigateToTab('gallery');
    }
    showToast('Project submitted! Pending faculty review before publishing.', 'success');
    if (authToken && currentUser?.role === 'admin') {
      fetchAdminStats(authToken).then(stats => {
        if (stats) setPendingCount(stats.pending || 0);
      }).catch(() => {});
    }
  };

  const handleModerationChange = () => {
    loadProjects();
    loadTags();
    if (authToken && currentUser?.role === 'admin') {
      fetchAdminStats(authToken).then(stats => {
        if (stats) setPendingCount(stats.pending || 0);
      }).catch(() => {});
    }
  };

  // Favorites toggle
  const handleToggleFavorite = (id) => {
    setFavorites(prev => {
      let updated;
      if (prev.includes(id)) {
        updated = prev.filter(item => item !== id);
        showToast('Removed from your saved projects', 'info');
      } else {
        updated = [...prev, id];
        showToast('Added to your saved projects! ⭐', 'success');
      }
      try {
        localStorage.setItem('codenova_favorites', JSON.stringify(updated));
      } catch {
        // storage quota fallback
      }
      return updated;
    });
  };

  const handleClearAllFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('codenova_favorites');
    showToast('Cleared all saved bookmarks.', 'info');
  };

  // Copy project share link
  const handleCopyLink = (project) => {
    const url = `${window.location.origin}/?project=${project.id}`;
    navigator.clipboard.writeText(url);
    showToast(`Copied share link for "${project.title}"!`, 'success');
  };

  // Tag click from card, modal, or hero
  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setSelectedDomain('');
    setShowFavoritesOnly(false);
    navigateToTab('gallery');
  };

  // Domain click from Home or Categories
  const handleDomainClick = (domainId) => {
    setSelectedDomain(domainId);
    setSelectedTag('');
    setShowFavoritesOnly(false);
    navigateToTab('gallery');
  };

  // Quick search from Home hero
  const handleQuickSearch = (query) => {
    setSearchInput(query);
    setDebouncedSearch(query);
    navigateToTab('gallery');
  };

  // Client-side domain and favorites filtering for Gallery
  const filteredProjects = projects.filter((project) => {
    if (selectedDomain) {
      const projDomain = getProjectDomain(project);
      if (projDomain.id !== selectedDomain) return false;
    }
    if (showFavoritesOnly) {
      if (!favorites.includes(project.id)) return false;
    }
    return true;
  });

  return (
    <div className="app-layout">
      {/* Toast Notification Container */}
      {toast && (
        <div className="toast-portal">
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        </div>
      )}

      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={navigateToTab}
        pendingCount={pendingCount}
        approvedCount={projects.length}
        favoritesCount={favorites.length}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => {
          setPostLoginRedirect(null);
          setAuthInitialMode('login');
          setAuthNotice('');
          navigateToTab('login');
        }}
      />

      <main className="main-content">
        {/* VIEW 1: HOME LANDING PAGE */}
        {activeTab === 'home' && (
          <div className="home-view">
            {/* Split Hero Section */}
            <HeroSection 
              onOpenSubmit={() => navigateToTab('submit')}
              onExploreGallery={() => navigateToTab('gallery')}
              approvedCount={projects.length}
              tagCount={tags.length}
              onSelectTag={handleTagClick}
              onQuickSearch={handleQuickSearch}
              featuredProject={projects[0]}
              onSelectProject={(p) => setSelectedProject(p)}
            />

            {/* Featured Innovations Spotlight */}
            <FeaturedProjects 
              projects={projects}
              onSelectProject={(p) => setSelectedProject(p)}
              onTagClick={handleTagClick}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onExploreAll={() => navigateToTab('gallery')}
            />

            {/* Browse by Engineering Domain */}
            <DomainGrid 
              projects={projects}
              onSelectDomain={handleDomainClick}
            />

            {/* Visual 4-Step Curation Pipeline */}
            <WorkflowSection 
              onOpenSubmit={() => navigateToTab('submit')}
            />

            {/* Student Showcase Call to Action */}
            <CallToAction 
              onOpenSubmit={() => navigateToTab('submit')}
              onExploreGallery={() => navigateToTab('gallery')}
            />
          </div>
        )}

        {/* VIEW 2: DEDICATED SHOWCASE GALLERY */}
        {activeTab === 'gallery' && (
          <div className="gallery-page-view">
            <GalleryView 
              projects={filteredProjects}
              tags={tags}
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              debouncedSearch={debouncedSearch}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
              selectedDomain={selectedDomain}
              setSelectedDomain={setSelectedDomain}
              sortBy={sortBy}
              setSortBy={setSortBy}
              viewMode={viewMode}
              setViewMode={setViewMode}
              showFavoritesOnly={showFavoritesOnly}
              setShowFavoritesOnly={setShowFavoritesOnly}
              favorites={favorites}
              isLoading={isLoading}
              onClearFilters={handleClearFilters}
              onToggleFavorite={handleToggleFavorite}
              onSelectProject={(p) => setSelectedProject(p)}
              onTagClick={handleTagClick}
              onCopyLink={handleCopyLink}
              onOpenSubmit={() => navigateToTab('submit')}
            />
          </div>
        )}

        {/* VIEW 3: DOMAINS & TECH STACKS DIRECTORY */}
        {activeTab === 'categories' && (
          <div className="categories-page-view">
            <CategoriesView 
              projects={projects}
              tags={tags}
              onSelectDomain={handleDomainClick}
              onSelectTag={handleTagClick}
            />
          </div>
        )}

        {/* VIEW 4: PERSONAL SAVED BOOKMARKS */}
        {activeTab === 'saved' && (
          <div className="saved-page-view">
            <SavedProjectsView 
              projects={projects}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onClearFavorites={handleClearAllFavorites}
              onSelectProject={(p) => setSelectedProject(p)}
              onTagClick={handleTagClick}
              onCopyLink={handleCopyLink}
              onExploreGallery={() => navigateToTab('gallery')}
            />
          </div>
        )}

        {/* VIEW 5: PROJECT SUBMISSION FORM */}
        {activeTab === 'submit' && (
          <div className="submit-view">
            <SubmissionForm 
              onSuccess={handleSubmissionSuccess}
              onCancel={() => navigateToTab('gallery')}
              showToast={showToast}
              currentUser={currentUser}
              authToken={authToken}
              onRequireAuth={handleRequireAuth}
            />
          </div>
        )}

        {/* VIEW 6: STUDENT DASHBOARD ("MY SUBMISSIONS") */}
        {activeTab === 'student-dashboard' && (
          <div className="student-dashboard-view">
            {currentUser ? (
              <StudentDashboard 
                token={authToken}
                user={currentUser}
                onLogout={handleLogout}
                onOpenSubmit={() => navigateToTab('submit')}
                onSelectProject={(p) => setSelectedProject(p)}
                showToast={showToast}
              />
            ) : (
              <AuthView 
                onLoginSuccess={handleLoginSuccess}
                onCancel={() => navigateToTab('home')}
                showToast={showToast}
              />
            )}
          </div>
        )}

        {/* VIEW 7: MODERATOR ADMIN PORTAL */}
        {activeTab === 'admin' && (
          <div className="admin-view">
            {currentUser && currentUser.role === 'admin' ? (
              <AdminDashboard 
                token={authToken}
                adminUser={currentUser}
                onLogout={handleLogout}
                onSelectProject={(p) => setSelectedProject(p)}
                showToast={showToast}
                onStatusChange={handleModerationChange}
              />
            ) : (
              <AuthView 
                onLoginSuccess={handleLoginSuccess}
                onCancel={() => navigateToTab('home')}
                showToast={showToast}
                defaultRole="admin"
              />
            )}
          </div>
        )}

        {/* VIEW 8: AUTHENTICATION (SIGN IN & REGISTER) */}
        {activeTab === 'login' && (
          <div className="auth-view-page">
            <AuthView 
              onLoginSuccess={handleLoginSuccess}
              onCancel={() => {
                setPostLoginRedirect(null);
                setAuthNotice('');
                navigateToTab('home');
              }}
              showToast={showToast}
              initialMode={authInitialMode}
              noticeMessage={authNotice}
            />
          </div>
        )}
      </main>

      {/* App Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-col-brand">
            <div className="brand footer-brand" onClick={() => navigateToTab('home')}>
              <div className="brand-icon-wrapper-small">
                <span style={{ fontSize: '14px' }}>✨</span>
              </div>
              <span className="brand-title">Student Showcase</span>
            </div>
            <p className="footer-copy">
              A verified showcase portal celebrating student engineering talent, research prototypes, and open-source applications.
            </p>
            <div className="footer-batch-badge">
              <span>Student Showcase · Internship Capstone</span>
            </div>
          </div>

          <div className="footer-col-nav">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links-list">
              <li><button onClick={() => navigateToTab('home')}>Home Showcase</button></li>
              <li><button onClick={() => navigateToTab('gallery')}>Explore Projects ({projects.length})</button></li>
              <li><button onClick={() => navigateToTab('categories')}>Domains & Stacks</button></li>
              <li><button onClick={() => navigateToTab('saved')}>Saved Bookmarks ({favorites.length})</button></li>
            </ul>
          </div>

          <div className="footer-col-nav">
            <h4 className="footer-heading">Accounts & Access</h4>
            <ul className="footer-links-list">
              <li><button onClick={() => navigateToTab('submit')}>Submit New Project</button></li>
              {currentUser?.role === 'student' && (
                <li><button onClick={() => navigateToTab('student-dashboard')}>My Submissions</button></li>
              )}
              {currentUser?.role === 'admin' ? (
                <li><button onClick={() => navigateToTab('admin')}>Admin Moderator Portal</button></li>
              ) : (
                <li><button onClick={() => navigateToTab('login')}>Sign In / Student Account</button></li>
              )}
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© 2026 Student Project Showcase. Built with React 19, SQLite, and Express.</p>
        </div>
      </footer>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
          onTagClick={handleTagClick}
        />
      )}
    </div>
  );
}
