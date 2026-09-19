/**
 * API configuration utility
 * Safely resolves the backend API base URL across local development, Vercel, and Render deployments.
 */
export const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL.replace(/\/+$/, '');
  }
  if (process.env.REACT_APP_API_URL) {
    // If set to ".../api/contact", strip trailing "/contact"
    return process.env.REACT_APP_API_URL.replace(/\/contact\/?$/, '').replace(/\/+$/, '');
  }
  // Default fallback for local development
  return 'http://localhost:5000/api';
};
