# Hướng dẫn tích hợp GUI Restaurant vào foodfast-app

## Tổng quan
Giao diện GUI Restaurant đã được tích hợp thành công vào foodfast-app với đầy đủ các chức năng quản lý nhà hàng.

## Cấu trúc thư mục được tạo

```
src/
├── components/
│   └── restaurant/
│       ├── RestaurantSidebar.js     # Sidebar điều hướng
│       ├── RestaurantHeader.js      # Header với logout
│       ├── ProfileScreen.js         # Màn hình thông tin nhà hàng
│       ├── ProductScreen.js         # Quản lý sản phẩm
│       ├── OrderScreen.js           # Quản lý đơn hàng
│       ├── RevenueScreen.js         # Báo cáo doanh thu
│       └── SettingScreen.js         # Cài đặt
└── pages/
    └── RestaurantPage.js            # Trang chính của Restaurant Dashboard
```

## Cách sử dụng

### 1. Truy cập trang Restaurant
Truy cập URL: `http://localhost:3000/restaurant`

### 2. Các tính năng

#### Profile (Hồ sơ nhà hàng)
- Hiển thị thông tin nhà hàng: tên, email, địa chỉ, liên hệ
- Ảnh bìa nhà hàng
- Nút Edit để chỉnh sửa thông tin

#### Product (Quản lý sản phẩm)
- Danh sách sản phẩm với thông tin: tên, giá, phân loại, trạng thái
- Tìm kiếm sản phẩm
- Thêm sản phẩm mới
- Xem chi tiết và xóa sản phẩm

#### Order (Quản lý đơn hàng)
- Danh sách đơn hàng với trạng thái: Completed, Pending, Cancelled
- Thông tin: ID đơn, khách hàng, thời gian, ngày, tổng tiền
- Tạo đơn hàng mới
- Xem chi tiết đơn hàng

#### Revenue (Doanh thu)
- Biểu đồ doanh thu theo tuần
- Thống kê: Tổng doanh thu, Tổng đơn hàng, Sản phẩm bán chạy nhất
- Lọc theo khoảng thời gian: 7 ngày, 30 ngày, 90 ngày, 1 năm

#### Setting (Cài đặt)
- Trang cài đặt (đang phát triển)

## Chạy ứng dụng

### Cài đặt dependencies (nếu cần)
```bash
cd Front_end/foodfast-app
npm install
```

### Chạy ứng dụng
```bash
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## Tích hợp với Navigation

Bạn có thể thêm link đến Restaurant Dashboard trong các trang khác:

```javascript
import { Link } from 'react-router-dom';

// Trong component của bạn
<Link to="/restaurant">Restaurant Dashboard</Link>
```

## Tùy chỉnh

### Thay đổi màu sắc
Các màu chính được sử dụng:
- Primary: `bg-blue-600` (xanh dương)
- Success: `bg-green-100` (xanh lá)
- Warning: `bg-yellow-100` (vàng)
- Danger: `bg-red-600` (đỏ)

### Kết nối với API
Hiện tại các components đang sử dụng dữ liệu mẫu. Để kết nối với backend:

1. Tạo services trong `src/services/restaurantService.js`
2. Sử dụng axios để gọi API
3. Cập nhật các components để sử dụng dữ liệu thực từ API

Ví dụ:
```javascript
// src/services/restaurantService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const getProducts = async () => {
  const response = await axios.get(`${API_URL}/products`);
  return response.data;
};

export const getOrders = async () => {
  const response = await axios.get(`${API_URL}/orders`);
  return response.data;
};
```

## Bảo mật
- Trang Restaurant nên được bảo vệ bằng authentication
- Chỉ user có role "RESTAURANT" mới có thể truy cập
- Sử dụng ProtectedRoute component đã có trong dự án

Ví dụ:
```javascript
<Route 
  path="/restaurant" 
  element={
    <ProtectedRoute requiredRole="RESTAURANT">
      <RestaurantPage />
    </ProtectedRoute>
  } 
/>
```

## Dependencies đã có sẵn
- `lucide-react`: Icons
- `recharts`: Biểu đồ
- `react-router-dom`: Routing
- `tailwindcss`: Styling

Không cần cài thêm package nào!

## Lưu ý
- Giao diện responsive, hoạt động tốt trên desktop
- Sử dụng Tailwind CSS cho styling
- Components đã được chuyển đổi từ TypeScript sang JavaScript để tương thích với foodfast-app
