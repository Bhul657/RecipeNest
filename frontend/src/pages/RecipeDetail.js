import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRecipeById, toggleLikeRecipe, deleteRecipe } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './RecipeDetail.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';

export default function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipe,  setRecipe]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked,   setLiked]   = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getRecipeById(id)
      .then(({ data }) => {
        setRecipe(data.recipe);
        setLiked(data.recipe.likes?.includes(user?._id));
        setLikesCount(data.recipe.likesCount || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await toggleLikeRecipe(id);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (err) { console.error(err); }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: recipe.title, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    setDeleting(true);
    try {
      await deleteRecipe(id);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
      setDeleting(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!recipe) return <div className="container"><div className="alert alert-error">Recipe not found.</div></div>;

  const isOwner = user && (user._id === recipe.chef?._id || user.role === 'admin');
  const totalTime = recipe.prepTime + recipe.cookTime;
  const imgSrc = recipe.image ? `http://localhost:5000${recipe.image}` : PLACEHOLDER;

  const ingredients = recipe.ingredients || [];
  const displayIngredients = expanded ? ingredients : ingredients.slice(0, 6);

  return (
    <div className="recipe-detail">
      {/* Hero */}
      <div className="rd-hero">
        <img src={imgSrc} alt={recipe.title} onError={e => e.target.src = PLACEHOLDER} />
        <div className="rd-hero-overlay">
          <div className="container rd-hero-content">
            <div className="rd-breadcrumb">
              <Link to="/recipes">Recipes</Link> / <span>{recipe.title}</span>
            </div>
            <h1>{recipe.title}</h1>
            {recipe.description && <p className="rd-desc">{recipe.description}</p>}
            <div className="rd-badges">
              {recipe.category   && <span className="badge badge-slate">{recipe.category}</span>}
              {recipe.difficulty && <span className={`badge badge-${recipe.difficulty === 'Easy' ? 'green' : recipe.difficulty === 'Medium' ? 'amber' : 'rust'}`}>{recipe.difficulty}</span>}
              {recipe.cuisine    && <span className="badge badge-slate">{recipe.cuisine}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="container rd-body">
        {/* Quick stats */}
        <div className="rd-stats-row">
          {totalTime > 0 && (
            <div className="rd-stat"><span className="rd-stat-icon">⏱</span><strong>{totalTime} min</strong><span>Total Time</span></div>
          )}
          {recipe.prepTime > 0 && (
            <div className="rd-stat"><span className="rd-stat-icon">🥄</span><strong>{recipe.prepTime} min</strong><span>Prep</span></div>
          )}
          {recipe.cookTime > 0 && (
            <div className="rd-stat"><span className="rd-stat-icon">🔥</span><strong>{recipe.cookTime} min</strong><span>Cook</span></div>
          )}
          {recipe.servings > 0 && (
            <div className="rd-stat"><span className="rd-stat-icon">🍽</span><strong>{recipe.servings}</strong><span>Servings</span></div>
          )}
        </div>

        <div className="rd-content-grid">
          {/* Left: ingredients + actions */}
          <aside className="rd-sidebar">
            <div className="rd-card">
              <h3>Ingredients</h3>
              <ul className="ingredients-list">
                {displayIngredients.map((ing, i) => (
                  <li key={i}><span className="ing-dot">●</span>{ing}</li>
                ))}
              </ul>
              {ingredients.length > 6 && (
                <button className="read-more-btn" onClick={() => setExpanded(!expanded)}>
                  {expanded ? '▲ Show less' : `▼ Show all ${ingredients.length} ingredients`}
                </button>
              )}
            </div>

            {/* Tags */}
            {recipe.tags?.length > 0 && (
              <div className="rd-card">
                <h3>Tags</h3>
                <div className="tags-wrap">
                  {recipe.tags.map((t, i) => (
                    <span key={i} className="tag">#{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="rd-actions">
              <button className={`action-btn like-action ${liked ? 'liked' : ''}`} onClick={handleLike}>
                {liked ? '❤️' : '🤍'} {liked ? 'Liked' : 'Like'} · {likesCount}
              </button>
              <button className="action-btn share-action" onClick={handleShare}>
                📤 Share Recipe
              </button>
            </div>

            {/* Owner actions */}
            {isOwner && (
              <div className="rd-owner-actions">
                <Link to={`/dashboard?edit=${id}`} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  ✏️ Edit Recipe
                </Link>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting…' : '🗑 Delete Recipe'}
                </button>
              </div>
            )}
          </aside>

          {/* Right: instructions + chef */}
          <main className="rd-main">
            {recipe.instructions?.length > 0 && (
              <div className="rd-card">
                <h3>Instructions</h3>
                <ol className="instructions-list">
                  {recipe.instructions.map((step, i) => (
                    <li key={i} className="instruction-step">
                      <div className="step-number">{step.step || i + 1}</div>
                      <p>{step.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Chef info */}
            {recipe.chef && (
              <div className="rd-card rd-chef-card">
                <h3>About the Chef</h3>
                <Link to={`/chefs/${recipe.chef._id}`} className="chef-mini-profile">
                  <div className="chef-mp-avatar">
                    {recipe.chef.profileImage
                      ? <img src={`http://localhost:5000${recipe.chef.profileImage}`} alt={recipe.chef.name} />
                      : <span>{recipe.chef.name?.charAt(0)}</span>
                    }
                  </div>
                  <div>
                    <strong>{recipe.chef.name}</strong>
                    {recipe.chef.specialty && <p>{recipe.chef.specialty}</p>}
                    {recipe.chef.bio && <p className="chef-mp-bio">{recipe.chef.bio.slice(0, 120)}…</p>}
                    <span className="view-profile-link">View full profile →</span>
                  </div>
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
