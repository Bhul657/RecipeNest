import React, { useEffect, useState } from 'react';
import { getAllChefs } from '../utils/api';
import ChefCard from '../components/ChefCard';

export default function ChefsList() {
  const [chefs,   setChefs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    getAllChefs()
      .then(({ data }) => setChefs(data.chefs))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = chefs.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.specialty?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Our Chefs</h1>
          <p>Meet the talented culinary artists behind our recipes</p>
        </div>
      </div>

      <div className="container page-wrapper">
        {/* Search */}
        <div style={{ marginBottom: 36, maxWidth: 400 }}>
          <input
            className="form-input"
            placeholder="🔍 Search chefs by name or specialty…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👨‍🍳</div>
            <h3>No chefs found</h3>
            <p>Try a different search term</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--slate)', marginBottom: 24, fontSize: '0.9rem' }}>
              Showing {filtered.length} chef{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid-3">
              {filtered.map(c => <ChefCard key={c._id} chef={c} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
