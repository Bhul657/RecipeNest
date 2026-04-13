import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toggleLikeRecipe } from '../utils/api';
import './RecipeCard.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';

const difficultyColor = { Easy: 'green', Medium: 'amber', Hard: 'rust' };

export default function RecipeCard({ recipe, onLikeChange }) {
  const { user } = useAuth();
  const [liked, setLiked]       = useState(recipe.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(recipe.likesCount || 0);
  const [loading, setLoading]   = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { window.location.href = '/login'; return; }
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await toggleLikeRecipe(recipe._id);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
      if (onLikeChange) onLikeChange(recipe._id, data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = `${window.location.origin}/recipes/${recipe._id}`;
  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: recipe.title, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <Link to={`/recipes/${recipe._id}`} className="recipe-card">
      <div className="recipe-card-image">
        <img
          src={recipe.image ? `http://localhost:5000${recipe.image}` : PLACEHOLDER}
          alt={recipe.title}
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        <span className={`badge badge-${difficultyColor[recipe.difficulty] || 'slate'} difficulty-badge`}>
          {recipe.difficulty}
        </span>
        {recipe.category && (
          <span className="category-badge">{recipe.category}</span>
        )}
      </div>

      <div className="recipe-card-body">
        <h3 className="recipe-title">{recipe.title}</h3>
        {recipe.description && (
          <p className="recipe-desc">{recipe.description.slice(0, 80)}{recipe.description.length > 80 ? '…' : ''}</p>
        )}

        <div className="recipe-meta">
          {recipe.prepTime + recipe.cookTime > 0 && (
            <span>⏱ {recipe.prepTime + recipe.cookTime} min</span>
          )}
          {recipe.servings > 0 && (
            <span>🍽 {recipe.servings} servings</span>
          )}
        </div>

        {recipe.chef && (
          <div className="recipe-chef">
            <div className="chef-mini-avatar">
              {recipe.chef.profileImage
                ? <img src={`http://localhost:5000${recipe.chef.profileImage}`} alt={recipe.chef.name} onError={(e)=>e.target.style.display='none'} />
                : <span>{recipe.chef.name?.charAt(0)}</span>
              }
            </div>
            <span>{recipe.chef.name}</span>
          </div>
        )}

        <div className="recipe-card-actions">
          <button
            className={`like-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={loading}
            title={liked ? 'Unlike' : 'Like'}
          >
            {liked ? '❤️' : '🤍'} {likesCount}
          </button>
          <button className="share-btn" onClick={handleShare} title="Share recipe">
            📤 Share
          </button>
        </div>
      </div>
    </Link>
  );
}
