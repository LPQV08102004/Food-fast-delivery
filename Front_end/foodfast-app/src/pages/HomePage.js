import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-500 to-red-600">
      <div className="text-center text-white px-4">
        <h1 className="text-6xl font-bold mb-4">FoodFast Delivery</h1>
        <p className="text-2xl mb-8">Fast, Fresh, Delicious!</p>
        <div className="flex gap-4 justify-center">
          <Link 
            to="/login" 
            className="px-8 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-all"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
