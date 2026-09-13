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
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    // Clear session token from browser storage
    sessionStorage.removeItem('admin_token');
    navigate('/admin/login', { replace: true });
  }, [navigate]);

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
  }, [fetchSubmissions]);

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
