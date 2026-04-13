import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-icon">🍴</span>
          <span className="logo-text">Recipe<span>Nest</span></span>
        </Link>

        {/* Hamburger */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        {/* Links */}
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/"        className={isActive('/')}       onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/chefs"   className={isActive('/chefs')}  onClick={() => setMenuOpen(false)}>Chefs</Link>
          <Link to="/recipes" className={isActive('/recipes')} onClick={() => setMenuOpen(false)}>Recipes</Link>

          {!user ? (
            <div className="navbar-auth">
              <Link to="/login"    className="btn btn-secondary btn-sm" onClick={() => setMenuOpen(false)}>Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm"   onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </div>
          ) : (
            <div className="navbar-user">
              <div className="user-menu-trigger">
                <div className="user-avatar">
                  {user.profileImage
                    ? <img src={user.profileImage} alt={user.name} />
                    : <span>{user.name?.charAt(0).toUpperCase()}</span>
                  }
                </div>
                <span className="user-name">{user.name}</span>
                <span className="chevron">▾</span>
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <span className={`badge badge-${user.role === 'chef' ? 'rust' : user.role === 'admin' ? 'amber' : 'slate'}`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="dropdown-divider" />
                  {user.role === 'chef' && (
                    <>
                      <Link to="/dashboard"    onClick={() => setMenuOpen(false)}>📊 Dashboard</Link>
                      <Link to="/edit-profile" onClick={() => setMenuOpen(false)}>✏️ Edit Profile</Link>
                    </>
                  )}
                  {user.role === 'foodlover' && (
                    <Link to="/my-favourites" onClick={() => setMenuOpen(false)}>❤️ My Favourites</Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}>🛡️ Admin Panel</Link>
                  )}
                  <div className="dropdown-divider" />
                  <button onClick={handleLogout} className="logout-btn">🚪 Log Out</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
