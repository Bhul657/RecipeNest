import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">🍴 RecipeNest</span>
          <p>A platform where chefs share their passion and food lovers find inspiration.</p>
        </div>
        <div className="footer-links">
          <h4>Explore</h4>
          <Link to="/chefs">Browse Chefs</Link>
          <Link to="/recipes">All Recipes</Link>
          <Link to="/register">Join as Chef</Link>
        </div>
        <div className="footer-links">
          <h4>Account</h4>
          <Link to="/login">Log In</Link>
          <Link to="/register">Sign Up</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} RecipeNest · Built with MERN Stack</p>
      </div>
    </footer>
  );
}
