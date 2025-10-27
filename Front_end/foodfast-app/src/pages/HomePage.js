import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ShoppingBag, Clock, MapPin } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600">
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center text-white max-w-4xl">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-full">
              <UtensilsCrossed className="w-20 h-20" />
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-4">FoodFast Delivery</h1>
          <p className="text-2xl md:text-3xl mb-4">Fast, Fresh, Delicious!</p>
          <p className="text-lg md:text-xl mb-12 text-white/90">
            Your favorite meals delivered right to your doorstep
          </p>
          
          {/* Main CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              to="/products" 
              className="px-10 py-4 bg-white text-orange-600 font-bold text-lg rounded-lg hover:bg-gray-100 transition-all shadow-2xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-6 h-6" />
              Browse Menu
            </Link>
            <Link 
              to="/login" 
              className="px-10 py-4 bg-transparent border-2 border-white text-white font-bold text-lg rounded-lg hover:bg-white hover:text-orange-600 transition-all flex items-center justify-center gap-2"
            >
              Login
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <Clock className="w-12 h-12 mx-auto mb-3" />
              <h3 className="font-semibold text-xl mb-2">Fast Delivery</h3>
              <p className="text-white/80">Get your food in 30 minutes or less</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-3" />
              <h3 className="font-semibold text-xl mb-2">Fresh Food</h3>
              <p className="text-white/80">Always fresh, always delicious</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <MapPin className="w-12 h-12 mx-auto mb-3" />
              <h3 className="font-semibold text-xl mb-2">Wide Coverage</h3>
              <p className="text-white/80">Delivering across the entire city</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
