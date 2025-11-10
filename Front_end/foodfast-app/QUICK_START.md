# 🚀 Quick Start - Restaurant Dashboard

## Chạy ngay trong 3 bước!

### Bước 1: Di chuyển vào thư mục
```bash
cd Front_end/foodfast-app
```

### Bước 2: Cài đặt dependencies (nếu chưa có)
```bash
npm install
```

### Bước 3: Chạy ứng dụng
```bash
npm start
```

### Bước 4: Truy cập
Mở trình duyệt và truy cập:
```
http://localhost:3000/restaurant
```

---

## 🎯 Hoặc truy cập từ trang khác

### Từ HomePage:
1. Mở `http://localhost:3000`
2. Thêm `/restaurant` vào URL
3. Hoặc thêm một trong các components sau vào HomePage:

```javascript
// Option 1: Thêm vào HomePage.js
import { RestaurantCard } from '../components/RestaurantAccess';

// Trong phần render, thêm:
<RestaurantCard />
```

```javascript
// Option 2: Nút nổi
import { RestaurantAccessButton } from '../components/RestaurantAccess';

// Cuối component:
<RestaurantAccessButton />
```

```javascript
// Option 3: Link đơn giản
import { Link } from 'react-router-dom';

<Link to="/restaurant">Restaurant Dashboard</Link>
```

---

## 📱 Test các tính năng

### 1. Profile Screen
- Click "Profile" trong sidebar
- Xem thông tin nhà hàng
- Click nút "Edit" (chức năng đang phát triển)

### 2. Product Screen
- Click "Product" trong sidebar
- Xem danh sách 6 sản phẩm mẫu
- Thử tìm kiếm sản phẩm
- Click "Add product" (chức năng đang phát triển)

### 3. Order Screen
- Click "Order" trong sidebar
- Xem danh sách 6 đơn hàng mẫu
- Quan sát trạng thái màu sắc (xanh, vàng, đỏ)
- Click "New orders" (chức năng đang phát triển)

### 4. Revenue Screen
- Click "Revenue" trong sidebar
- Xem biểu đồ doanh thu
- Xem 3 thẻ thống kê
- Thử thay đổi bộ lọc thời gian

### 5. Setting Screen
- Click "Setting" trong sidebar
- Placeholder page (đang phát triển)

### 6. Logout
- Click nút "Logout" ở header
- Sẽ chuyển về trang Login

---

## 🔍 Troubleshooting

### Lỗi: "Cannot find module..."
```bash
npm install
```

### Lỗi: Port 3000 đã được sử dụng
```bash
# Tìm và kill process đang dùng port 3000
# Hoặc chạy trên port khác:
PORT=3001 npm start
```

### Lỗi: Tailwind CSS không hoạt động
Kiểm tra file `tailwind.config.js` có cấu hình đúng:
```javascript
content: [
  "./src/**/*.{js,jsx,ts,tsx}",
],
```

### Lỗi: React Router không hoạt động
Đảm bảo App.js có `<BrowserRouter>` wrapper

---

## 💡 Tips

### 1. Xem cấu trúc components
```bash
# Trong terminal
tree Front_end/foodfast-app/src/components/restaurant
```

### 2. Xem tất cả routes
Mở file: `src/App.js`

### 3. Customize colors
Tìm các class Tailwind trong components:
- `bg-blue-600` → Primary color
- `bg-green-100` → Success color
- `bg-yellow-100` → Warning color
- `bg-red-600` → Danger color

### 4. Add more demo data
Tìm các array `products`, `orders`, `stats` trong components và thêm data

---

## 📚 Đọc thêm

- **RESTAURANT_README.md** - Tổng quan đầy đủ
- **RESTAURANT_INTEGRATION.md** - Hướng dẫn chi tiết
- **RESTAURANT_USAGE_EXAMPLES.md** - Ví dụ sử dụng

---

**Enjoy! 🎉**
