import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProfileScreen } from './components/ProfileScreen';
import { ProductScreen } from './components/ProductScreen';
import { OrderScreen } from './components/OrderScreen';
import { RevenueScreen } from './components/RevenueScreen';
import { SettingScreen } from './components/SettingScreen';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('profile');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'profile':
        return <ProfileScreen coverImage="https://images.unsplash.com/photo-1689789328902-4603809a250f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBkaW5pbmd8ZW58MXx8fHwxNzYyNjEzMDYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />;
      case 'product':
        return <ProductScreen />;
      case 'order':
        return <OrderScreen />;
      case 'revenue':
        return <RevenueScreen />;
      case 'setting':
        return <SettingScreen />;
      default:
        return <ProfileScreen coverImage="https://images.unsplash.com/photo-1689789328902-4603809a250f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBkaW5pbmd8ZW58MXx8fHwxNzYyNjEzMDYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeScreen={activeScreen} onScreenChange={setActiveScreen} />
      <div className="ml-64">
        <Header />
        <main>{renderScreen()}</main>
      </div>
    </div>
  );
}
