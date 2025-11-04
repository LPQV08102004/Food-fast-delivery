import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

// Protected Route - Yêu cầu đăng nhập
export function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Admin Route - Yêu cầu đăng nhập và role Admin
export function AdminRoute({ children }) {
  const user = authService.getCurrentUser();
  
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Kiểm tra role admin (tùy theo cấu trúc user object của bạn)
  if (user?.role !== 'ADMIN' && user?.role !== 'admin') {
    return <Navigate to="/products" replace />;
  }
  
  return children;
}

// Public Route - Chỉ cho phép truy cập khi chưa đăng nhập
export function PublicRoute({ children }) {
  if (authService.isAuthenticated()) {
    return <Navigate to="/products" replace />;
  }
  return children;
}
