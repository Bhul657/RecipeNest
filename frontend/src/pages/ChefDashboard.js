import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMyRecipes, createRecipe, updateRecipe, deleteRecipe } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import RecipeForm from '../components/RecipeForm';
import './Dashboard.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=60';

export default function ChefDashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [recipes,   setRecipes]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [view,      setView]      = useState('list'); // 'list' | 'create' | 'edit'
  const [editRecipe, setEditRecipe] = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  const fetchRecipes = () => {
    setLoading(true);
    getMyRecipes()
      .then(({ data }) => setRecipes(data.recipes))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecipes();
    // Support ?edit=id deep-link from recipe detail page
    const editId = searchParams.get('edit');
    if (editId) {
      // We'll handle after recipes load
    }
  }, []);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && recipes.length > 0) {
      const target = recipes.find(r => r._id === editId);
      if (target) { setEditRecipe(target); setView('edit'); }
    }
  }, [recipes, searchParams]);

  const handleCreate = async (formData) => {
    setError(''); setSaving(true);
    try {
      await createRecipe(formData);
      setSuccess('Recipe created successfully! 🎉');
      setView('list');
      fetchRecipes();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create recipe.');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (formData) => {
    setError(''); setSaving(true);
    try {
      await updateRecipe(editRecipe._id, formData);
      setSuccess('Recipe updated successfully! ✅');
      setView('list');
      setEditRecipe(null);
      fetchRecipes();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update recipe.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (recipeId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteRecipe(recipeId);
      setSuccess(`"${title}" deleted.`);
      fetchRecipes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  };

  const startEdit = (recipe) => {
    setEditRecipe(recipe);
    setView('edit');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => {
    setView('list');
    setEditRecipe(null);
    setError('');
  };

  const totalLikes = recipes.reduce((sum, r) => sum + (r.likesCount || 0), 0);

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Chef Dashboard</h1>
            <p>Welcome back, <strong>{user?.name}</strong>! Manage your recipes below.</p>
          </div>
          {view === 'list' && (
            <button className="btn btn-primary" onClick={() => { setView('create'); setError(''); }}>
              + New Recipe
            </button>
          )}
        </div>

        {/* Stats */}
        {view === 'list' && (
          <div className="dashboard-stats">
            <div className="ds-card"><span className="ds-icon">📖</span><strong>{recipes.length}</strong><span>Recipes</span></div>
            <div className="ds-card"><span className="ds-icon">❤️</span><strong>{totalLikes}</strong><span>Total Likes</span></div>
            <div className="ds-card">
              <span className="ds-icon">✅</span>
              <strong>{recipes.filter(r => r.isPublished).length}</strong>
              <span>Published</span>
            </div>
            <div className="ds-card">
              <span className="ds-icon">⭐</span>
              <strong>{recipes.length > 0 ? recipes.reduce((m, r) => r.likesCount > m.likesCount ? r : m, recipes[0])?.title?.slice(0, 18) || '—' : '—'}</strong>
              <span>Most Liked</span>
            </div>
          </div>
        )}

        {/* Alerts */}
        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Create Form */}
        {view === 'create' && (
          <div className="form-panel">
            <div className="form-panel-header">
              <h2>Create New Recipe</h2>
              <button className="modal-close" onClick={cancelForm}>✕</button>
            </div>
            <RecipeForm onSubmit={handleCreate} onCancel={cancelForm} loading={saving} />
          </div>
        )}

        {/* Edit Form */}
        {view === 'edit' && editRecipe && (
          <div className="form-panel">
            <div className="form-panel-header">
              <h2>Edit: {editRecipe.title}</h2>
              <button className="modal-close" onClick={cancelForm}>✕</button>
            </div>
            <RecipeForm
              initialData={editRecipe}
              onSubmit={handleUpdate}
              onCancel={cancelForm}
              loading={saving}
            />
          </div>
        )}

        {/* Recipe List */}
        {view === 'list' && (
          <div className="recipe-management">
            <h2 className="rm-title">My Recipes ({recipes.length})</h2>
            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : recipes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍳</div>
                <h3>No recipes yet</h3>
                <p>Start sharing your culinary creations!</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setView('create')}>
                  Create Your First Recipe
                </button>
              </div>
            ) : (
              <div className="recipe-table-wrap">
                <table className="recipe-table">
                  <thead>
                    <tr>
                      <th>Recipe</th>
                      <th>Category</th>
                      <th>Difficulty</th>
                      <th>Likes</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipes.map(r => (
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
                              <small>{r.ingredients?.length || 0} ingredients</small>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge badge-slate">{r.category}</span></td>
                        <td>
                          <span className={`badge badge-${r.difficulty === 'Easy' ? 'green' : r.difficulty === 'Medium' ? 'amber' : 'rust'}`}>
                            {r.difficulty}
                          </span>
                        </td>
                        <td>❤️ {r.likesCount || 0}</td>
                        <td>
                          <span className={`badge ${r.isPublished ? 'badge-green' : 'badge-slate'}`}>
                            {r.isPublished ? 'Published' : 'Hidden'}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(r)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id, r.title)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
