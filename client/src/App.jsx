import React, { useState, useEffect } from 'react';
import { 
  Search, Sparkles, PlusCircle, ArrowUpDown, 
  RotateCcw, Shield, Code2, LayoutGrid, List, Star
} from 'lucide-react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProjectCard from './components/ProjectCard';
import ProjectModal from './components/ProjectModal';
import SubmissionForm from './components/SubmissionForm';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginModal from './components/AdminLoginModal';
import Toast from './components/Toast';
import { fetchPublicProjects, fetchTags, verifyAdminToken, fetchAdminStats } from './api';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'submit' | 'admin'
  const [projects, setProjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
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

  // Admin authentication
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('codenova_admin_token') || '');
  const [adminUser, setAdminUser] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

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

  // Check admin session & stats
  useEffect(() => {
    if (adminToken) {
      verifyAdminToken(adminToken).then(user => {
        if (user) {
          setAdminUser(user);
          fetchAdminStats(adminToken).then(stats => {
            if (stats) setPendingCount(stats.pending || 0);
          }).catch(() => {});
        } else {
          setAdminToken('');
          setAdminUser(null);
          localStorage.removeItem('codenova_admin_token');
        }
      });
    }
  }, [adminToken]);

  // Initial and reactive fetch
  useEffect(() => {
    loadProjects();
  }, [debouncedSearch, selectedTag, sortBy]);

  useEffect(() => {
    loadTags();
  }, []);

  const handleAdminLoginSuccess = (token, user) => {
    setAdminToken(token);
    setAdminUser(user);
    localStorage.setItem('codenova_admin_token', token);
    setActiveTab('admin');
    fetchAdminStats(token).then(stats => {
      if (stats) setPendingCount(stats.pending || 0);
    }).catch(() => {});
  };

  const handleAdminLogout = () => {
    setAdminToken('');
    setAdminUser(null);
    localStorage.removeItem('codenova_admin_token');
    setActiveTab('gallery');
    showToast('Administrator signed out successfully.', 'info');
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedTag('');
    setSortBy('newest');
    setShowFavoritesOnly(false);
  };

  const handleSubmissionSuccess = () => {
    loadProjects();
    loadTags();
    if (adminToken) {
      fetchAdminStats(adminToken).then(stats => {
        if (stats) setPendingCount(stats.pending || 0);
      }).catch(() => {});
    }
  };

  const handleModerationChange = () => {
    loadProjects();
    loadTags();
    if (adminToken) {
      fetchAdminStats(adminToken).then(stats => {
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

  // Copy project share link
  const handleCopyLink = (project) => {
    const url = `${window.location.origin}/?project=${project.id}`;
    navigator.clipboard.writeText(url);
    showToast(`Copied share link for "${project.title}"!`, 'success');
  };

  // Tag click from card or modal
  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setShowFavoritesOnly(false);
    const filterSection = document.getElementById('gallery-filters');
    if (filterSection) {
      filterSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter projects by favorites if toggled
  const displayedProjects = showFavoritesOnly
    ? projects.filter(p => favorites.includes(p.id))
    : projects;

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
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        isAdminLoggedIn={Boolean(adminToken && adminUser)}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
      />

      <main className="main-content">
        {activeTab === 'gallery' && (
          <div className="gallery-view">
            {/* Hero Section */}
            <HeroSection 
              onOpenSubmit={() => setActiveTab('submit')}
              approvedCount={projects.length}
              tagCount={tags.length}
              onSelectTag={handleTagClick}
            />

            {/* Filter & Search Bar */}
            <section 
              id="gallery-filters" 
              className="filter-section glass-panel" 
              aria-label="Search and filter projects"
            >
              <div className="search-and-sort-row">
                {/* Search Bar */}
                <div className="search-bar-wrap">
                  <Search size={18} className="search-icon" />
                  <input 
                    id="search-input"
                    type="text"
                    placeholder="Search projects by title, description, or student name..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="search-input"
                  />
                  {searchInput && (
                    <button 
                      id="search-clear-btn"
                      className="search-clear-btn"
                      onClick={() => setSearchInput('')}
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="filter-controls-group">
                  {/* Sort dropdown */}
                  <div className="sort-wrap">
                    <ArrowUpDown size={15} className="sort-icon" />
                    <select 
                      id="sort-select"
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="sort-select"
                    >
                      <option value="newest">Newest First</option>
                      <option value="title">Alphabetical (A-Z)</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>

                  {/* Favorites Toggle Button */}
                  <button 
                    className={`btn-filter-toggle ${showFavoritesOnly ? 'active' : ''}`}
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    title={showFavoritesOnly ? 'Show all projects' : 'Show saved projects'}
                  >
                    <Star size={15} fill={showFavoritesOnly ? '#fbbf24' : 'none'} color={showFavoritesOnly ? '#fbbf24' : 'currentColor'} />
                    <span>Saved ({favorites.length})</span>
                  </button>

                  {/* Grid vs List View Mode Toggles */}
                  <div className="view-mode-toggle-group">
                    <button 
                      className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      title="Grid View"
                      aria-label="Grid View"
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button 
                      className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                      title="List View"
                      aria-label="List View"
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Technology Tag Chips */}
              <div className="tags-filter-bar">
                <span className="tags-filter-label">
                  <Code2 size={14} />
                  <span>Stacks:</span>
                </span>

                <button 
                  id="tag-all-btn"
                  className={`tag-filter-chip ${selectedTag === '' ? 'tag-filter-active' : ''}`}
                  onClick={() => setSelectedTag('')}
                >
                  All Technologies
                </button>

                {tags.map((t) => (
                  <button 
                    key={t.name}
                    className={`tag-filter-chip ${selectedTag.toLowerCase() === t.name.toLowerCase() ? 'tag-filter-active' : ''}`}
                    onClick={() => {
                      if (selectedTag.toLowerCase() === t.name.toLowerCase()) {
                        setSelectedTag('');
                      } else {
                        setSelectedTag(t.name);
                      }
                    }}
                  >
                    <span>{t.name}</span>
                    <span className="tag-count-sub">{t.count}</span>
                  </button>
                ))}
              </div>

              {/* Active Filter Indicators */}
              {(debouncedSearch || selectedTag || showFavoritesOnly) && (
                <div className="active-filters-row">
                  <span className="active-filters-info">
                    Showing results for: 
                    {debouncedSearch && <strong> "{debouncedSearch}"</strong>}
                    {debouncedSearch && selectedTag && ' + '}
                    {selectedTag && <strong> #{selectedTag}</strong>}
                    {showFavoritesOnly && <strong> [Saved Favorites Only]</strong>}
                    {' '}({displayedProjects.length} found)
                  </span>
                  <button 
                    id="clear-all-filters-btn"
                    className="btn-clear-filters"
                    onClick={handleClearFilters}
                  >
                    <RotateCcw size={13} />
                    <span>Clear all filters</span>
                  </button>
                </div>
              )}
            </section>

            {/* Project Gallery Grid or List */}
            <section className="gallery-section">
              <div className="gallery-header-row">
                <h2 className="section-title">
                  Approved Showcase
                  <span className="title-count-pill">{displayedProjects.length}</span>
                </h2>
                <div className="gallery-header-meta">
                  <span>Displaying verified student work</span>
                </div>
              </div>

              {isLoading ? (
                <div className={`gallery-grid ${viewMode === 'list' ? 'gallery-list' : ''}`}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="project-card skeleton-card">
                      <div className="skeleton" style={{ height: '40px', width: '50%', marginBottom: '12px' }} />
                      <div className="skeleton" style={{ height: '24px', width: '85%', marginBottom: '10px' }} />
                      <div className="skeleton" style={{ height: '70px', width: '100%', marginBottom: '16px' }} />
                      <div className="skeleton" style={{ height: '24px', width: '60%' }} />
                    </div>
                  ))}
                </div>
              ) : displayedProjects.length === 0 ? (
                <div className="empty-gallery glass-panel">
                  <div className="empty-icon-wrap">
                    <Search size={36} />
                  </div>
                  <h3 className="empty-title">
                    {showFavoritesOnly ? 'No saved projects yet' : 'No projects match your filter criteria'}
                  </h3>
                  <p className="empty-desc">
                    {showFavoritesOnly
                      ? 'You have not bookmarked any projects yet. Click the star icon on any card to save it here!'
                      : (debouncedSearch || selectedTag) 
                        ? 'Try clearing your search query or selecting a different technology stack.'
                        : 'No approved projects have been published yet. Be the first student to submit!'}
                  </p>
                  <div className="empty-actions">
                    {(debouncedSearch || selectedTag || showFavoritesOnly) ? (
                      <button className="btn-secondary" onClick={handleClearFilters}>
                        Reset Filters
                      </button>
                    ) : (
                      <button className="btn-primary" onClick={() => setActiveTab('submit')}>
                        <PlusCircle size={16} />
                        <span>Submit Project</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div 
                  className={`gallery-grid ${viewMode === 'list' ? 'gallery-list' : ''}`}
                  id="public-gallery-grid"
                >
                  {displayedProjects.map((project) => (
                    <ProjectCard 
                      key={project.id}
                      project={project}
                      viewMode={viewMode}
                      isFavorited={favorites.includes(project.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onSelectProject={(p) => setSelectedProject(p)}
                      onTagClick={handleTagClick}
                      onCopyLink={handleCopyLink}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Submit View */}
        {activeTab === 'submit' && (
          <div className="submit-view">
            <SubmissionForm 
              onSuccess={handleSubmissionSuccess}
              onCancel={() => setActiveTab('gallery')}
              showToast={showToast}
            />
          </div>
        )}

        {/* Admin Moderation View */}
        {activeTab === 'admin' && (
          <div className="admin-view">
            {adminToken && adminUser ? (
              <AdminDashboard 
                token={adminToken}
                adminUser={adminUser}
                onLogout={handleAdminLogout}
                onSelectProject={(p) => setSelectedProject(p)}
                showToast={showToast}
                onStatusChange={handleModerationChange}
              />
            ) : (
              <div className="admin-locked-notice glass-panel">
                <Shield size={44} className="text-primary" />
                <h2>Admin Moderation Access Required</h2>
                <p>You must authenticate as an authorized moderator to review and publish student projects.</p>
                <button 
                  className="btn-primary" 
                  onClick={() => setIsAdminModalOpen(true)}
                >
                  Open Moderator Login
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="brand footer-brand">
              <Sparkles size={16} className="brand-icon" />
              <span className="brand-title">CodeNova</span>
            </div>
            <p className="footer-copy">
              Student Project Showcase Portal — CodeNova Batch 01 Internship Task 4.
            </p>
          </div>
          <div className="footer-links">
            <button 
              className="footer-link-btn"
              onClick={() => {
                if (adminToken) setActiveTab('admin');
                else setIsAdminModalOpen(true);
              }}
            >
              <Shield size={14} />
              <span>Moderator Portal</span>
            </button>
          </div>
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

      {/* Admin Login Modal */}
      <AdminLoginModal 
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
        showToast={showToast}
      />
    </div>
  );
}
