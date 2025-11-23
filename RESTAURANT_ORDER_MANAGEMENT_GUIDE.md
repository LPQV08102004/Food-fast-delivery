# Hướng dẫn quản lý đơn hàng cho nhà hàng

## Tính năng đã được thêm vào Restaurant Dashboard

### 1. **Xem danh sách đơn hàng**
- Truy cập Restaurant Dashboard → Orders
- Hiển thị tất cả đơn hàng của nhà hàng
- Thông tin bao gồm:
  - Order ID
  - User ID
  - Thời gian đặt hàng
  - Tổng tiền
  - Phương thức thanh toán
  - Trạng thái đơn hàng

### 2. **Xem chi tiết đơn hàng**
- Click vào nút **"Xem chi tiết"** ở mỗi đơn hàng
- Modal hiển thị đầy đủ thông tin:
  - ✅ Thông tin khách hàng (tên, số điện thoại)
  - ✅ Địa chỉ giao hàng đầy đủ
  - ✅ Danh sách món ăn chi tiết
  - ✅ Thông tin thanh toán
  - ✅ Trạng thái hiện tại

### 3. **Cập nhật trạng thái đơn hàng**

Nhà hàng có thể cập nhật trạng thái đơn hàng theo quy trình:

1. **NEW** (Đơn hàng mới) - Đơn hàng vừa được tạo
2. **CONFIRMED** (Đã xác nhận) - Nhà hàng xác nhận nhận đơn
3. **PREPARING** (Đang chế biến) - Bắt đầu nấu món
4. **READY** (Sẵn sàng) - Món ăn đã hoàn thành, chờ lấy hàng
5. **PICKED_UP** (Đã lấy hàng) - Shipper đã lấy hàng
6. **DELIVERING** (Đang giao) - Đang trên đường giao
7. **DELIVERED** (Đã giao) - Giao hàng thành công

**Cách cập nhật:**
- Mở chi tiết đơn hàng
- Chọn trạng thái mới từ dropdown
- Click "Cập nhật trạng thái"

### 4. **Hủy đơn hàng**

Nhà hàng có thể hủy đơn hàng khi:
- Đơn hàng chưa được giao (status ≠ DELIVERED)
- Có lý do chính đáng (hết nguyên liệu, không thể chế biến...)

**Cách hủy:**
- Mở chi tiết đơn hàng
- Click nút "Hủy đơn hàng" (màu đỏ)
- Xác nhận hủy

**Lưu ý:** 
- ⚠️ Khi hủy đơn hàng, stock sản phẩm sẽ được hoàn lại tự động
- ⚠️ Không thể hủy đơn hàng đã giao hoặc đã bị hủy trước đó

### 5. **Màu sắc trạng thái**

- 🟡 **Vàng** - NEW, CONFIRMED (Cần xử lý)
- 🟠 **Cam** - PREPARING, READY (Đang xử lý)
- 🔵 **Xanh dương** - PICKED_UP, DELIVERING (Đang giao)
- 🟢 **Xanh lá** - DELIVERED (Hoàn thành)
- 🔴 **Đỏ** - CANCELLED (Đã hủy)

## API Endpoints được sử dụng

```
GET    /api/orders/restaurant/{restaurantId}  - Lấy orders theo restaurant
GET    /api/orders/{id}                       - Lấy chi tiết order
PUT    /api/orders/{id}/status                - Cập nhật status
PUT    /api/orders/{id}/cancel                - Hủy order
```

## Quy trình xử lý đơn hàng mẫu

1. **Khách hàng đặt hàng** → Status: NEW
2. **Nhà hàng xác nhận** → Cập nhật: CONFIRMED
3. **Bắt đầu nấu** → Cập nhật: PREPARING
4. **Món ăn hoàn thành** → Cập nhật: READY
5. **Shipper lấy hàng** → Cập nhật: PICKED_UP
6. **Đang giao hàng** → Cập nhật: DELIVERING
7. **Giao thành công** → Cập nhật: DELIVERED

## Troubleshooting

### Không thấy đơn hàng?
- Kiểm tra user có `restaurantId` trong profile
- Kiểm tra database có orders với `restaurantId` tương ứng

### Không cập nhật được status?
- Kiểm tra order chưa bị DELIVERED hoặc CANCELLED
- Kiểm tra API endpoint `/orders/{id}/status` hoạt động

### Không hủy được đơn hàng?
- Chỉ hủy được khi status ≠ DELIVERED và ≠ CANCELLED
- Kiểm tra API endpoint `/orders/{id}/cancel` hoạt động

## Thành phần code

### Components
- `OrderScreen.js` - Màn hình danh sách orders
- `OrderDetailModal.js` - Modal chi tiết order

### Services
- `restaurantService.js` - API calls cho restaurant
- `orderService.js` - API calls cho orders

### Backend
- `OrderController.java` - REST endpoints
- `OrderServiceImpl.java` - Business logic
- `OrderStatus.java` - Enum trạng thái
