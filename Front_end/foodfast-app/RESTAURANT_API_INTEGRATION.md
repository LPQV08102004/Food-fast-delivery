# Restaurant Dashboard - API Integration Guide

## ✅ Hoàn thành tích hợp Backend

### 📡 API Endpoints đã kết nối

#### 1. **Restaurant Management**
- ✅ `GET /api/restaurants` - Lấy danh sách nhà hàng
- ✅ `GET /api/restaurants/{id}` - Lấy thông tin nhà hàng theo ID
- ✅ `POST /api/restaurants` - Tạo nhà hàng mới
- ✅ `PUT /api/restaurants/{id}` - Cập nhật thông tin nhà hàng
- ✅ `DELETE /api/restaurants/{id}` - Xóa nhà hàng

#### 2. **Product Management**
- ✅ `GET /api/products/restaurant/{restaurantId}` - Lấy sản phẩm theo nhà hàng
- ✅ `GET /api/products/{id}` - Lấy thông tin sản phẩm
- ✅ `GET /api/products/search?name={name}` - Tìm kiếm sản phẩm
- ✅ `POST /api/products` - Tạo sản phẩm mới
- ✅ `PUT /api/products/{id}` - Cập nhật sản phẩm
- ✅ `DELETE /api/products/{id}` - Xóa sản phẩm

#### 3. **Order Management**
- ✅ `GET /api/orders` - Lấy danh sách đơn hàng
- ✅ `GET /api/orders/{id}` - Lấy chi tiết đơn hàng

#### 4. **Category Management**
- ✅ `GET /api/categories` - Lấy danh sách danh mục

---

## 🔧 Services đã tạo

### `restaurantService.js`

File service chứa tất cả API calls cho Restaurant Dashboard:

```javascript
import restaurantService from '../services/restaurantService';

// Ví dụ sử dụng:
const restaurant = await restaurantService.getRestaurantById(1);
const products = await restaurantService.getProductsByRestaurantId(1);
const orders = await restaurantService.getAllOrders();
```

### Các hàm có sẵn:

#### Restaurant APIs
- `getRestaurantById(restaurantId)` - Lấy thông tin nhà hàng
- `getAllRestaurants()` - Lấy tất cả nhà hàng
- `createRestaurant(data)` - Tạo nhà hàng mới
- `updateRestaurant(id, data)` - Cập nhật nhà hàng
- `deleteRestaurant(id)` - Xóa nhà hàng

#### Product APIs
- `getProductsByRestaurantId(restaurantId)` - Lấy sản phẩm của nhà hàng
- `getProductById(productId)` - Lấy thông tin sản phẩm
- `searchProducts(searchTerm)` - Tìm kiếm sản phẩm
- `createProduct(data)` - Tạo sản phẩm mới
- `updateProduct(id, data)` - Cập nhật sản phẩm
- `deleteProduct(id)` - Xóa sản phẩm

#### Order APIs
- `getAllOrders()` - Lấy tất cả đơn hàng
- `getOrderById(orderId)` - Lấy chi tiết đơn hàng

#### Statistics APIs
- `getRevenueStats(restaurantId, period)` - Thống kê doanh thu
- `getProductStats(restaurantId)` - Thống kê sản phẩm bán chạy

#### Category APIs
- `getAllCategories()` - Lấy danh mục sản phẩm

---

## 📊 Components đã tích hợp API

### 1. **ProfileScreen.js**
✅ Hiển thị thông tin nhà hàng từ API
- Tự động load data khi component mount
- Hiển thị: tên, địa chỉ, số điện thoại, rating, delivery time, số lượng sản phẩm
- Loading state và error handling

```javascript
const [restaurant, setRestaurant] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    const data = await restaurantService.getRestaurantById(restaurantId);
    setRestaurant(data);
  };
  loadData();
}, [restaurantId]);
```

### 2. **ProductScreen.js**
✅ Quản lý sản phẩm với API
- Load danh sách sản phẩm từ backend
- Tìm kiếm sản phẩm real-time
- Xóa sản phẩm với confirmation
- Format giá theo VND
- Hiển thị trạng thái: Available / Out of Stock

```javascript
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [searchTerm, setSearchTerm] = useState('');

const loadProducts = async () => {
  const data = await restaurantService.getProductsByRestaurantId(restaurantId);
  setProducts(data);
};

const handleDelete = async (productId) => {
  await restaurantService.deleteProduct(productId);
  loadProducts(); // Reload
};
```

### 3. **OrderScreen.js**
✅ Hiển thị đơn hàng từ API
- Load tất cả đơn hàng
- Hiển thị status với màu sắc: Completed (xanh), Pending (vàng), Cancelled (đỏ)
- Format ngày giờ theo locale Vietnam
- Format giá VND
- Hiển thị payment method

```javascript
const [orders, setOrders] = useState([]);

const loadOrders = async () => {
  const data = await restaurantService.getAllOrders();
  setOrders(data);
};

const getStatusColor = (status) => {
  // Map status to colors
};
```

### 4. **RevenueScreen.js**
✅ Thống kê doanh thu với API
- Biểu đồ doanh thu theo tuần
- Lọc theo thời gian: 7/30/90/365 ngày
- Thống kê tổng doanh thu, tổng đơn
- Sản phẩm bán chạy nhất
- Tự động tính toán từ orders

```javascript
const [period, setPeriod] = useState('30');
const [stats, setStats] = useState(null);

const loadData = async () => {
  const revenueData = await restaurantService.getRevenueStats(restaurantId, period);
  const productData = await restaurantService.getProductStats(restaurantId);
  setStats(revenueData);
};
```

---

## 🔐 Authentication

API sử dụng JWT token authentication:

```javascript
// api.js - Interceptor tự động thêm token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

Token được lưu trong localStorage sau khi login thành công.

---

## 📝 Data Models

### RestaurantResponse
```javascript
{
  id: Long,
  name: String,
  address: String,
  phoneNumber: String,
  rating: Double,
  deliveryTime: String,
  productCount: Integer
}
```

### ProductResponse
```javascript
{
  id: Long,
  name: String,
  description: String,
  price: Double,
  stock: Integer,
  isActive: Boolean,
  categoryId: Long,
  restaurantId: Long,
  image_urls: String[]
}
```

### OrderResponse
```javascript
{
  id: Long,
  userId: Long,
  totalPrice: Double,
  status: OrderStatus, // PENDING, PROCESSING, SHIPPING, DELIVERED, COMPLETED, CANCELLED
  paymentMethod: String,
  paymentStatus: String,
  createdAt: Instant,
  updatedAt: Instant,
  orderItems: OrderItemResponse[]
}
```

---

## 🎨 UI Features

### Loading States
Tất cả components đều có loading state:
```javascript
if (loading) {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="ml-3">Đang tải...</p>
    </div>
  );
}
```

### Error Handling
Sử dụng `sonner` toast cho notifications:
```javascript
import { toast } from 'sonner';

try {
  // API call
} catch (error) {
  toast.error('Không thể tải dữ liệu');
}
```

### Format Functions
- `formatPrice()` - Format VND currency
- `formatDate()` - Format date (dd/mm/yyyy)
- `formatTime()` - Format time (HH:MM)
- `getStatusColor()` - Map status to colors
- `getStatusLabel()` - Translate status to Vietnamese

---

## 🚀 Cách test

### 1. Đảm bảo backend đang chạy
```bash
# Start các services
- eureka-service: port 8761
- api-gateway: port 8080
- product-service
- order-service
- user-service
```

### 2. Check API endpoints
```bash
# Test với curl hoặc Postman
curl http://localhost:8080/api/restaurants
curl http://localhost:8080/api/products/restaurant/1
curl http://localhost:8080/api/orders
```

### 3. Chạy frontend
```bash
cd Front_end/foodfast-app
npm start
```

### 4. Truy cập Restaurant Dashboard
```
http://localhost:3000/restaurant
```

---

## 📌 TODO - Các chức năng cần phát triển

### High Priority
- [ ] Form thêm/sửa sản phẩm
- [ ] Form edit restaurant profile
- [ ] Upload ảnh sản phẩm
- [ ] Chi tiết đơn hàng (view order details)
- [ ] Cập nhật trạng thái đơn hàng

### Medium Priority
- [ ] Phân trang cho danh sách sản phẩm và đơn hàng
- [ ] Filter orders by status
- [ ] Export revenue report
- [ ] Notification system
- [ ] Real-time order updates

### Low Priority
- [ ] Settings page implementation
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Mobile responsive improvements

---

## 🐛 Debugging

### Nếu không load được data:

1. **Check console logs**
   - Mở DevTools (F12)
   - Xem tab Console có lỗi gì

2. **Check Network tab**
   - Xem API calls
   - Check status code
   - Xem response data

3. **Check backend**
   - Đảm bảo services đang chạy
   - Check database connection
   - Xem logs của các services

4. **Check token**
   ```javascript
   console.log(localStorage.getItem('token'));
   ```

5. **Check API Base URL**
   ```javascript
   // src/services/api.js
   const API_BASE_URL = 'http://localhost:8080/api';
   ```

---

## 📚 References

- Backend repo: product-service, order-service
- API Gateway: port 8080
- React docs: https://react.dev
- Recharts docs: https://recharts.org
- Sonner toast: https://sonner.emilkowal.ski

---

**API Integration Complete! 🎉**
