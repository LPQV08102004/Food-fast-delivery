import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ReportScreen } from './components/screens/ReportScreen';
import { UserScreen } from './components/screens/UserScreen';
import { OrderScreen } from './components/screens/OrderScreen';
import { ProductScreen } from './components/screens/ProductScreen';
import { RestaurantListScreen } from './components/screens/RestaurantListScreen';
import { RestaurantRegisterScreen } from './components/screens/RestaurantRegisterScreen';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('dashboard');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <ReportScreen />;
      case 'user':
        return <UserScreen />;
      case 'order':
        return <OrderScreen />;
      case 'product':
        return <ProductScreen />;
      case 'restaurant-list':
        return <RestaurantListScreen />;
      case 'restaurant-register':
        return <RestaurantRegisterScreen />;
      case 'drone':
        return (
          <div className="p-8">
            <h1>Drone Management</h1>
            <p className="text-gray-500 mt-4">Drone management screen coming soon...</p>
          </div>
        );
      case 'setting':
        return (
          <div className="p-8">
            <h1>Settings</h1>
            <p className="text-gray-500 mt-4">Settings screen coming soon...</p>
          </div>
        );
      default:
        return <ReportScreen />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeScreen={activeScreen} onNavigate={setActiveScreen} />
      <main className="flex-1 overflow-auto">
        {renderScreen()}
      </main>
    </div>
  );
}
