# API Integration Guide

## Cấu trúc Backend Services

Backend của bạn có kiến trúc Microservices với API Gateway:

```
API Gateway (Port 8080)
├── User Service (Port 8081) - /api/auth/**, /api/users/**
├── Product Service (Port 8082) - /api/products/**
├── Order Service (Port 8083) - /api/orders/**
└── Payment Service (Port 8084) - /api/payments/**
```

## Services đã tạo

### 1. **api.js** - Axios Instance
- Base URL: `http://localhost:8080/api`
- Tự động thêm JWT token vào header
- Xử lý lỗi 401 (redirect về login)
- Interceptors cho request/response

### 2. **authService.js** - Authentication
```javascript
import authService from './services/authService';

// Đăng ký
await authService.register({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'password123',
  phone: '0123456789'
});

// Đăng nhập
const response = await authService.login({
  username: 'john_doe',
  password: 'password123'
});
// Token tự động lưu vào localStorage

// Đăng xuất
authService.logout();

// Kiểm tra đã đăng nhập
const isLoggedIn = authService.isAuthenticated();

// Lấy user hiện tại
const currentUser = authService.getCurrentUser();
```

### 3. **userService.js** - User Management
```javascript
import userService from './services/userService';

// Lấy profile
const profile = await userService.getProfile();

// Cập nhật profile
await userService.updateProfile({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '0123456789'
});

// Đổi mật khẩu
await userService.changePassword({
  oldPassword: 'old123',
  newPassword: 'new123'
});

// Admin: Lấy tất cả users
const users = await userService.getAllUsers();

// Admin: Xóa user
await userService.deleteUser(userId);
```

### 4. **productService.js** - Products
```javascript
import productService from './services/productService';

// Lấy tất cả products
const products = await productService.getAllProducts();

// Lấy product theo ID
const product = await productService.getProductById(productId);

// Tìm kiếm
const results = await productService.searchProducts({
  keyword: 'burger',
  minPrice: 5,
  maxPrice: 20
});

// Lọc theo category
const burgers = await productService.getProductsByCategory('Burgers');

// Lọc theo restaurant
const restaurantProducts = await productService.getProductsByRestaurant(restaurantId);

// Admin: Tạo product mới
await productService.createProduct({
  name: 'New Burger',
  price: 12.99,
  description: 'Delicious burger',
  category: 'Burgers',
  restaurantId: 'RES-001'
});

// Admin: Approve/Cancel product
await productService.approveProduct(productId);
await productService.cancelProduct(productId);
```

### 5. **orderService.js** - Orders
```javascript
import orderService from './services/orderService';

// Tạo order mới
const order = await orderService.createOrder({
  items: [
    { productId: 1, quantity: 2 },
    { productId: 3, quantity: 1 }
  ],
  deliveryAddress: '123 Main St',
  paymentMethod: 'card'
});

// Lấy orders của mình
const myOrders = await orderService.getMyOrders();

// Lấy order detail
const orderDetail = await orderService.getOrderById(orderId);

// Track order
const trackingInfo = await orderService.trackOrder(orderId);

// Hủy order
await orderService.cancelOrder(orderId);

// Admin: Lấy tất cả orders
const allOrders = await orderService.getAllOrders();

// Admin: Cập nhật status
await orderService.updateOrderStatus(orderId, 'In Progress');
```

### 6. **paymentService.js** - Payments
```javascript
import paymentService from './services/paymentService';

// Tạo payment
const payment = await paymentService.createPayment({
  orderId: 'ORD-001',
  amount: 45.50,
  method: 'card'
});

// Xử lý thanh toán
await paymentService.processPayment(paymentId, {
  cardNumber: '4111111111111111',
  expiryDate: '12/25',
  cvv: '123'
});

// Lấy payment history
const history = await paymentService.getPaymentHistory();

// Admin: Refund
await paymentService.refundPayment(paymentId, {
  amount: 45.50,
  reason: 'Customer request'
});
```

### 7. **restaurantService.js** - Restaurants
```javascript
import restaurantService from './services/restaurantService';

// Lấy tất cả restaurants
const restaurants = await restaurantService.getAllRestaurants();

// Lấy restaurant detail
const restaurant = await restaurantService.getRestaurantById(restaurantId);

// Đăng ký restaurant mới
await restaurantService.registerRestaurant({
  name: 'New Restaurant',
  address: '123 Main St',
  contact: '+1234567890',
  cuisineType: 'Italian'
});

// Admin: Approve restaurant
await restaurantService.approveRestaurant(restaurantId);

// Admin: Activate/Deactivate
await restaurantService.updateRestaurantStatus(restaurantId, 'Active');
```

## Cách tích hợp vào Components

### Ví dụ 1: Login Page
```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { toast } from 'sonner';

function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authService.login(credentials);
      toast.success('Login successful!');
      navigate('/products');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        value={credentials.username}
        onChange={(e) => setCredentials({...credentials, username: e.target.value})}
      />
      <input 
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
```

### Ví dụ 2: Product Page
```javascript
import React, { useState, useEffect } from 'react';
import productService from '../services/productService';
import { toast } from 'sonner';

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### Ví dụ 3: Checkout (Cart to Order)
```javascript
import React from 'react';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import { toast } from 'sonner';

function CheckoutPage({ cartItems }) {
  const handleCheckout = async () => {
    try {
      // 1. Tạo order
      const order = await orderService.createOrder({
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        deliveryAddress: '123 Main St',
        notes: 'Please ring doorbell'
      });

      // 2. Tạo payment
      const payment = await paymentService.createPayment({
        orderId: order.id,
        amount: order.totalAmount,
        method: 'card'
      });

      // 3. Xử lý payment
      await paymentService.processPayment(payment.id, {
        cardNumber: '4111111111111111',
        expiryDate: '12/25',
        cvv: '123'
      });

      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error('Checkout failed: ' + error.message);
    }
  };

  return (
    <button onClick={handleCheckout}>
      Complete Order
    </button>
  );
}
```

## Error Handling

Tất cả services đã có error handling. Bạn chỉ cần dùng try-catch:

```javascript
try {
  const data = await productService.getAllProducts();
  // Success
} catch (error) {
  // error.response?.data - Backend error response
  // error.message - Error message
  console.error(error);
  toast.error(error.message || 'Something went wrong');
}
```

## Protected Routes

Tạo ProtectedRoute component để bảo vệ các trang cần đăng nhập:

```javascript
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Sử dụng trong App.js
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  } 
/>
```

## Khởi động Backend

1. **Start Eureka Service** (port 8761):
   ```bash
   cd eureka-service
   mvn spring-boot:run
   ```

2. **Start User Service** (port 8081):
   ```bash
   cd user-service
   mvn spring-boot:run
   ```

3. **Start Product Service** (port 8082):
   ```bash
   cd product-service
   mvn spring-boot:run
   ```

4. **Start Order Service** (port 8083):
   ```bash
   cd order-service
   mvn spring-boot:run
   ```

5. **Start Payment Service** (port 8084):
   ```bash
   cd payment-service
   mvn spring-boot:run
   ```

6. **Start API Gateway** (port 8080):
   ```bash
   cd api-gateway
   ./gradlew bootRun
   ```

7. **Start Frontend** (port 3000):
   ```bash
   cd Front_end/foodfast-app
   npm start
   ```

## Testing API

Truy cập Eureka Dashboard: http://localhost:8761

API Gateway endpoint: http://localhost:8080/api

Test endpoints:
- POST http://localhost:8080/api/auth/register
- POST http://localhost:8080/api/auth/login
- GET http://localhost:8080/api/products
- GET http://localhost:8080/api/users/profile (cần token)

## Environment Configuration

Bạn có thể tạo `.env` file để cấu hình:

```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_EUREKA_URL=http://localhost:8761
```

Sau đó sửa `api.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
```
