import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllRecipes, getAllChefs } from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import ChefCard   from '../components/ChefCard';
import './Home.css';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [chefs,   setChefs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllRecipes({ sort: 'popular' }),
      getAllChefs()
    ]).then(([rRes, cRes]) => {
      setRecipes(rRes.data.recipes.slice(0, 6));
      setChefs(cRes.data.chefs.slice(0, 3));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <span className="hero-eyebrow">Welcome to RecipeNest</span>
          <h1>Where Chefs Share,<br /><em>Food Lovers Discover</em></h1>
          <p>Explore authentic recipes crafted by professional chefs.<br />Like, save, and share the dishes you love.</p>
          <div className="hero-btns">
            <Link to="/recipes" className="btn btn-primary btn-lg">Explore Recipes</Link>
            <Link to="/chefs"   className="btn btn-secondary btn-lg">Meet the Chefs</Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="stats-strip">
        <div className="container stats-grid">
          <div className="stat"><span className="stat-num">🍽</span><span>Hundreds of Recipes</span></div>
          <div className="stat"><span className="stat-num">👨‍🍳</span><span>Professional Chefs</span></div>
          <div className="stat"><span className="stat-num">❤️</span><span>Food Lover Community</span></div>
          <div className="stat"><span className="stat-num">🌍</span><span>World Cuisines</span></div>
        </div>
      </section>

      {/* Popular Recipes */}
      <section className="home-section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Popular Recipes</h2>
            <p className="section-subtitle">Trending dishes loved by our community</p>
          </div>
          <Link to="/recipes" className="btn btn-secondary">View All →</Link>
        </div>
        {loading
          ? <div className="loading-center"><div className="spinner" /></div>
          : <div className="grid-3">
              {recipes.map(r => <RecipeCard key={r._id} recipe={r} />)}
            </div>
        }
      </section>

      {/* Featured Chefs */}
      <section className="home-section home-chefs">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Chefs</h2>
              <p className="section-subtitle">Talented culinary artists sharing their expertise</p>
            </div>
            <Link to="/chefs" className="btn btn-secondary">All Chefs →</Link>
          </div>
          {loading
            ? <div className="loading-center"><div className="spinner" /></div>
            : <div className="grid-3">
                {chefs.map(c => <ChefCard key={c._id} chef={c} />)}
              </div>
          }
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section container">
        <div className="cta-card">
          <div>
            <h2>Are you a Chef?</h2>
            <p>Create your profile, build your recipe portfolio, and connect with food lovers around the world.</p>
          </div>
          <Link to="/register" className="btn btn-primary btn-lg">Join as a Chef</Link>
        </div>
      </section>
    </div>
  );
}
