// ============================================
// VÍ DỤ: Cách sử dụng ProtectedRoute trong App.js
// ============================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Import components
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ProductsPage from './pages/ProductsPage';

// Import Protected Routes
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import authService from './services/authService';

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes - Cho tất cả authenticated users */}
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />

        <Route path="/products" element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        } />

        {/* Admin Only Routes */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        } />

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

// ============================================
// VÍ DỤ: Login với role-based redirect
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { toast } from 'sonner';

function LoginPageExample() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData);

      toast.success('Login successful!');

      // Redirect dựa trên role
      const user = authService.getCurrentUser();

      if (authService.isAdmin()) {
        // Admin -> Admin Dashboard
        navigate('/admin');
      } else {
        // User thường -> Home hoặc Products
        navigate('/products');
      }

    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Test credentials */}
      <div style={{marginTop: '20px', padding: '10px', background: '#f0f0f0'}}>
        <p><strong>Test Accounts:</strong></p>
        <p>Admin: username: <code>admin</code>, password: <code>admin123</code></p>
        <p>User: username: <code>user</code>, password: <code>user123</code></p>
      </div>
    </div>
  );
}

// ============================================
// VÍ DỤ: Hiển thị menu dựa trên role
// ============================================

import authService from '../services/authService';

function NavigationExample() {
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();

  return (
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/products">Products</a></li>

        {/* Chỉ hiển thị cho Admin */}
        {isAdmin && (
          <>
            <li><a href="/admin">Admin Dashboard</a></li>
            <li><a href="/admin/users">Manage Users</a></li>
            <li><a href="/admin/orders">Manage Orders</a></li>
          </>
        )}

        {/* User info */}
        <li>
          Welcome, {user?.fullName || user?.username}
          {isAdmin && <span> (Admin)</span>}
        </li>

        <li>
          <button onClick={() => authService.logout()}>Logout</button>
        </li>
      </ul>
    </nav>
  );
}

