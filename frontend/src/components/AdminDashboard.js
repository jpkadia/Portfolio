import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import SEO from './SEO';
import { getApiBaseUrl } from '../utils/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' | 'visitors' | 'controls'
  const navigate = useNavigate();

  // Contact Inquiries State
  const [submissions, setSubmissions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [subSearch, setSubSearch] = useState('');
  const [subPage, setSubPage] = useState(1);
  const [deletingSubId, setDeletingSubId] = useState(null);

  // Visitor Analytics State
  const [visitors, setVisitors] = useState([]);
  const [visitorTotalCount, setVisitorTotalCount] = useState(0);
  const [visitorPage, setVisitorPage] = useState(1);
  const [visitorTotalPages, setVisitorTotalPages] = useState(1);
  const [isVisitorLoading, setIsVisitorLoading] = useState(false);
  const [visitorSearch, setVisitorSearch] = useState('');
  const [deletingVisitorId, setDeletingVisitorId] = useState(null);

  // Settings / Controls State
  const [showCoFounder, setShowCoFounder] = useState(true);
  const [isUpdatingSetting, setIsUpdatingSetting] = useState(false);

  // Global / Notification Feedback
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('admin_token');
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  // Auto-dismiss feedback after 4 seconds
  useEffect(() => {
    if (feedback.text) {
      const timer = setTimeout(() => {
        setFeedback({ type: '', text: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Set body class for admin layout (prevents white space at bottom on mobile)
  useEffect(() => {
    document.body.classList.add('admin-body');
    return () => {
      document.body.classList.remove('admin-body');
    };
  }, []);

  // Fetch Settings (Co-founder toggle)
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

  // Fetch Submissions (Contact form)
  const fetchSubmissions = useCallback(async () => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
      handleLogout();
      return;
    }

    setIsLoadingSubmissions(true);
    setErrorMessage('');

    try {
      const response = await axios.get(`${getApiBaseUrl()}/admin/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        setSubmissions(response.data.submissions || []);
        setTotalCount(response.data.count || 0);
      } else {
        setErrorMessage('Failed to load contact submissions.');
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
        return;
      }
      const msg = err.response?.data?.message || 'Unable to connect to the backend server.';
      setErrorMessage(msg);
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, [handleLogout]);

  // Fetch Visitors with server-side pagination & search
  const fetchVisitors = useCallback(async (page = 1, search = '') => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
      handleLogout();
      return;
    }

    setIsVisitorLoading(true);
    try {
      const response = await axios.get(`${getApiBaseUrl()}/analytics/visitors`, {
        params: {
          page,
          limit: 10,
          search
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        setVisitors(response.data.visitors || []);
        setVisitorTotalCount(response.data.count || 0);
        setVisitorPage(response.data.page || 1);
        setVisitorTotalPages(response.data.totalPages || 1);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
        return;
      }
      console.error('Error fetching visitor analytics:', err);
    } finally {
      setIsVisitorLoading(false);
    }
  }, [handleLogout]);

  // Initial load
  useEffect(() => {
    fetchSubmissions();
    fetchSettings();
    fetchVisitors(1, '');
  }, [fetchSubmissions, fetchSettings, fetchVisitors]);

  // Debounced search for visitors
  useEffect(() => {
    if (activeTab !== 'visitors') return;
    const timer = setTimeout(() => {
      fetchVisitors(1, visitorSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [visitorSearch, activeTab, fetchVisitors]);

  // Refresh all data
  const handleRefreshAll = () => {
    if (activeTab === 'messages') {
      fetchSubmissions();
    } else if (activeTab === 'visitors') {
      fetchVisitors(visitorPage, visitorSearch);
    } else {
      fetchSettings();
    }
  };

  // Toggle Co-Founder Experience
  const handleToggleCoFounder = async () => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
      handleLogout();
      return;
    }

    const nextVal = !showCoFounder;
    setIsUpdatingSetting(true);

    try {
      const response = await axios.put(
        `${getApiBaseUrl()}/admin/settings`,
        { showCoFounderExperience: nextVal },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        setShowCoFounder(nextVal);
        try {
          localStorage.setItem('cfg_show_cofounder', String(nextVal));
        } catch (e) {}

        setFeedback({
          type: 'success',
          text: `Saved! Co-Founder experience is now ${nextVal ? 'ON (Visible on portfolio)' : 'OFF (Hidden from portfolio)'}.`
        });
      } else {
        setFeedback({
          type: 'error',
          text: 'Failed to update setting. Please try again.'
        });
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
        return;
      }
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update setting. Check server connection.'
      });
    } finally {
      setIsUpdatingSetting(false);
    }
  };

  // Delete Contact Submission
  const handleDeleteSubmission = async (id, name) => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
      handleLogout();
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete the inquiry from "${name || 'this contact'}"?\nThis will remove it from the database.`
    );
    if (!confirmed) return;

    setDeletingSubId(id);
    try {
      const response = await axios.delete(`${getApiBaseUrl()}/admin/submissions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        setSubmissions(prev => {
          const next = prev.filter(item => item._id !== id);
          const newTotalPages = Math.ceil(next.length / 10) || 1;
          if (subPage > newTotalPages) {
            setSubPage(newTotalPages);
          }
          return next;
        });
        setTotalCount(prev => Math.max(0, prev - 1));
        setFeedback({
          type: 'success',
          text: `Inquiry from "${name || 'contact'}" was permanently deleted.`
        });
      } else {
        setFeedback({
          type: 'error',
          text: response.data?.message || 'Failed to delete inquiry.'
        });
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
        return;
      }
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete inquiry from database.'
      });
    } finally {
      setDeletingSubId(null);
    }
  };

  // Delete Visitor Log
  const handleDeleteVisitor = async (id, ip) => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
      handleLogout();
      return;
    }

    const confirmed = window.confirm(`Delete visitor log entry for IP: ${ip || 'Unknown'}?`);
    if (!confirmed) return;

    setDeletingVisitorId(id);
    try {
      const response = await axios.delete(`${getApiBaseUrl()}/analytics/visitors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        fetchVisitors(visitorPage, visitorSearch);
        setFeedback({
          type: 'success',
          text: 'Visitor log entry deleted successfully.'
        });
      } else {
        setFeedback({
          type: 'error',
          text: response.data?.message || 'Failed to delete visitor log.'
        });
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
        return;
      }
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete visitor log.'
      });
    } finally {
      setDeletingVisitorId(null);
    }
  };

  // Date Formatter
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

  // Client-side filtering & 10-per-page pagination for Contact Inquiries
  const filteredSubmissions = useMemo(() => {
    if (!subSearch.trim()) return submissions;
    const query = subSearch.toLowerCase().trim();
    return submissions.filter(sub => {
      const name = (sub.name || '').toLowerCase();
      const mobile = (sub.mobile || '').toLowerCase();
      const message = (sub.message || '').toLowerCase();
      const date = formatDateTime(sub.createdAt).toLowerCase();
      return name.includes(query) || mobile.includes(query) || message.includes(query) || date.includes(query);
    });
  }, [submissions, subSearch]);

  const totalSubPages = Math.max(1, Math.ceil(filteredSubmissions.length / 10));

  const paginatedSubmissions = useMemo(() => {
    const startIndex = (subPage - 1) * 10;
    return filteredSubmissions.slice(startIndex, startIndex + 10);
  }, [filteredSubmissions, subPage]);

  // Pagination Range Helper
  const getPaginationRange = (currentPage, totalPages) => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  // Device badge icon helper
  const getDeviceIcon = (device) => {
    const d = (device || '').toLowerCase();
    if (d === 'mobile') return 'fa-solid fa-mobile-screen';
    if (d === 'tablet') return 'fa-solid fa-tablet-screen-button';
    return 'fa-solid fa-desktop';
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
              onClick={handleRefreshAll}
              className="admin-dash-btn-refresh"
              disabled={isLoadingSubmissions || isVisitorLoading}
              title="Refresh current data"
            >
              <i className={`fa-solid fa-rotate ${isLoadingSubmissions || isVisitorLoading ? 'fa-spin' : ''}`} aria-hidden="true"></i> Refresh
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
          {/* Quick Stats Grid */}
          <div className="admin-stats-grid">
            {/* Stat Card 1: Contact Form Submissions */}
            <div
              className={`admin-stat-card ${activeTab === 'messages' ? 'stat-active' : ''}`}
              onClick={() => setActiveTab('messages')}
              role="button"
              tabIndex={0}
              title="View Contact Inquiries"
            >
              <div className="admin-stat-info">
                <h2>Contact Inquiries</h2>
                <p className="admin-stat-value">{totalCount}</p>
                <span className="admin-stat-subtext">Received via portfolio</span>
              </div>
              <div className="admin-stat-icon" aria-hidden="true">
                <i className="fa-solid fa-inbox"></i>
              </div>
            </div>

            {/* Stat Card 2: Visitor Analytics */}
            <div
              className={`admin-stat-card ${activeTab === 'visitors' ? 'stat-active' : ''}`}
              onClick={() => setActiveTab('visitors')}
              role="button"
              tabIndex={0}
              title="View Visitor Analytics"
            >
              <div className="admin-stat-info">
                <h2>Total Visitors Tracked</h2>
                <p className="admin-stat-value">{visitorTotalCount}</p>
                <span className="admin-stat-subtext">Active 60-day auto-purge</span>
              </div>
              <div className="admin-stat-icon" aria-hidden="true">
                <i className="fa-solid fa-chart-line"></i>
              </div>
            </div>

            {/* Stat Card 3: Experience Setting */}
            <div
              className={`admin-stat-card ${activeTab === 'controls' ? 'stat-active' : ''}`}
              onClick={() => setActiveTab('controls')}
              role="button"
              tabIndex={0}
              title="Manage Display Settings"
            >
              <div className="admin-stat-info">
                <h2>Co-Founder Section</h2>
                <p className="admin-stat-status">
                  <span className={`status-dot ${showCoFounder ? 'dot-active' : 'dot-hidden'}`}></span>
                  {showCoFounder ? 'Visible' : 'Hidden'}
                </p>
                <span className="admin-stat-subtext">Job recruiter visibility</span>
              </div>
              <div className="admin-stat-icon" aria-hidden="true">
                <i className="fa-solid fa-sliders"></i>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="admin-tabs-nav" role="tablist">
            <button
              className={`admin-tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
              role="tab"
              aria-selected={activeTab === 'messages'}
            >
              <i className="fa-solid fa-inbox"></i> Contact Inquiries
              <span className="admin-tab-badge">{totalCount}</span>
            </button>

            <button
              className={`admin-tab-btn ${activeTab === 'visitors' ? 'active' : ''}`}
              onClick={() => setActiveTab('visitors')}
              role="tab"
              aria-selected={activeTab === 'visitors'}
            >
              <i className="fa-solid fa-users"></i> Visitor Analytics
              <span className="admin-tab-badge">{visitorTotalCount}</span>
            </button>

            <button
              className={`admin-tab-btn ${activeTab === 'controls' ? 'active' : ''}`}
              onClick={() => setActiveTab('controls')}
              role="tab"
              aria-selected={activeTab === 'controls'}
            >
              <i className="fa-solid fa-sliders"></i> Portfolio Controls
            </button>
          </div>

          {/* Global Feedback Banner */}
          {feedback.text && (
            <div className={`admin-action-feedback ${feedback.type}`} role="status">
              <i
                className={`fa-solid ${
                  feedback.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'
                }`}
                aria-hidden="true"
              ></i>
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Top Error Notification */}
          {errorMessage && (
            <div className="admin-table-error" role="alert">
              {errorMessage}
            </div>
          )}

          {/* =========================================================
              TAB 1: CONTACT INQUIRIES
             ========================================================= */}
          {activeTab === 'messages' && (
            <div className="admin-table-card">
              <div className="admin-table-header">
                <div>
                  <h2 className="admin-table-title">Contact Inquiries</h2>
                  <p className="admin-table-subtitle">
                    Permanent messages submitted through your portfolio contact form
                  </p>
                </div>
                <span className="admin-table-counter">
                  Showing {filteredSubmissions.length === 0 ? 0 : (subPage - 1) * 10 + 1} - {Math.min(subPage * 10, filteredSubmissions.length)} of {filteredSubmissions.length}
                </span>
              </div>

              {/* Search Bar */}
              <div className="admin-table-search-bar">
                <div className="admin-search-wrapper">
                  <i className="fa-solid fa-magnifying-glass admin-search-icon" aria-hidden="true"></i>
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search by name, mobile, message, or date..."
                    value={subSearch}
                    onChange={(e) => {
                      setSubSearch(e.target.value);
                      setSubPage(1);
                    }}
                    aria-label="Search contact inquiries"
                  />
                  {subSearch && (
                    <button
                      className="admin-search-clear"
                      onClick={() => {
                        setSubSearch('');
                        setSubPage(1);
                      }}
                      title="Clear search"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Responsive Data Table */}
              <div className="admin-table-responsive">
                {isLoadingSubmissions ? (
                  <div className="admin-table-loading">
                    <i className="fa-solid fa-circle-notch fa-spin fa-2x" aria-hidden="true"></i>
                    <p style={{ marginTop: '12px' }}>Loading inquiries...</p>
                  </div>
                ) : filteredSubmissions.length === 0 ? (
                  <div className="admin-table-empty">
                    <i className="fa-regular fa-folder-open" aria-hidden="true"></i>
                    <p>{subSearch ? 'No inquiries matching your search criteria.' : 'No contact submissions recorded yet.'}</p>
                  </div>
                ) : (
                  <table className="admin-submissions-table" aria-label="Contact submissions list">
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: '45px' }}>#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Mobile</th>
                        <th scope="col">Message</th>
                        <th scope="col">Submitted At</th>
                        <th scope="col" style={{ width: '90px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSubmissions.map((sub, index) => {
                        const serialNumber = (subPage - 1) * 10 + index + 1;
                        const isDeleting = deletingSubId === sub._id;
                        return (
                          <tr key={sub._id || index}>
                            <td style={{ color: '#8fa7c5', fontSize: '12px' }}>{serialNumber}</td>
                            <td className="admin-cell-name">{sub.name}</td>
                            <td className="admin-cell-mobile">{sub.mobile}</td>
                            <td className="admin-cell-message">{sub.message}</td>
                            <td className="admin-cell-date">{formatDateTime(sub.createdAt)}</td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                className="admin-btn-delete"
                                onClick={() => handleDeleteSubmission(sub._id, sub.name)}
                                disabled={isDeleting}
                                title={`Delete inquiry from ${sub.name}`}
                                aria-label={`Delete inquiry from ${sub.name}`}
                              >
                                {isDeleting ? (
                                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                                ) : (
                                  <>
                                    <i className="fa-solid fa-trash" aria-hidden="true"></i>
                                    <span>Delete</span>
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination Controls (10 entries per page) */}
              {filteredSubmissions.length > 0 && (
                <div className="admin-pagination-container">
                  <div className="admin-pagination-info">
                    Showing {(subPage - 1) * 10 + 1} to {Math.min(subPage * 10, filteredSubmissions.length)} of {filteredSubmissions.length} entries (Page {subPage} of {totalSubPages})
                  </div>
                  <div className="admin-pagination-controls">
                    <button
                      className="admin-page-btn"
                      onClick={() => setSubPage(p => Math.max(1, p - 1))}
                      disabled={subPage === 1}
                      title="Previous page"
                    >
                      <i className="fa-solid fa-chevron-left"></i> Prev
                    </button>

                    {getPaginationRange(subPage, totalSubPages).map((item, idx) => (
                      item === '...' ? (
                        <span key={`sub-ellipsis-${idx}`} className="admin-page-ellipsis">...</span>
                      ) : (
                        <button
                          key={`sub-page-${item}`}
                          className={`admin-page-btn ${subPage === item ? 'active' : ''}`}
                          onClick={() => setSubPage(item)}
                        >
                          {item}
                        </button>
                      )
                    ))}

                    <button
                      className="admin-page-btn"
                      onClick={() => setSubPage(p => Math.min(totalSubPages, p + 1))}
                      disabled={subPage === totalSubPages}
                      title="Next page"
                    >
                      Next <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              TAB 2: VISITOR ANALYTICS
             ========================================================= */}
          {activeTab === 'visitors' && (
            <div className="admin-table-card">
              <div className="admin-table-header">
                <div>
                  <h2 className="admin-table-title">Visitor Analytics</h2>
                  <p className="admin-table-subtitle">
                    Live session analytics tracked across IP, Operating System, Browser, and Sections
                  </p>
                </div>
                <span className="admin-table-counter">
                  Showing {visitorTotalCount === 0 ? 0 : (visitorPage - 1) * 10 + 1} - {Math.min(visitorPage * 10, visitorTotalCount)} of {visitorTotalCount}
                </span>
              </div>

              {/* TTL 60-day auto-purge alert banner */}
              <div className="admin-ttl-badge">
                <i className="fa-solid fa-clock-rotate-left"></i>
                <span>
                  <strong>60-Day Auto Purge Active:</strong> Visitor analytics are automatically cleared after 60 days via native MongoDB TTL. Contact form submissions are permanently protected.
                </span>
              </div>

              {/* Search Bar */}
              <div className="admin-table-search-bar">
                <div className="admin-search-wrapper">
                  <i className="fa-solid fa-magnifying-glass admin-search-icon" aria-hidden="true"></i>
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search by IP, OS (Windows/Android), Browser, Device, or Section..."
                    value={visitorSearch}
                    onChange={(e) => setVisitorSearch(e.target.value)}
                    aria-label="Search visitors"
                  />
                  {visitorSearch && (
                    <button
                      className="admin-search-clear"
                      onClick={() => setVisitorSearch('')}
                      title="Clear search"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Responsive Data Table */}
              <div className="admin-table-responsive">
                {isVisitorLoading ? (
                  <div className="admin-table-loading">
                    <i className="fa-solid fa-circle-notch fa-spin fa-2x" aria-hidden="true"></i>
                    <p style={{ marginTop: '12px' }}>Loading visitor logs...</p>
                  </div>
                ) : visitors.length === 0 ? (
                  <div className="admin-table-empty">
                    <i className="fa-regular fa-folder-open" aria-hidden="true"></i>
                    <p>{visitorSearch ? 'No visitors found matching your search term.' : 'No visitor logs tracked yet.'}</p>
                  </div>
                ) : (
                  <table className="admin-submissions-table" aria-label="Visitor analytics list">
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: '45px' }}>#</th>
                        <th scope="col">IP Address</th>
                        <th scope="col">Device &amp; OS</th>
                        <th scope="col">Browser</th>
                        <th scope="col">Section Viewed</th>
                        <th scope="col">Referrer</th>
                        <th scope="col">Visited At</th>
                        <th scope="col" style={{ width: '80px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitors.map((v, index) => {
                        const serialNumber = (visitorPage - 1) * 10 + index + 1;
                        const isDeleting = deletingVisitorId === v._id;
                        return (
                          <tr key={v._id || index}>
                            <td style={{ color: '#8fa7c5', fontSize: '12px' }}>{serialNumber}</td>
                            <td className="admin-cell-ip">
                              <code>{v.ip || 'Unknown'}</code>
                            </td>
                            <td>
                              <div className="admin-badge-group">
                                <span className="admin-pill-badge badge-device">
                                  <i className={getDeviceIcon(v.device)} aria-hidden="true"></i> {v.device || 'Desktop'}
                                </span>
                                <span className="admin-pill-badge badge-os">
                                  {v.os || 'Unknown'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="admin-pill-badge badge-browser">
                                {v.browser || 'Unknown'}
                              </span>
                            </td>
                            <td>
                              <span className="admin-pill-badge badge-section">
                                #{v.section || 'home'}
                              </span>
                            </td>
                            <td className="admin-cell-referrer" title={v.referrer || 'Direct'}>
                              {v.referrer || 'Direct'}
                            </td>
                            <td className="admin-cell-date">{formatDateTime(v.createdAt)}</td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                className="admin-btn-delete-small"
                                onClick={() => handleDeleteVisitor(v._id, v.ip)}
                                disabled={isDeleting}
                                title="Delete this visitor log"
                                aria-label="Delete this visitor log"
                              >
                                {isDeleting ? (
                                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                                ) : (
                                  <i className="fa-solid fa-trash" aria-hidden="true"></i>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination Controls (10 entries per page) */}
              {visitorTotalCount > 0 && (
                <div className="admin-pagination-container">
                  <div className="admin-pagination-info">
                    Showing {(visitorPage - 1) * 10 + 1} to {Math.min(visitorPage * 10, visitorTotalCount)} of {visitorTotalCount} entries (Page {visitorPage} of {visitorTotalPages})
                  </div>
                  <div className="admin-pagination-controls">
                    <button
                      className="admin-page-btn"
                      onClick={() => {
                        const next = Math.max(1, visitorPage - 1);
                        fetchVisitors(next, visitorSearch);
                      }}
                      disabled={visitorPage <= 1}
                      title="Previous page"
                    >
                      <i className="fa-solid fa-chevron-left"></i> Prev
                    </button>

                    {getPaginationRange(visitorPage, visitorTotalPages).map((item, idx) => (
                      item === '...' ? (
                        <span key={`vis-ellipsis-${idx}`} className="admin-page-ellipsis">...</span>
                      ) : (
                        <button
                          key={`vis-page-${item}`}
                          className={`admin-page-btn ${visitorPage === item ? 'active' : ''}`}
                          onClick={() => fetchVisitors(item, visitorSearch)}
                        >
                          {item}
                        </button>
                      )
                    ))}

                    <button
                      className="admin-page-btn"
                      onClick={() => {
                        const next = Math.min(visitorTotalPages, visitorPage + 1);
                        fetchVisitors(next, visitorSearch);
                      }}
                      disabled={visitorPage >= visitorTotalPages}
                      title="Next page"
                    >
                      Next <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              TAB 3: PORTFOLIO DISPLAY CONTROLS
             ========================================================= */}
          {activeTab === 'controls' && (
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
          )}
        </main>
      </div>
    </>
  );
}
