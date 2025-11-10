# 🧪 Hướng dẫn Test Restaurant Dashboard với Backend

## Chuẩn bị môi trường

### 1. Start Backend Services

#### Option 1: Start từng service riêng

```bash
# Terminal 1 - Eureka Service
cd eureka-service
./mvnw spring-boot:run
# Hoặc: mvn spring-boot:run
# URL: http://localhost:8761

# Terminal 2 - Product Service  
cd product-service
./mvnw spring-boot:run
# Port: 8081 (hoặc theo config)

# Terminal 3 - Order Service
cd order-service
./mvnw spring-boot:run
# Port: 8082 (hoặc theo config)

# Terminal 4 - User Service
cd user-service
./mvnw spring-boot:run
# Port: 8083 (hoặc theo config)

# Terminal 5 - API Gateway
cd api-gateway
./gradlew bootRun
# Port: 8080
```

#### Option 2: Check services đã chạy
```bash
# Check Eureka Dashboard
http://localhost:8761

# Check API Gateway
curl http://localhost:8080/actuator/health
```

### 2. Chuẩn bị Database

#### MySQL
```sql
-- Tạo database
CREATE DATABASE IF NOT EXISTS product_db;
CREATE DATABASE IF NOT EXISTS order_db;
CREATE DATABASE IF NOT EXISTS user_db;

-- Tạo restaurant (trong product_db)
USE product_db;
INSERT INTO restaurant (name, address, phone_number, rating, delivery_time)
VALUES ('Nhà hàng Test', '123 Nguyễn Huệ, Q1, TP.HCM', '0901234567', 4.5, '30-45 phút');

-- Tạo category
INSERT INTO category (name) VALUES ('Món chính');
INSERT INTO category (name) VALUES ('Khai vị');
INSERT INTO category (name) VALUES ('Tráng miệng');

-- Tạo products
INSERT INTO product (name, description, price, stock, is_active, restaurant_id, category_id)
VALUES 
('Pizza Hải Sản', 'Pizza với hải sản tươi ngon', 150000, 20, true, 1, 1),
('Mì Ý Carbonara', 'Mì Ý sốt kem béo ngậy', 120000, 15, true, 1, 1),
('Salad Caesar', 'Salad rau trộn sốt Caesar', 80000, 30, true, 1, 2),
('Tiramisu', 'Bánh Tiramisu Ý', 60000, 10, true, 1, 3);

-- Tạo user (trong user_db)
USE user_db;
INSERT INTO user (username, email, password, role)
VALUES ('testuser', 'test@example.com', '$2a$10$...', 'USER');

-- Tạo orders (trong order_db)
USE order_db;
INSERT INTO orders (user_id, total_price, status, payment_method, payment_status, created_at)
VALUES 
(1, 270000, 'COMPLETED', 'COD', 'PAID', NOW() - INTERVAL 1 DAY),
(1, 150000, 'PENDING', 'VNPAY', 'PENDING', NOW() - INTERVAL 2 HOUR),
(1, 200000, 'CANCELLED', 'COD', 'CANCELLED', NOW() - INTERVAL 3 DAY);

-- Tạo order items
INSERT INTO order_item (order_id, product_id, product_name, quantity, price)
VALUES 
(1, 1, 'Pizza Hải Sản', 1, 150000),
(1, 2, 'Mì Ý Carbonara', 1, 120000),
(2, 1, 'Pizza Hải Sản', 1, 150000),
(3, 3, 'Salad Caesar', 1, 80000),
(3, 2, 'Mì Ý Carbonara', 1, 120000);
```

---

## Test từng màn hình

### 3. Start Frontend

```bash
cd Front_end/foodfast-app
npm start
```

Truy cập: `http://localhost:3000/restaurant`

---

## 📋 Test Cases

### A. Profile Screen

#### Test 1: Load Restaurant Info
1. ✅ Mở trang `/restaurant`
2. ✅ Sidebar hiển thị "Profile" active
3. ✅ Màn hình hiển thị loading spinner
4. ✅ Sau vài giây hiển thị thông tin:
   - Ảnh bìa nhà hàng
   - Tên: "Nhà hàng Test"
   - Địa chỉ: "123 Nguyễn Huệ..."
   - Contact: "0901234567"
   - Rating: "⭐ 4.5"
   - Delivery Time: "30-45 phút"
   - Total Products: "4 sản phẩm"

#### Test 2: Error Handling
1. ✅ Stop backend
2. ✅ Reload trang
3. ✅ Kiểm tra toast error hiển thị
4. ✅ Hiển thị "Không tìm thấy thông tin nhà hàng"

**Expected:**
- ✅ Data load từ database
- ✅ Loading state hiển thị
- ✅ Error handling hoạt động

---

### B. Product Screen

#### Test 3: Load Products
1. ✅ Click "Product" trong sidebar
2. ✅ Hiển thị loading
3. ✅ Bảng hiển thị 4 sản phẩm:
   - Pizza Hải Sản - 150.000 ₫ - Stock: 20 - Available
   - Mì Ý Carbonara - 120.000 ₫ - Stock: 15 - Available
   - Salad Caesar - 80.000 ₫ - Stock: 30 - Available
   - Tiramisu - 60.000 ₫ - Stock: 10 - Available

#### Test 4: Search Products
1. ✅ Nhập "Pizza" vào search box
2. ✅ Bảng chỉ hiển thị "Pizza Hải Sản"
3. ✅ Xóa search
4. ✅ Hiển thị lại tất cả 4 sản phẩm

#### Test 5: Delete Product
1. ✅ Click "delete" ở sản phẩm Tiramisu
2. ✅ Confirm dialog hiển thị
3. ✅ Click OK
4. ✅ Toast "Xóa sản phẩm thành công"
5. ✅ Sản phẩm biến mất khỏi bảng
6. ✅ Check database: product đã bị xóa

**Expected:**
- ✅ Load products từ database
- ✅ Search filter hoạt động
- ✅ Delete API call thành công
- ✅ UI update tự động

---

### C. Order Screen

#### Test 6: Load Orders
1. ✅ Click "Order" trong sidebar
2. ✅ Hiển thị loading
3. ✅ Bảng hiển thị 3 đơn hàng:
   - Order #1 - Status: Hoàn thành (xanh)
   - Order #2 - Status: Chờ xử lý (vàng)
   - Order #3 - Status: Đã hủy (đỏ)

#### Test 7: Check Order Details
1. ✅ Kiểm tra format:
   - User ID hiển thị đúng
   - Time format: "14:30" (giờ:phút)
   - Date format: "09/11/2025" (dd/mm/yyyy)
   - Price format: "270.000 ₫"
   - Payment method: "COD" hoặc "VNPAY"
2. ✅ Màu status badges đúng

#### Test 8: View Order
1. ✅ Click "view" ở bất kỳ đơn hàng
2. ✅ Toast hiển thị "Xem chi tiết đơn hàng #X"
3. ✅ (Chưa implement modal - chỉ toast info)

**Expected:**
- ✅ Load orders từ database
- ✅ Format đúng VND, date, time
- ✅ Status colors đúng
- ✅ Toast info hoạt động

---

### D. Revenue Screen

#### Test 9: Load Revenue Stats
1. ✅ Click "Revenue" trong sidebar
2. ✅ Hiển thị loading
3. ✅ Biểu đồ line chart xuất hiện
4. ✅ 3 thẻ thống kê hiển thị:
   - Total Revenue: "620.000 ₫" (tổng 3 đơn)
   - Total Orders: "3" đơn
   - Best Seller: "Pizza Hải Sản" (2 đã bán)

#### Test 10: Filter by Time Period
1. ✅ Dropdown hiển thị "Last 30 days"
2. ✅ Đổi sang "Last 7 days"
3. ✅ Chart và stats update
4. ✅ Chỉ đếm orders trong 7 ngày gần nhất
5. ✅ Thử các options khác: 90 days, Last year

#### Test 11: Chart Data
1. ✅ Chart hiển thị data theo tuần
2. ✅ Tooltip hiển thị khi hover:
   - Doanh thu (VND format)
   - Số đơn hàng
3. ✅ 2 đường: xanh (revenue), xám (orders)

**Expected:**
- ✅ Tính toán doanh thu từ orders
- ✅ Group by week hoạt động
- ✅ Filter theo period
- ✅ Best seller calculation đúng
- ✅ Chart interactive

---

### E. Toast Notifications

#### Test 12: Success Toast
1. ✅ Xóa sản phẩm thành công
2. ✅ Toast màu xanh xuất hiện
3. ✅ Tự động tắt sau 3s

#### Test 13: Error Toast
1. ✅ Stop backend
2. ✅ Thử xóa sản phẩm
3. ✅ Toast màu đỏ "Không thể xóa sản phẩm"

#### Test 14: Info Toast
1. ✅ Click "Add product"
2. ✅ Toast màu xanh nhạt "Chức năng đang phát triển"
3. ✅ Click "view" order
4. ✅ Toast info hiển thị

**Expected:**
- ✅ Sonner toast hoạt động
- ✅ Màu sắc phù hợp
- ✅ Auto dismiss

---

### F. Loading States

#### Test 15: Loading Spinner
1. ✅ Reload page
2. ✅ Mỗi screen hiển thị spinner khi đang load
3. ✅ Spinner: Loader2 icon xoay + text "Đang tải..."
4. ✅ Sau load xong, spinner biến mất

**Expected:**
- ✅ Loading state cho tất cả API calls
- ✅ UI không bị flash (layout shift)

---

### G. Empty States

#### Test 16: No Data
1. ✅ Xóa tất cả products
2. ✅ Vào Product screen
3. ✅ Hiển thị: "Không tìm thấy sản phẩm nào"

#### Test 17: Search No Results
1. ✅ Search "asdfghjkl"
2. ✅ Hiển thị: "Không tìm thấy sản phẩm nào"

**Expected:**
- ✅ Empty state messages hiển thị
- ✅ Không crash khi empty array

---

## 🔍 Test với DevTools

### H. Network Tab

#### Test 18: API Calls
1. ✅ Mở DevTools (F12) → Network tab
2. ✅ Reload trang
3. ✅ Kiểm tra API calls:
   ```
   GET /api/restaurants/1     → 200 OK
   GET /api/products/restaurant/1 → 200 OK
   GET /api/orders → 200 OK
   ```
4. ✅ Check Response data có đúng không
5. ✅ Check Request Headers có Bearer token

#### Test 19: Authentication
1. ✅ Check Headers:
   ```
   Authorization: Bearer eyJhbGc...
   ```
2. ✅ Nếu không có token → 401
3. ✅ Toast "Token hết hạn" → redirect /login

**Expected:**
- ✅ API calls đúng endpoints
- ✅ Token được gửi
- ✅ Response data đúng format

---

### I. Console Tab

#### Test 20: No Errors
1. ✅ Mở Console tab
2. ✅ Không có error đỏ
3. ✅ Có thể có warnings (không sao)

#### Test 21: Error Logs
1. ✅ Stop backend
2. ✅ Reload page
3. ✅ Console hiển thị: "Error loading..."
4. ✅ Nhưng app không crash

**Expected:**
- ✅ Không có uncaught errors
- ✅ Error handling graceful

---

## 📊 Test Performance

### J. Load Time

#### Test 22: Initial Load
1. ✅ Reload page with cache cleared
2. ✅ Measure time to interactive
3. ✅ Should be < 3 seconds

#### Test 23: Switch Screens
1. ✅ Click giữa các screens
2. ✅ Transition nhanh
3. ✅ No lag

**Expected:**
- ✅ Load time hợp lý
- ✅ Smooth transitions

---

## ✅ Checklist tổng hợp

### Backend
- [ ] Eureka đang chạy (8761)
- [ ] API Gateway đang chạy (8080)
- [ ] Product Service OK
- [ ] Order Service OK
- [ ] User Service OK
- [ ] Database có data test

### Frontend
- [ ] npm start thành công
- [ ] Truy cập /restaurant OK
- [ ] Toaster component hiển thị

### Profile Screen
- [ ] Load restaurant info
- [ ] Hiển thị đầy đủ fields
- [ ] Loading state
- [ ] Error handling

### Product Screen
- [ ] Load products list
- [ ] Search hoạt động
- [ ] Delete product OK
- [ ] Format giá VND
- [ ] Status badges

### Order Screen
- [ ] Load orders list
- [ ] Format date/time/price
- [ ] Status colors đúng
- [ ] View button

### Revenue Screen
- [ ] Load chart data
- [ ] Filter by period
- [ ] 3 stat cards
- [ ] Best seller
- [ ] Format VND

### General
- [ ] Toast notifications
- [ ] Loading spinners
- [ ] Empty states
- [ ] No console errors
- [ ] API calls successful
- [ ] Token auth working

---

## 🐛 Common Issues

### Issue 1: 404 Not Found
**Cause:** Backend service chưa start
**Fix:** Check Eureka dashboard, restart services

### Issue 2: CORS Error
**Cause:** CorsConfig chưa đúng
**Fix:** Check backend CorsConfig.java

### Issue 3: Không hiển thị data
**Cause:** Database empty hoặc wrong restaurantId
**Fix:** Insert test data, check restaurantId = 1

### Issue 4: Token expired
**Cause:** JWT token hết hạn
**Fix:** Login lại để lấy token mới

---

**Test Complete! 🎉**

Nếu tất cả test cases đều PASS → Integration thành công! ✅
