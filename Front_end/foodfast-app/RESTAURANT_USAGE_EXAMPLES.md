# Ví dụ sử dụng Restaurant Dashboard

## 1. Nút nổi (Floating Button)

Thêm vào bất kỳ trang nào để có truy cập nhanh:

```javascript
import { RestaurantAccessButton } from '../components/RestaurantAccess';

function MyPage() {
  return (
    <div>
      {/* Nội dung trang */}
      
      {/* Nút nổi ở góc dưới bên phải */}
      <RestaurantAccessButton />
    </div>
  );
}
```

## 2. Link trong Menu

Thêm vào navigation menu:

```javascript
import { RestaurantLink } from '../components/RestaurantAccess';

function NavigationMenu() {
  return (
    <nav>
      <RestaurantLink className="px-4 py-2" />
    </nav>
  );
}
```

## 3. Card trong Dashboard

Thêm vào AdminPage hoặc HomePage:

```javascript
import { RestaurantCard } from '../components/RestaurantAccess';

function AdminPage() {
  return (
    <div className="p-8">
      <h1>Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Các cards khác */}
        
        <RestaurantCard />
      </div>
    </div>
  );
}
```

## 4. Link trực tiếp trong Navigation

```javascript
import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

<Link 
  to="/restaurant" 
  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded"
>
  <Store className="w-5 h-5" />
  Restaurant
</Link>
```

## 5. Programmatic Navigation

```javascript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const goToRestaurant = () => {
    navigate('/restaurant');
  };
  
  return (
    <button onClick={goToRestaurant}>
      Go to Restaurant Dashboard
    </button>
  );
}
```

## 6. Thêm vào Sidebar

```javascript
// Trong Sidebar component
const menuItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/products', label: 'Products', icon: ShoppingBag },
  { path: '/orders', label: 'Orders', icon: Package },
  { path: '/restaurant', label: 'Restaurant', icon: Store }, // Thêm dòng này
  { path: '/profile', label: 'Profile', icon: User },
];
```

## 7. Conditional Rendering (Chỉ cho Restaurant owners)

```javascript
function Navigation() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isRestaurant = user.role === 'RESTAURANT';
  
  return (
    <nav>
      {/* Các menu items khác */}
      
      {isRestaurant && (
        <Link to="/restaurant">Restaurant Dashboard</Link>
      )}
    </nav>
  );
}
```

## 8. Trong HomePage - Quick Access Section

```javascript
function HomePage() {
  return (
    <div>
      {/* Hero section */}
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Quick Access</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RestaurantCard />
            {/* Các cards khác */}
          </div>
        </div>
      </section>
    </div>
  );
}
```

## 9. Trong Header/Navbar

```javascript
function Header() {
  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Logo />
          
          <div className="flex items-center gap-6">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/restaurant">Restaurant</Link>
            <Link to="/profile">Profile</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
```

## 10. Protected Route Example

```javascript
// App.js
import ProtectedRoute from './components/ProtectedRoute';
import RestaurantPage from './pages/RestaurantPage';

<Route 
  path="/restaurant" 
  element={
    <ProtectedRoute requiredRole="RESTAURANT">
      <RestaurantPage />
    </ProtectedRoute>
  } 
/>
```

## Styling Tips

### Custom Button Styles
```javascript
<button
  onClick={() => navigate('/restaurant')}
  className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg"
>
  Restaurant Dashboard
</button>
```

### With Badge (Notifications)
```javascript
<Link to="/restaurant" className="relative">
  Restaurant
  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
    3
  </span>
</Link>
```
