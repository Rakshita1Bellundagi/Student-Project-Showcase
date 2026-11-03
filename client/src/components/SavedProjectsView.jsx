import React from 'react';
import { Star, Compass, Trash2 } from 'lucide-react';
import ProjectCard from './ProjectCard';

export default function SavedProjectsView({
  projects = [],
  favorites = [],
  onToggleFavorite,
  onClearFavorites,
  onSelectProject,
  onTagClick,
  onCopyLink,
  onExploreGallery
}) {
  const savedProjects = projects.filter(p => favorites.includes(p.id));

  return (
    <div className="saved-page-container">
      {/* Saved Page Header */}
      <div className="saved-page-header">
        <div className="saved-header-info">
          <div className="badge-pill saved-badge">
            <Star size={13} className="text-amber" fill="#fbbf24" />
            <span>Personal Collection</span>
          </div>
          <h1 className="saved-page-title">
            Your Bookmarked <span className="gradient-text">Projects</span>
            <span className="saved-total-pill">{savedProjects.length} Saved</span>
          </h1>
          <p className="saved-page-sub">
            A personalized list of student innovations you have starred. Access code repositories, launch live demos, or share citations quickly.
          </p>
        </div>

        {savedProjects.length > 0 && (
          <div className="saved-header-actions">
            {onClearFavorites && (
              <button 
                className="btn-danger-outline"
                onClick={onClearFavorites}
                title="Remove all projects from saved bookmarks"
              >
                <Trash2 size={15} />
                <span>Clear All Saved</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {savedProjects.length === 0 ? (
        <div className="empty-saved-state glass-panel">
          <div className="empty-star-icon-wrap">
            <Star size={44} color="#fbbf24" />
          </div>
          <h3 className="empty-saved-title">No Bookmarked Projects Yet</h3>
          <p className="empty-saved-desc">
            You haven't saved any student projects to your collection. Click the star icon on any card in the showcase gallery to bookmark it here!
          </p>
          <div className="empty-saved-actions">
            <button className="btn-primary" onClick={onExploreGallery}>
              <Compass size={16} />
              <span>Explore Showcase Gallery</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="gallery-grid" id="saved-gallery-grid">
          {savedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode="grid"
              isFavorited={true}
              onToggleFavorite={onToggleFavorite}
              onSelectProject={onSelectProject}
              onTagClick={onTagClick}
              onCopyLink={onCopyLink}
            />
          ))}
        </div>
      )}
    </div>
  );
}
