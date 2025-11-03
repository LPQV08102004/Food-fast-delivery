import { 
  Users, 
  ShoppingBag, 
  Plane, 
  Package, 
  UtensilsCrossed, 
  BarChart3, 
  Settings,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export function Sidebar({ activeScreen, onNavigate }: SidebarProps) {
  const [restaurantOpen, setRestaurantOpen] = useState(
    activeScreen === 'restaurant-list' || activeScreen === 'restaurant-register'
  );

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'user', label: 'User', icon: Users },
    { id: 'order', label: 'Order', icon: ShoppingBag },
    { id: 'drone', label: 'Drone', icon: Plane },
    { id: 'product', label: 'Product', icon: Package },
    { 
      id: 'restaurant', 
      label: 'Restaurant', 
      icon: UtensilsCrossed,
      subItems: [
        { id: 'restaurant-list', label: 'List Restaurant' },
        { id: 'restaurant-register', label: 'Register Restaurant' }
      ]
    },
    { id: 'setting', label: 'Setting', icon: Settings },
  ];

  const handleMenuClick = (id: string) => {
    if (id === 'restaurant') {
      setRestaurantOpen(!restaurantOpen);
    } else {
      onNavigate(id);
    }
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-blue-600">Fast Delivery Admin</h1>
      </div>
      
      <nav className="flex-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id || 
                          (item.subItems && item.subItems.some(sub => sub.id === activeScreen));
          
          return (
            <div key={item.id}>
              <button
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive && !item.subItems
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.subItems && (
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${
                      restaurantOpen ? 'rotate-180' : ''
                    }`} 
                  />
                )}
              </button>
              
              {item.subItems && restaurantOpen && (
                <div className="ml-4 mb-1">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => onNavigate(subItem.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg mb-1 transition-colors ${
                        activeScreen === subItem.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
