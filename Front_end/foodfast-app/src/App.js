import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { ProtectedRoute, AdminRoute, UserRoute, RestaurantRoute } from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductPage from './pages/ProductPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import PaymentResultPage from './pages/PaymentResultPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import RestaurantPage from './pages/RestaurantPage';
import RestaurantMenuPage from './pages/RestaurantMenuPage';
import TestConnectionPage from './pages/TestConnectionPage';
import './App.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/test-connection" element={<TestConnectionPage />} />
            
            {/* User routes - chỉ cho user thường (không phải admin hay restaurant) */}
            <Route 
              path="/products" 
              element={
                <UserRoute>
                  <ProductPage />
                </UserRoute>
              } 
            />
            <Route 
              path="/cart" 
              element={
                <UserRoute>
                  <CartPage />
                </UserRoute>
              } 
            />
            <Route 
              path="/payment" 
              element={
                <UserRoute>
                  <PaymentPage />
                </UserRoute>
              } 
            />
            <Route 
              path="/payment/result" 
              element={
                <UserRoute>
                  <PaymentResultPage />
                </UserRoute>
              } 
            />
            
            {/* Protected routes - cho tất cả user đã đăng nhập */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes - chỉ cho admin */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              } 
            />
            
            {/* Restaurant routes - chỉ cho restaurant owner */}
            <Route 
              path="/restaurant" 
              element={
                <RestaurantRoute>
                  <RestaurantPage />
                </RestaurantRoute>
              } 
            />
            <Route 
              path="/restaurant/:restaurantId/menu" 
              element={
                <RestaurantRoute>
                  <RestaurantMenuPage />
                </RestaurantRoute>
              } 
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
