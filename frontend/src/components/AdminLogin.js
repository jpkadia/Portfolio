import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import SEO from './SEO';
import { getApiBaseUrl } from '../utils/api';
import './AdminLogin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // If already authenticated, redirect directly to dashboard
  useEffect(() => {
    const existingToken = sessionStorage.getItem('admin_token');
    if (existingToken) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${getApiBaseUrl()}/admin/login`, {
        email: email.trim(),
        password
      });

      if (response.data?.token) {
        // Store JWT in sessionStorage (auto-cleared when browser session ends)
        sessionStorage.setItem('admin_token', response.data.token);
        navigate('/admin', { replace: true });
      } else {
        setError('Authentication response was invalid.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Admin Login | Parth Kadiya"
        description="Restricted Administrator Authentication Portal"
        robots="noindex, nofollow"
      />

      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-login-icon" aria-hidden="true">
              <i className="fa-solid fa-lock"></i>
            </div>
            <h1 className="admin-login-title">Admin Portal</h1>
            <p className="admin-login-subtitle">Sign in to access form submissions</p>
          </div>

          {error && (
            <div className="admin-error-banner" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="admin-email">Email Address</label>
              <input
                id="admin-email"
                type="email"
                className="admin-form-input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                disabled={isLoading}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                className="admin-form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="admin-login-btn"
              disabled={isLoading}
              aria-label={isLoading ? 'Signing in' : 'Sign In'}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <Link to="/" className="admin-back-link">
              ← Return to Portfolio
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
