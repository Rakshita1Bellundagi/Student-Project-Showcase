import React from 'react';
import { 
  Search, ArrowUpDown, Star, LayoutGrid, List, Code2, 
  RotateCcw, PlusCircle, Layers, Filter 
} from 'lucide-react';
import ProjectCard from './ProjectCard';
import { DOMAINS } from '../utils/domains';

export default function GalleryView({
  projects = [],
  tags = [],
  searchInput = '',
  setSearchInput,
  debouncedSearch = '',
  selectedTag = '',
  setSelectedTag,
  selectedDomain = '',
  setSelectedDomain,
  sortBy = 'newest',
  setSortBy,
  viewMode = 'grid',
  setViewMode,
  showFavoritesOnly = false,
  setShowFavoritesOnly,
  favorites = [],
  isLoading = false,
  onClearFilters,
  onToggleFavorite,
  onSelectProject,
  onTagClick,
  onCopyLink,
  onOpenSubmit
}) {
  return (
    <div className="gallery-page-container">
      {/* Gallery Header */}
      <div className="gallery-page-header">
        <div className="gallery-header-info">
          <div className="badge-pill gallery-badge">
            <Layers size={13} className="text-primary" />
            <span>Curated Repository</span>
          </div>
          <h1 className="gallery-page-title">
            Student Showcase <span className="gradient-text">Gallery</span>
            <span className="gallery-total-pill">{projects.length} Verified</span>
          </h1>
          <p className="gallery-page-sub">
            Discover student capstones, open-source utilities, and AI prototypes. Use the domain filters and technology stack chips to find specific engineering disciplines.
          </p>
        </div>
      </div>

      {/* Main Filter & Search Control Panel */}
      <section 
        id="gallery-filters" 
        className="filter-section glass-panel" 
        aria-label="Search and filter projects"
      >
        {/* Top Search & Controls Row */}
        <div className="search-and-sort-row">
          {/* Search Bar */}
          <div className="search-bar-wrap">
            <Search size={18} className="search-icon" />
            <input 
              id="search-input"
              type="text"
              placeholder="Search by title, description, stack, or student name..."
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
              <Star 
                size={15} 
                fill={showFavoritesOnly ? '#fbbf24' : 'none'} 
                color={showFavoritesOnly ? '#fbbf24' : 'currentColor'} 
              />
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

        {/* Domain Categories Filter Tabs */}
        <div className="domains-filter-tabs">
          <span className="domains-filter-label">
            <Filter size={14} />
            <span>Domains:</span>
          </span>
          <button
            className={`domain-tab-btn ${selectedDomain === '' ? 'active' : ''}`}
            onClick={() => setSelectedDomain('')}
          >
            All Domains
          </button>
          {DOMAINS.map((domain) => (
            <button
              key={domain.id}
              className={`domain-tab-btn ${selectedDomain === domain.id ? 'active' : ''}`}
              onClick={() => setSelectedDomain(selectedDomain === domain.id ? '' : domain.id)}
            >
              {domain.shortName}
            </button>
          ))}
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
        {(debouncedSearch || selectedTag || selectedDomain || showFavoritesOnly) && (
          <div className="active-filters-row">
            <span className="active-filters-info">
              Active filters: 
              {debouncedSearch && <strong> "{debouncedSearch}"</strong>}
              {selectedDomain && (
                <strong> [{DOMAINS.find(d => d.id === selectedDomain)?.shortName || selectedDomain}]</strong>
              )}
              {selectedTag && <strong> #{selectedTag}</strong>}
              {showFavoritesOnly && <strong> [Saved Bookmarks]</strong>}
              {' '}({projects.length} matching)
            </span>
            <button 
              id="clear-all-filters-btn"
              className="btn-clear-filters"
              onClick={onClearFilters}
            >
              <RotateCcw size={13} />
              <span>Clear all filters</span>
            </button>
          </div>
        )}
      </section>

      {/* Project Gallery Grid or List */}
      <section className="gallery-section">
        {isLoading ? (
          <div className={`gallery-grid ${viewMode === 'list' ? 'gallery-list' : ''}`}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="project-card skeleton-card">
                <div className="skeleton" style={{ height: '36px', width: '50%', marginBottom: '12px' }} />
                <div className="skeleton" style={{ height: '24px', width: '85%', marginBottom: '10px' }} />
                <div className="skeleton" style={{ height: '65px', width: '100%', marginBottom: '16px' }} />
                <div className="skeleton" style={{ height: '24px', width: '60%' }} />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
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
                : (debouncedSearch || selectedTag || selectedDomain) 
                  ? 'Try clearing your search query or choosing a different domain or technology stack.'
                  : 'No approved projects have been published yet. Be the first student to submit!'}
            </p>
            <div className="empty-actions">
              {(debouncedSearch || selectedTag || selectedDomain || showFavoritesOnly) ? (
                <button className="btn-secondary" onClick={onClearFilters}>
                  Reset All Filters
                </button>
              ) : (
                <button className="btn-primary" onClick={onOpenSubmit}>
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
            {projects.map((project) => (
              <ProjectCard 
                key={project.id}
                project={project}
                viewMode={viewMode}
                isFavorited={favorites.includes(project.id)}
                onToggleFavorite={onToggleFavorite}
                onSelectProject={(p) => onSelectProject(p)}
                onTagClick={onTagClick}
                onCopyLink={onCopyLink}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

