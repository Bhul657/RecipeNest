import React, { useEffect, useState, useCallback } from 'react';
import { getAllRecipes } from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import './RecipeList.css';

const CATEGORIES   = ['All','Breakfast','Lunch','Dinner','Dessert','Snack','Beverage','Other'];
const DIFFICULTIES = ['All','Easy','Medium','Hard'];
const SORTS = [
  { value: 'newest',  label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'oldest',  label: 'Oldest First' },
  { value: 'az',      label: 'A → Z' },
  { value: 'za',      label: 'Z → A' }
];

export default function RecipeList() {
  const [recipes,    setRecipes]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [sort,       setSort]       = useState('newest');
  const [count,      setCount]      = useState(0);

  const fetchRecipes = useCallback(() => {
    setLoading(true);
    const params = { sort };
    if (category   !== 'All') params.category   = category;
    if (difficulty !== 'All') params.difficulty = difficulty;
    if (search.trim()) params.search = search.trim();

    getAllRecipes(params)
      .then(({ data }) => { setRecipes(data.recipes); setCount(data.count); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, difficulty, sort, search]);

  useEffect(() => {
    const timer = setTimeout(fetchRecipes, 400);
    return () => clearTimeout(timer);
  }, [fetchRecipes]);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>All Recipes</h1>
          <p>Browse our full collection of chef-crafted dishes</p>
        </div>
      </div>

      <div className="container page-wrapper">
        {/* Filters */}
        <div className="recipe-filters">
          <input
            className="form-input filter-search"
            placeholder="🔍 Search recipes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="filter-chips">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`filter-chip ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
              >{c}</button>
            ))}
          </div>
          <div className="filter-row">
            <div>
              <label className="form-label">Difficulty</label>
              <select className="form-input form-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Sort by</label>
              <select className="form-input form-select" value={sort} onChange={e => setSort(e.target.value)}>
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {!loading && (
          <p className="results-count">{count} recipe{count !== 1 ? 's' : ''} found</p>
        )}

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : recipes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽</div>
            <h3>No recipes found</h3>
            <p>Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="grid-3">
            {recipes.map(r => <RecipeCard key={r._id} recipe={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}
