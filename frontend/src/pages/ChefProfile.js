import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChefById } from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import './ChefProfile.css';

const AVATAR = 'https://ui-avatars.com/api/?background=C0392B&color=fff&size=300&name=';

export default function ChefProfile() {
  const { id } = useParams();
  const [chef,    setChef]    = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy,  setSortBy]  = useState('newest');

  useEffect(() => {
    getChefById(id)
      .then(({ data }) => {
        setChef(data.chef);
        setRecipes(data.recipes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const sortedRecipes = [...recipes].sort((a, b) => {
    if (sortBy === 'popular') return b.likesCount - a.likesCount;
    if (sortBy === 'az')      return a.title.localeCompare(b.title);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!chef)   return <div className="container"><div className="alert alert-error">Chef not found.</div></div>;

  const avatarSrc = chef.profileImage
    ? `http://localhost:5000${chef.profileImage}`
    : `${AVATAR}${encodeURIComponent(chef.name)}`;

  return (
    <div className="chef-profile-page">
      {/* Profile header */}
      <div className="chef-profile-hero">
        <div className="container chef-profile-hero-inner">
          <div className="chef-avatar-lg">
            <img src={avatarSrc} alt={chef.name} onError={e => e.target.src = `${AVATAR}${encodeURIComponent(chef.name)}`} />
          </div>
          <div className="chef-profile-info">
            <h1>{chef.name}</h1>
            {chef.specialty && <span className="chef-specialty-tag">✦ {chef.specialty}</span>}
            {chef.bio && <p className="chef-profile-bio">{chef.bio}</p>}
            <div className="chef-profile-stats">
              <div className="cpstat"><strong>{recipes.length}</strong><span>Recipes</span></div>
              <div className="cpstat"><strong>{recipes.reduce((s, r) => s + r.likesCount, 0)}</strong><span>Total Likes</span></div>
            </div>
            {/* Social links */}
            {(chef.socialLinks?.instagram || chef.socialLinks?.twitter || chef.socialLinks?.youtube) && (
              <div className="chef-socials">
                {chef.socialLinks.instagram && (
                  <a href={chef.socialLinks.instagram} target="_blank" rel="noreferrer" className="social-link">📸 Instagram</a>
                )}
                {chef.socialLinks.twitter && (
                  <a href={chef.socialLinks.twitter} target="_blank" rel="noreferrer" className="social-link">🐦 Twitter</a>
                )}
                {chef.socialLinks.youtube && (
                  <a href={chef.socialLinks.youtube} target="_blank" rel="noreferrer" className="social-link">▶️ YouTube</a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recipes section */}
      <div className="container" style={{ padding: '40px 24px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontSize: '1.5rem' }}>Recipe Portfolio ({recipes.length})</h2>
          <select
            className="form-input form-select"
            style={{ width: 'auto' }}
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="az">A → Z</option>
          </select>
        </div>

        {recipes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📖</div>
            <h3>No recipes yet</h3>
            <p>This chef hasn't posted any recipes yet.</p>
          </div>
        ) : (
          <div className="grid-3">
            {sortedRecipes.map(r => <RecipeCard key={r._id} recipe={{ ...r, chef }} />)}
          </div>
        )}
      </div>
    </div>
  );
}
