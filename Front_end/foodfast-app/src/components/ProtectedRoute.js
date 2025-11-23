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
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Nếu là admin hoặc restaurant thì redirect về trang riêng của họ
  if (authService.isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  if (authService.isRestaurant()) {
    return <Navigate to="/restaurant" replace />;
  }

  return children;
};

// Protected Route chỉ cho Restaurant
export const RestaurantRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!authService.isRestaurant()) {
    // Redirect về home nếu không phải restaurant owner
    return <Navigate to="/" replace />;
  }

  return children;
};

const protectedRoutes = { ProtectedRoute, AdminRoute, UserRoute, RestaurantRoute };
export default protectedRoutes;

