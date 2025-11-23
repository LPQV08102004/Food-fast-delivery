import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { RestaurantSidebar } from '../components/restaurant/RestaurantSidebar';
import { RestaurantHeader } from '../components/restaurant/RestaurantHeader';
import { ProfileScreen } from '../components/restaurant/ProfileScreen';
import { ProductScreen } from '../components/restaurant/ProductScreen';
import { OrderScreen } from '../components/restaurant/OrderScreen';
import { RevenueScreen } from '../components/restaurant/RevenueScreen';
import { SettingScreen } from '../components/restaurant/SettingScreen';
import authService from '../services/authService';

function RestaurantPage() {
  const [activeScreen, setActiveScreen] = useState('profile');
  const [restaurantId, setRestaurantId] = useState(null);
  
  // Lấy restaurantId từ authService
  useEffect(() => {
    const fetchRestaurantId = async () => {
      try {
        const id = authService.getRestaurantId();
        
        if (!id) {
          console.error('Không tìm thấy restaurantId cho user này');
          // Nếu chưa có restaurantId, thử lấy lại từ backend
          const user = authService.getCurrentUser();
          if (user && (user.role === 'RESTAURANT' || user.role === 'RESTAURANT_OWNER')) {
            try {
              const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api'}/restaurants/user/${user.id}`, {
                headers: {
                  'Authorization': `Bearer ${authService.getToken()}`
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data && data.id) {
                  localStorage.setItem('restaurantId', data.id.toString());
                  const updatedUser = { ...user, restaurantId: data.id };
                  localStorage.setItem('user', JSON.stringify(updatedUser));
                  setRestaurantId(data.id);

                }
              }
            } catch (error) {
              console.error('Error fetching restaurant from backend:', error);
            }
          }
        } else {
          setRestaurantId(id);

        }
      } catch (error) {
        console.error('Error getting restaurantId:', error);
      }
    };

    fetchRestaurantId();
  }, []);

  const renderScreen = () => {
    // Nếu đang loading hoặc chưa có restaurantId, hiển thị loading
    if (!restaurantId) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin nhà hàng...</p>
          </div>
        </div>
      );
    }

    switch (activeScreen) {
      case 'profile':
        return <ProfileScreen restaurantId={restaurantId} />;
      case 'product':
        return <ProductScreen restaurantId={restaurantId} />;
      case 'order':
        return <OrderScreen />;
      case 'revenue':
        return <RevenueScreen restaurantId={restaurantId} />;
      case 'setting':
        return <SettingScreen />;
      default:
        return <ProfileScreen restaurantId={restaurantId} />;
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-gray-50">
        <RestaurantSidebar activeScreen={activeScreen} onScreenChange={setActiveScreen} />
        <div className="ml-64">
          <RestaurantHeader />
          <main>{renderScreen()}</main>
        </div>
      </div>
    </>
  );
}

export default RestaurantPage;
