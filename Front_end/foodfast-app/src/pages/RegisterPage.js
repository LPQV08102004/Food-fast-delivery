import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone } from 'lucide-react';
import authService from '../services/authService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    if (!agreeToTerms) {
      setError('Bạn phải đồng ý với điều khoản sử dụng!');
      return;
    }

    setLoading(true);

    try {
      // Gọi API đăng ký
      const response = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone
      });



      // Sau khi đăng ký thành công, tự động đăng nhập
      const loginResponse = await authService.login({
        username: formData.username,
        password: formData.password
      });



      // Chuyển sang trang sản phẩm
      navigate('/products');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
              <Lock className="w-8 h-8 text-[#FF6600]" />
              <h1 className="ml-2 text-2xl font-bold text-gray-800">
                FoodFast <span className="text-[#FF6600]">Delivery</span>
              </h1>
            </div>
          </div>

          <h2 className="text-xl font-bold text-center mb-6 text-gray-800">Create your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="username">
                Username *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="fullName">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phone">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0123456789"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  required
                  minLength="6"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="confirmPassword">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="h-4 w-4 text-[#FF6600] focus:ring-[#FF6600] border-gray-300 rounded mt-1"
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <Link to="/terms" className="text-[#FF6600] hover:text-[#e05c00]">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-[#FF6600] hover:text-[#e05c00]">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#FF6600] hover:bg-[#e05c00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6600] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng ký...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account?</span>
            <Link to="/login" className="ml-1 font-medium text-[#FF6600] hover:text-[#e05c00] transition-colors duration-200">
              Log in
            </Link>
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
