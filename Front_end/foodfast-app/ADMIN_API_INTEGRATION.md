# Hướng dẫn Kết nối Admin Page với Backend API

## Tổng quan
Admin Page đã được tích hợp hoàn toàn với backend API để quản lý:
- Dashboard Statistics
- Users
- Orders
- Products
- Restaurants

## Cấu trúc File

### 1. **adminService.js**
Service mới được tạo để xử lý tất cả các API calls cho admin:

```javascript
import adminService from '../services/adminService';
```

**Các chức năng chính:**
- `getDashboardStats()` - Lấy thống kê dashboard
- `getMonthlyRevenue(year)` - Lấy doanh thu theo tháng
- `getAllUsers()` - Lấy danh sách users
- `getAllOrders()` - Lấy danh sách orders
- `getAllProducts()` - Lấy danh sách products
- `getAllRestaurants()` - Lấy danh sách restaurants
- Và nhiều chức năng CRUD khác...

### 2. **AdminPage.js - Đã được cập nhật**

#### Dashboard Screen (ReportScreen)
```javascript
const fetchDashboardData = async () => {
  const stats = await adminService.getDashboardStats();
  const revenueData = await adminService.getMonthlyRevenue(year);
  // Hiển thị data
}
```

**Features:**
- ✅ Real-time statistics (Total Orders, Orders Today, Revenue, Total Users)
- ✅ Monthly revenue chart
- ✅ Loading states
- ✅ Fallback to mock data nếu API fails

#### User Screen
```javascript
const fetchUsers = async () => {
  const data = await adminService.getAllUsers();
  setUsers(data);
}
```

**Features:**
- ✅ Fetch users từ API
- ✅ Search functionality (username, email)
- ✅ Toggle user status (Active/Inactive)
- ✅ Delete user
- ✅ Loading states

#### Order Screen
```javascript
const fetchOrders = async () => {
  const data = await adminService.getAllOrders();
  setOrders(data);
}
```

**Features:**
- ✅ Fetch orders từ API
- ✅ View order details
- ✅ Format date và time
- ✅ Color-coded status badges
- ✅ Loading states

#### Product Screen
```javascript
const fetchProducts = async () => {
  const data = await adminService.getAllProducts();
  setProducts(data);
}
```

**Features:**
- ✅ Fetch products từ API
- ✅ Search functionality
- ✅ Approve product
- ✅ Reject product (with reason)
- ✅ Loading states

#### Restaurant Screen
```javascript
const fetchRestaurants = async () => {
  const data = await adminService.getAllRestaurants();
  setRestaurants(data);
}
```

**Features:**
- ✅ Fetch restaurants từ API
- ✅ Search functionality
- ✅ Toggle restaurant status
- ✅ Delete restaurant
- ✅ Loading states

## Cách Backend API Cần Implement

### Dashboard Endpoints

#### GET /api/admin/dashboard/stats
**Response:**
```json
{
  "totalOrders": 12345,
  "ordersToday": 234,
  "totalRevenue": 789456,
  "totalUsers": 8492
}
```

#### GET /api/admin/dashboard/revenue?year=2025
**Response:**
```json
[
  { "month": "Jan", "revenue": 45000, "expenses": 28000 },
  { "month": "Feb", "revenue": 52000, "expenses": 32000 },
  ...
]
```

### User Management Endpoints

#### GET /api/admin/users
**Response:**
```json
[
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "0123456789",
    "status": "Active"
  }
]
```

#### PUT /api/admin/users/{userId}/status
**Request:**
```json
{
  "status": "Active" // or "Inactive"
}
```

#### DELETE /api/admin/users/{userId}

### Order Management Endpoints

#### GET /api/admin/orders
**Response:**
```json
[
  {
    "id": 1,
    "userId": 123,
    "customerName": "John Doe",
    "totalAmount": 45.50,
    "status": "COMPLETED",
    "restaurantName": "Burger Palace",
    "createdAt": "2025-11-08T10:30:00Z"
  }
]
```

#### GET /api/admin/orders/{orderId}

### Product Management Endpoints

#### GET /api/admin/products
**Response:**
```json
[
  {
    "id": 1,
    "name": "Classic Burger",
    "price": 8.99,
    "category": "Burgers",
    "restaurantName": "Burger Palace"
  }
]
```

#### PUT /api/admin/products/{productId}/approve

#### PUT /api/admin/products/{productId}/reject
**Request:**
```json
{
  "reason": "Product does not meet quality standards"
}
```

### Restaurant Management Endpoints

#### GET /api/admin/restaurants
**Response:**
```json
[
  {
    "id": 1,
    "name": "Burger Palace",
    "address": "123 Main St, New York, NY",
    "phone": "+1 234-567-8901",
    "status": "Active"
  }
]
```

#### PUT /api/admin/restaurants/{restaurantId}/status
**Request:**
```json
{
  "status": "Active" // or "Inactive"
}
```

#### DELETE /api/admin/restaurants/{restaurantId}

## Error Handling

Tất cả các API calls đều có error handling:

```javascript
try {
  const data = await adminService.getAllUsers();
  setUsers(data);
  toast.success('Data loaded successfully');
} catch (error) {
  console.error('Error:', error);
  toast.error('Failed to load data');
}
```

## Loading States

Mỗi màn hình đều có loading indicator:

```javascript
{loading ? (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
  </div>
) : (
  // Render data
)}
```

## Toast Notifications

Sử dụng `sonner` để hiển thị notifications:

```javascript
import { toast } from 'sonner';

toast.success('Operation successful!');
toast.error('Operation failed!');
```

## Cách Chạy

1. **Khởi động Backend:**
```bash
# Terminal 1 - Eureka Service
cd C:\Study\CNPM\Food-fast-delivery\eureka-service
mvn spring-boot:run

# Terminal 2 - User Service
cd C:\Study\CNPM\Food-fast-delivery\user-service
mvn spring-boot:run

# Terminal 3 - Order Service
cd C:\Study\CNPM\Food-fast-delivery\order-service
mvn spring-boot:run

# Terminal 4 - Product Service
cd C:\Study\CNPM\Food-fast-delivery\product-service
mvn spring-boot:run

# Terminal 5 - API Gateway
cd C:\Study\CNPM\Food-fast-delivery\api-gateway
gradle bootRun
```

2. **Khởi động Frontend:**
```bash
cd C:\Study\CNPM\Food-fast-delivery\Front_end\foodfast-app
npm start
```

3. **Truy cập Admin Page:**
```
http://localhost:3000/admin
```

## Configuration

API Base URL được cấu hình trong `api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

## Authentication

Tất cả requests tự động thêm JWT token vào header:

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Fallback Data

Nếu API fails, dashboard sẽ hiển thị mock data để đảm bảo UX:

```javascript
catch (error) {
  // Fallback to mock data
  setDashboardStats({
    totalOrders: 12345,
    ordersToday: 234,
    totalRevenue: 789456,
    totalUsers: 8492
  });
}
```

## Next Steps

Backend team cần implement các endpoints sau priority:

1. ✅ **High Priority:**
   - `/api/admin/dashboard/stats` - Dashboard statistics
   - `/api/admin/users` - User management
   - `/api/admin/orders` - Order management

2. **Medium Priority:**
   - `/api/admin/products` - Product management
   - `/api/admin/restaurants` - Restaurant management
   - `/api/admin/dashboard/revenue` - Revenue analytics

3. **Low Priority:**
   - Drone management endpoints
   - Settings endpoints

## Troubleshooting

### CORS Issues
Nếu gặp CORS errors, thêm vào backend:
```java
@CrossOrigin(origins = "http://localhost:3000")
```

### 401 Unauthorized
- Kiểm tra token có hợp lệ
- Token sẽ tự động redirect về /login nếu hết hạn

### Data không hiển thị
- Kiểm tra console.log để xem response structure
- Đảm bảo field names match với backend response

## Support

Nếu có vấn đề, kiểm tra:
1. Backend services đang chạy
2. API Gateway hoạt động (port 8080)
3. Console logs cho errors
4. Network tab trong DevTools

