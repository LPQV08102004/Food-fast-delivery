import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { RestaurantSidebar } from '../components/restaurant/RestaurantSidebar';
import { RestaurantHeader } from '../components/restaurant/RestaurantHeader';
import { ProfileScreen } from '../components/restaurant/ProfileScreen';
import { ProductScreen } from '../components/restaurant/ProductScreen';
import { OrderScreen } from '../components/restaurant/OrderScreen';
import { RevenueScreen } from '../components/restaurant/RevenueScreen';
import { SettingScreen } from '../components/restaurant/SettingScreen';

function RestaurantPage() {
  const [activeScreen, setActiveScreen] = useState('profile');
  
  // TODO: Get restaurantId from logged-in user or context
  const restaurantId = 1;

  const renderScreen = () => {
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
