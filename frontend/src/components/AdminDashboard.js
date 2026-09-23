import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import SEO from './SEO';
import { getApiBaseUrl } from '../utils/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCoFounder, setShowCoFounder] = useState(true);
  const [isUpdatingSetting, setIsUpdatingSetting] = useState(false);
  const [settingFeedback, setSettingFeedback] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    // Clear session token from browser storage
    sessionStorage.removeItem('admin_token');
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  const fetchSettings = useCallback(async () => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await axios.get(`${getApiBaseUrl()}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.success && typeof response.data.settings?.showCoFounderExperience === 'boolean') {
        setShowCoFounder(response.data.settings.showCoFounderExperience);
      }
    } catch (err) {
      console.error('Error fetching admin settings:', err);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
      handleLogout();
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.get(`${getApiBaseUrl()}/admin/submissions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.success) {
        setSubmissions(response.data.submissions || []);
        setTotalCount(response.data.count || 0);
      } else {
        setErrorMessage('Failed to load contact submissions.');
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Token expired or unauthorized
        handleLogout();
        return;
      }
      const msg = err.response?.data?.message || 'Unable to connect to the backend server.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    fetchSubmissions();
    fetchSettings();
  }, [fetchSubmissions, fetchSettings]);

  useEffect(() => {
    if (settingFeedback.text) {
      const timer = setTimeout(() => {
        setSettingFeedback({ type: '', text: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [settingFeedback]);

  const handleToggleCoFounder = async () => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
      handleLogout();
      return;
    }

    const nextVal = !showCoFounder;
    setIsUpdatingSetting(true);
    setSettingFeedback({ type: '', text: '' });

    try {
      const response = await axios.put(
        `${getApiBaseUrl()}/admin/settings`,
        { showCoFounderExperience: nextVal },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data?.success) {
        setShowCoFounder(nextVal);
        try {
          localStorage.setItem('cfg_show_cofounder', String(nextVal));
        } catch (e) {}

        setSettingFeedback({
          type: 'success',
          text: `Saved! Co-Founder experience is now ${nextVal ? 'ON (Visible on portfolio)' : 'OFF (Hidden from portfolio)'}.`
        });
      } else {
        setSettingFeedback({
          type: 'error',
          text: 'Failed to update setting. Please try again.'
        });
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
        return;
      }
      setSettingFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update setting. Check server connection.'
      });
    } finally {
      setIsUpdatingSetting(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      <SEO
        title="Admin Dashboard | Parth Kadiya"
        description="Restricted Administrator Dashboard"
        robots="noindex, nofollow"
      />

      <div className="admin-dash-wrapper">
        {/* Top Navbar */}
        <header className="admin-dash-navbar">
          <div className="admin-dash-brand">
            <h1>Admin Panel</h1>
            <span className="admin-dash-badge">Protected</span>
          </div>

          <div className="admin-dash-actions">
            <Link to="/" className="admin-dash-btn-refresh" title="View Public Portfolio">
              <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> View Site
            </Link>
            <button
              onClick={fetchSubmissions}
              className="admin-dash-btn-refresh"
              disabled={isLoading}
              title="Refresh submissions list"
            >
              <i className={`fa-solid fa-rotate ${isLoading ? 'fa-spin' : ''}`} aria-hidden="true"></i> Refresh
            </button>
            <button
              onClick={handleLogout}
              className="admin-dash-btn-logout"
              title="End admin session"
            >
              <i className="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Logout
            </button>
          </div>
        </header>

        <main className="admin-dash-container">
          {/* Total Form Submissions Counter */}
          <div className="admin-stat-card">
            <div className="admin-stat-info">
              <h2>Total Form Submissions</h2>
              <p className="admin-stat-value">{totalCount}</p>
            </div>
            <div className="admin-stat-icon" aria-hidden="true">
              <i className="fa-solid fa-inbox"></i>
            </div>
          </div>

          {/* Error notification */}
          {errorMessage && (
            <div className="admin-table-error" role="alert">
              {errorMessage}
            </div>
          )}

          {/* Portfolio Experience Display Controls Card */}
          <div className="admin-controls-card">
            <div className="admin-controls-header">
              <div className="admin-controls-title-group">
                <i className="fa-solid fa-sliders admin-controls-icon" aria-hidden="true"></i>
                <div>
                  <h2 className="admin-controls-title">Portfolio Display Controls</h2>
                  <p className="admin-controls-subtitle">
                    Manage the live visibility of startup and co-founder experience on your portfolio
                  </p>
                </div>
              </div>
            </div>

            {settingFeedback.text && (
              <div className={`admin-setting-feedback ${settingFeedback.type}`} role="status">
                <i
                  className={`fa-solid ${
                    settingFeedback.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'
                  }`}
                  aria-hidden="true"
                ></i>
                <span>{settingFeedback.text}</span>
              </div>
            )}

            <div className="admin-toggle-row">
              <div className="admin-toggle-info">
                <div className="admin-toggle-heading">
                  <span className="admin-toggle-label">Co-Founder &amp; Lead Developer (Techie Growera)</span>
                  <span className={`admin-status-pill ${showCoFounder ? 'status-active' : 'status-hidden'}`}>
                    <span className="status-dot"></span>
                    {showCoFounder ? 'Visible on Site' : 'Hidden from Site'}
                  </span>
                </div>
                <p className="admin-toggle-desc">
                  {showCoFounder
                    ? 'Currently visible on your live portfolio. Toggle OFF if you want to apply for full-time jobs without showing your startup role.'
                    : 'Currently hidden from your live portfolio. Public visitors will only see your full-time developer experience.'}
                </p>
              </div>

              <div className="admin-toggle-action">
                <label className="admin-switch" title={`Click to turn ${showCoFounder ? 'OFF' : 'ON'}`}>
                  <input
                    type="checkbox"
                    checked={showCoFounder}
                    disabled={isUpdatingSetting}
                    onChange={handleToggleCoFounder}
                    aria-label="Toggle Co-Founder Experience Visibility"
                  />
                  <span className={`admin-slider ${isUpdatingSetting ? 'updating' : ''}`}>
                    {isUpdatingSetting && <i className="fa-solid fa-circle-notch fa-spin toggle-spinner"></i>}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Submissions List Table */}
          <div className="admin-table-card">
            <div className="admin-table-header">
              <h2 className="admin-table-title">Contact Inquiries</h2>
              <span style={{ fontSize: '13px', color: '#9cb3d1' }}>
                Showing {submissions.length} {submissions.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            <div className="admin-table-responsive">
              {isLoading ? (
                <div className="admin-table-loading">
                  <i className="fa-solid fa-circle-notch fa-spin fa-2x" aria-hidden="true"></i>
                  <p style={{ marginTop: '12px' }}>Loading inquiries...</p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="admin-table-empty">
                  <i className="fa-regular fa-folder-open" aria-hidden="true"></i>
                  <p>No contact submissions recorded yet.</p>
                </div>
              ) : (
                <table className="admin-submissions-table" aria-label="Contact submissions list">
                  <thead>
                    <tr>
                      <th scope="col" style={{ width: '40px' }}>#</th>
                      <th scope="col">Name</th>
                      <th scope="col">Mobile</th>
                      <th scope="col">Message</th>
                      <th scope="col">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub, index) => (
                      <tr key={sub._id || index}>
                        <td style={{ color: '#8fa7c5', fontSize: '12px' }}>{index + 1}</td>
                        <td className="admin-cell-name">{sub.name}</td>
                        <td className="admin-cell-mobile">{sub.mobile}</td>
                        <td className="admin-cell-message">{sub.message}</td>
                        <td className="admin-cell-date">{formatDateTime(sub.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
