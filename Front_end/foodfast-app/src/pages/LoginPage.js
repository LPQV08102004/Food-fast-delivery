import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import authService from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({
        username: formData.username,
        password: formData.password
      });

      console.log('Login successful:', response);

      // Chuyển sang trang sản phẩm sau khi đăng nhập thành công
      navigate('/products');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <svg className="w-10 h-10 text-[#FF6600]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.5 4L18.5 6M18.5 6V8M18.5 6H16.5M18.5 6H20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M4 14H6C6.55228 14 7 14.4477 7 15V18C7 18.5523 6.55228 19 6 19H4C3.44772 19 3 18.5523 3 18V15C3 14.4477 3.44772 14 4 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M11 14H13C13.5523 14 14 14.4477 14 15V18C14 18.5523 13.5523 19 13 19H11C10.4477 19 10 18.5523 10 18V15C10 14.4477 10.4477 14 11 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18 14H20C20.5523 14 21 14.4477 21 15V18C21 18.5523 20.5523 19 20 19H18C17.4477 19 17 18.5523 17 18V15C17 14.4477 17.4477 14 18 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M21 9H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M11.9994 2H7.99942C6.3426 2 4.99942 3.34315 4.99942 5V9H14.9994V5C14.9994 3.34315 13.6563 2 11.9994 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h1 className="ml-2 text-2xl font-bold text-gray-800">FoodFast <span className="text-[#FF6600]">Delivery</span></h1>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center mb-6 text-gray-800">Log in to your account</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent transition-all duration-200"
                  id="username"
                  name="username"
                  type="text"
                  placeholder="your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent transition-all duration-200"
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="h-4 w-4 text-[#FF6600] focus:ring-[#FF6600] border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div>
                <Link to="/forgot-password" className="text-sm text-[#FF6600] hover:text-[#e05c00] transition-colors duration-200">
                  Forgot password?
                </Link>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#FF6600] hover:bg-[#e05c00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6600] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Log in'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don't have an account?</span>
            <Link to="/register" className="ml-1 font-medium text-[#FF6600] hover:text-[#e05c00] transition-colors duration-200">
              Sign up
            </Link>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to FoodFast's Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
          <div className="flex justify-center space-x-4 text-sm text-gray-600">
            <Link to="/help" className="hover:text-gray-900 transition-colors duration-200">Help</Link>
            <Link to="/privacy" className="hover:text-gray-900 transition-colors duration-200">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-900 transition-colors duration-200">Terms</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
