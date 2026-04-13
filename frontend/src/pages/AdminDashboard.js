import React, { useEffect, useState } from 'react';
import {
  getAdminStats, getAdminUsers, getAdminRecipes,
  toggleUserStatus, deleteUser, adminDeleteRecipe, adminToggleRecipe
} from '../utils/api';
import './Dashboard.css';

export default function AdminDashboard() {
  const [tab,     setTab]     = useState('overview');
  const [stats,   setStats]   = useState(null);
  const [users,   setUsers]   = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg,     setMsg]     = useState({ type: '', text: '' });

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3500);
  };

  const fetchStats = async () => {
    try {
      const { data } = await getAdminStats();
      setStats(data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminUsers();
      setUsers(data.users);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminRecipes();
      setRecipes(data.recipes);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    if (tab === 'users')   fetchUsers();
    if (tab === 'recipes') fetchRecipes();
  }, [tab]);

  const handleToggleUser = async (id, name) => {
    try {
      const { data } = await toggleUserStatus(id);
      showMsg('success', `${name} ${data.user.isActive ? 'activated' : 'deactivated'}.`);
      fetchUsers();
    } catch (err) { showMsg('error', 'Action failed.'); }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" and all their content? This cannot be undone.`)) return;
    try {
      await deleteUser(id);
      showMsg('success', `${name} deleted.`);
      fetchUsers();
      fetchStats();
    } catch (err) { showMsg('error', 'Delete failed.'); }
  };

  const handleToggleRecipe = async (id, title) => {
    try {
      const { data } = await adminToggleRecipe(id);
      showMsg('success', `"${title}" ${data.recipe.isPublished ? 'published' : 'unpublished'}.`);
      fetchRecipes();
    } catch (err) { showMsg('error', 'Action failed.'); }
  };

  const handleDeleteRecipe = async (id, title) => {
    if (!window.confirm(`Permanently delete "${title}"?`)) return;
    try {
      await adminDeleteRecipe(id);
      showMsg('success', `"${title}" deleted.`);
      fetchRecipes();
      fetchStats();
    } catch (err) { showMsg('error', 'Delete failed.'); }
  };

  const roleColor = { chef: 'rust', foodlover: 'slate', admin: 'amber' };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>🛡️ Admin Dashboard</h1>
            <p>Manage users, chefs, and all recipes on the platform.</p>
          </div>
        </div>

        {/* Alert */}
        {msg.text && (
          <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>
        )}

        {/* Tabs */}
        <div className="admin-tabs">
          {['overview', 'users', 'recipes'].map(t => (
            <button
              key={t}
              className={`admin-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'overview' ? '📊 Overview' : t === 'users' ? '👥 Users' : '📖 Recipes'}
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW ─────────────────────────── */}
        {tab === 'overview' && stats && (
          <div>
            <div className="dashboard-stats">
              <div className="ds-card"><span className="ds-icon">👥</span><strong>{stats.stats.totalUsers}</strong><span>Total Users</span></div>
              <div className="ds-card"><span className="ds-icon">👨‍🍳</span><strong>{stats.stats.totalChefs}</strong><span>Chefs</span></div>
              <div className="ds-card"><span className="ds-icon">❤️</span><strong>{stats.stats.totalFoodLovers}</strong><span>Food Lovers</span></div>
              <div className="ds-card"><span className="ds-icon">📖</span><strong>{stats.stats.totalRecipes}</strong><span>Recipes</span></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Recent Users */}
              <div className="recipe-management">
                <div className="rm-title">Recent Users</div>
                <table className="recipe-table">
                  <thead><tr><th>User</th><th>Role</th></tr></thead>
                  <tbody>
                    {stats.recentUsers.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-cell-avatar">{u.name?.charAt(0)}</div>
                            <div><strong>{u.name}</strong><small>{u.email}</small></div>
                          </div>
                        </td>
                        <td><span className={`badge badge-${roleColor[u.role] || 'slate'}`}>{u.role}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recent Recipes */}
              <div className="recipe-management">
                <div className="rm-title">Recent Recipes</div>
                <table className="recipe-table">
                  <thead><tr><th>Recipe</th><th>Chef</th></tr></thead>
                  <tbody>
                    {stats.recentRecipes.map(r => (
                      <tr key={r._id}>
                        <td><strong style={{ fontSize: '0.88rem' }}>{r.title}</strong></td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--slate)' }}>{r.chef?.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── USERS ────────────────────────────── */}
        {tab === 'users' && (
          <div className="recipe-management">
            <div className="rm-title">All Users ({users.length})</div>
            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : (
              <div className="recipe-table-wrap">
                <table className="recipe-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-cell-avatar">{u.name?.charAt(0)}</div>
                            <div><strong>{u.name}</strong><small>{u.email}</small></div>
                          </div>
                        </td>
                        <td><span className={`badge badge-${roleColor[u.role] || 'slate'}`}>{u.role}</span></td>
                        <td>
                          <span className={`badge ${u.isActive ? 'badge-green' : 'badge-rust'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--slate)' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="row-actions">
                            {u.role !== 'admin' && (
                              <>
                                <button
                                  className={`btn btn-sm ${u.isActive ? 'btn-secondary' : 'btn-success'}`}
                                  onClick={() => handleToggleUser(u._id, u.name)}
                                >
                                  {u.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDeleteUser(u._id, u.name)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                            {u.role === 'admin' && <span style={{ fontSize: '0.8rem', color: 'var(--slate)' }}>Protected</span>}
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

        {/* ─── RECIPES ──────────────────────────── */}
        {tab === 'recipes' && (
          <div className="recipe-management">
            <div className="rm-title">All Recipes ({recipes.length})</div>
            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : (
              <div className="recipe-table-wrap">
                <table className="recipe-table">
                  <thead>
                    <tr>
                      <th>Recipe</th>
                      <th>Chef</th>
                      <th>Category</th>
                      <th>Likes</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipes.map(r => (
                      <tr key={r._id}>
                        <td><strong style={{ fontSize: '0.88rem' }}>{r.title}</strong></td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--slate)' }}>{r.chef?.name}</td>
                        <td><span className="badge badge-slate">{r.category}</span></td>
                        <td>❤️ {r.likesCount || 0}</td>
                        <td>
                          <span className={`badge ${r.isPublished ? 'badge-green' : 'badge-rust'}`}>
                            {r.isPublished ? 'Published' : 'Hidden'}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className={`btn btn-sm ${r.isPublished ? 'btn-secondary' : 'btn-success'}`}
                              onClick={() => handleToggleRecipe(r._id, r.title)}
                            >
                              {r.isPublished ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteRecipe(r._id, r.title)}
                            >
                              Delete
                            </button>
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
