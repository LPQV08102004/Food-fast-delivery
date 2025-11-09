import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

// Protected Route cho tất cả authenticated users
export const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Protected Route chỉ cho Admin
export const AdminRoute = ({ children }) => {
  const user = authService.getCurrentUser();

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!authService.isAdmin()) {
    // Redirect về home nếu không phải admin
    return <Navigate to="/" replace />;
  }

  return children;
};

// Protected Route chỉ cho User thường
export const UserRoute = ({ children }) => {
  const user = authService.getCurrentUser();

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Có thể thêm logic kiểm tra role nếu cần

  return children;
};

export default { ProtectedRoute, AdminRoute, UserRoute };

