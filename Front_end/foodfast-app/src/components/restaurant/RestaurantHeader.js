import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RestaurantHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any auth tokens or user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-end items-center gap-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
        <User className="w-5 h-5" />
      </div>
      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  );
}
