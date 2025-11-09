import { Home, Package, ShoppingCart, DollarSign, Settings } from 'lucide-react';

interface SidebarProps {
  activeScreen: string;
  onScreenChange: (screen: string) => void;
}

export function Sidebar({ activeScreen, onScreenChange }: SidebarProps) {
  const menuItems = [
    { id: 'profile', label: 'Profile', icon: Home },
    { id: 'product', label: 'Product', icon: Package },
    { id: 'order', label: 'Order', icon: ShoppingCart },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'setting', label: 'Setting', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-blue-600">Restaurant Dashboard</h1>
      </div>
      <nav className="p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
