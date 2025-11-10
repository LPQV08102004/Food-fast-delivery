import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';

/**
 * Quick Access Button to Restaurant Dashboard
 * Can be placed in any page where restaurants need quick access
 */
export function RestaurantAccessButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/restaurant');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center gap-2 z-50"
    >
      <Store className="w-5 h-5" />
      <span className="font-semibold">Restaurant Dashboard</span>
    </button>
  );
}

/**
 * Inline Link to Restaurant Dashboard
 * Can be used in navigation menus or cards
 */
export function RestaurantLink({ className = "" }) {
  return (
    <a
      href="/restaurant"
      className={`flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline ${className}`}
    >
      <Store className="w-4 h-4" />
      <span>Restaurant Dashboard</span>
    </a>
  );
}

/**
 * Restaurant Card for Homepage or Dashboard
 */
export function RestaurantCard() {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/restaurant')}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center gap-4">
        <div className="bg-blue-100 p-4 rounded-full">
          <Store className="w-8 h-8 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Restaurant Dashboard
          </h3>
          <p className="text-gray-600">
            Quản lý sản phẩm, đơn hàng và doanh thu
          </p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Truy cập dashboard</span>
          <span className="text-blue-600 font-semibold">→</span>
        </div>
      </div>
    </div>
  );
}
