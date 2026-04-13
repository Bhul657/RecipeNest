import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function Register() {
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'foodlover' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      login(data.token, data.user);
      if (data.user.role === 'chef') navigate('/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🍴 RecipeNest</Link>
          <h1>Create account</h1>
          <p>Join the RecipeNest community</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="Min. 6 characters"
              required
            />
          </div>

          {/* Role selector */}
          <div className="form-group">
            <label className="form-label">I am joining as…</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${form.role === 'foodlover' ? 'selected' : ''}`}
                onClick={() => set('role', 'foodlover')}
              >
                <span className="role-icon">❤️</span>
                <strong>Food Lover</strong>
                <small>Discover & like recipes</small>
              </button>
              <button
                type="button"
                className={`role-option ${form.role === 'chef' ? 'selected' : ''}`}
                onClick={() => set('role', 'chef')}
              >
                <span className="role-icon">👨‍🍳</span>
                <strong>Chef</strong>
                <small>Share my recipes</small>
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
