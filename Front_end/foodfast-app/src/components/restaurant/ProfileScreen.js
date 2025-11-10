import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import restaurantService from '../../services/restaurantService';
import { toast } from 'sonner';

const ERROR_IMG_SRC = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

function ImageWithFallback({ src, alt, className, ...props }) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  return didError ? (
    <div className={`inline-block bg-gray-100 text-center align-middle ${className || ''}`}>
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Placeholder" {...props} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} {...props} onError={handleError} />
  );
}

export function ProfileScreen({ coverImage, restaurantId = 1 }) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await restaurantService.getRestaurantById(restaurantId);
        setRestaurant(data);
      } catch (error) {
        console.error('Error loading restaurant:', error);
        toast.error('Không thể tải thông tin nhà hàng');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center min-h-96">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center min-h-96">
          <p className="text-gray-500">Không tìm thấy thông tin nhà hàng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="h-64 bg-gray-200 relative">
          <ImageWithFallback
            src={coverImage || "https://images.unsplash.com/photo-1689789328902-4603809a250f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBkaW5pbmd8ZW58MXx8fHwxNzYyNjEzMDYzfDA&ixlib=rb-4.1.0&q=80&w=1080"}
            alt="Restaurant cover"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-8">
          <div className="space-y-6">
            <div>
              <label className="text-gray-600 text-sm">Name of Restaurant</label>
              <p className="mt-1 text-lg font-medium">{restaurant.name || 'N/A'}</p>
            </div>
            
            <div>
              <label className="text-gray-600 text-sm">Address</label>
              <p className="mt-1">{restaurant.address || 'N/A'}</p>
            </div>
            
            <div>
              <label className="text-gray-600 text-sm">Contact</label>
              <p className="mt-1">{restaurant.phoneNumber || 'N/A'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-600 text-sm">Rating</label>
                <p className="mt-1 text-lg font-medium">
                  ⭐ {restaurant.rating ? restaurant.rating.toFixed(1) : 'N/A'}
                </p>
              </div>
              
              <div>
                <label className="text-gray-600 text-sm">Delivery Time</label>
                <p className="mt-1">{restaurant.deliveryTime || 'N/A'}</p>
              </div>
            </div>

            <div>
              <label className="text-gray-600 text-sm">Total Products</label>
              <p className="mt-1 text-lg font-medium">{restaurant.productCount || 0} sản phẩm</p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
