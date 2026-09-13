import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Route protection guard for admin routes
 * Checks for valid admin session in sessionStorage
 */
export default function AdminProtectedRoute({ children }) {
  const token = sessionStorage.getItem('admin_token');

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
