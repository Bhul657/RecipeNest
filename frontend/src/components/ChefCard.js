import React from 'react';
import { Link } from 'react-router-dom';
import './ChefCard.css';

const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=C0392B&color=fff&size=200&name=';

export default function ChefCard({ chef }) {
  const avatarUrl = chef.profileImage
    ? `http://localhost:5000${chef.profileImage}`
    : `${AVATAR_PLACEHOLDER}${encodeURIComponent(chef.name)}`;

  return (
    <Link to={`/chefs/${chef._id}`} className="chef-card">
      <div className="chef-card-img-wrap">
        <img src={avatarUrl} alt={chef.name} onError={(e) => {
          e.target.src = `${AVATAR_PLACEHOLDER}${encodeURIComponent(chef.name)}`;
        }} />
      </div>
      <div className="chef-card-body">
        <h3>{chef.name}</h3>
        {chef.specialty && <span className="chef-specialty">✦ {chef.specialty}</span>}
        {chef.bio && <p className="chef-bio">{chef.bio.slice(0, 100)}{chef.bio.length > 100 ? '…' : ''}</p>}
        <div className="chef-meta">
          <span>📖 {chef.recipeCount || 0} recipes</span>
          {chef.socialLinks?.instagram && <span>📸 Instagram</span>}
        </div>
        <div className="chef-card-cta">View Profile →</div>
      </div>
    </Link>
  );
}
