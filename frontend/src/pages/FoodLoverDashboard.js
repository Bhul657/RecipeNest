import React, { useEffect, useState } from 'react';
import { getMe, toggleLikeRecipe } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=60';

export default function FoodLoverDashboard() {
  const { user } = useAuth();
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [loading,      setLoading]      = useState(true);

  const fetchLiked = () => {
    setLoading(true);
    getMe()
      .then(({ data }) => setLikedRecipes(data.user?.likedRecipes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLiked(); }, []);

  const handleUnlike = async (recipeId) => {
    try {
      await toggleLikeRecipe(recipeId);
      setLikedRecipes(prev => prev.filter(r => r._id !== recipeId));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>My Favourites</h1>
            <p>Welcome, <strong>{user?.name}</strong>! Here are the recipes you've liked.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: 400 }}>
          <div className="ds-card">
            <span className="ds-icon">❤️</span>
            <strong>{likedRecipes.length}</strong>
            <span>Liked Recipes</span>
          </div>
          <div className="ds-card">
            <span className="ds-icon">🌍</span>
            <strong>Explorer</strong>
            <span>Your Role</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : likedRecipes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤍</div>
            <h3>No liked recipes yet</h3>
            <p>Explore our recipes and hit the heart button on your favourites!</p>
            <Link to="/recipes" className="btn btn-primary" style={{ marginTop: 16 }}>
              Browse Recipes
            </Link>
          </div>
        ) : (
          <div className="recipe-management">
            <div className="rm-title">Liked Recipes ({likedRecipes.length})</div>
            <div className="recipe-table-wrap">
              <table className="recipe-table">
                <thead>
                  <tr>
                    <th>Recipe</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {likedRecipes.map(r => (
                    <tr key={r._id}>
                      <td>
                        <div className="recipe-row-info">
                          <img
                            src={r.image ? `http://localhost:5000${r.image}` : PLACEHOLDER}
                            alt={r.title}
                            className="recipe-thumb"
                            onError={e => e.target.src = PLACEHOLDER}
                          />
                          <div>
                            <strong>{r.title}</strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Link to={`/recipes/${r._id}`} className="btn btn-secondary btn-sm">View</Link>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleUnlike(r._id)}
                          >
                            💔 Unlike
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
