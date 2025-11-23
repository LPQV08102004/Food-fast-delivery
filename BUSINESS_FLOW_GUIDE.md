# Luồng Nghiệp Vụ Đặt Hàng & Giao Hàng - Food Fast Delivery

## Tổng quan

Hệ thống đã được cập nhật để hỗ trợ đầy đủ luồng nghiệp vụ từ đặt hàng, thanh toán, nhà hàng chế biến, đến giao hàng bằng drone.

## Luồng Hoạt Động Chi Tiết

### **Giai đoạn 1: Khởi tạo & Thanh toán (Order & Payment)**

#### 1.1. Đặt hàng
- Người dùng nhấn "Đặt món"
- **Order Service** tạo đơn hàng với trạng thái `PENDING` (Chờ thanh toán)
- Phát sự kiện `OrderCreatedEvent` lên RabbitMQ

```
Trạng thái đơn: PENDING
Event: OrderCreatedEvent → order.exchange → order.created.queue
```

#### 1.2. Thanh toán
- **Payment Service** lắng nghe `OrderCreatedEvent`
- Xử lý thanh toán (MoMo hoặc phương thức khác)

**Nếu thanh toán thất bại:**
- Phát `PaymentProcessedEvent` với status="FAILED"
- Order Service cập nhật đơn hàng → `CANCELLED`
- Thông báo lỗi cho khách hàng

**Nếu thanh toán thành công:**
- Phát 2 events:
  1. `PaymentProcessedEvent` (status="SUCCESS") → Order Service
  2. `OrderPaidEvent` → Product Service (Restaurant)

```
Trạng thái đơn: PENDING → PAID
Events: 
- PaymentProcessedEvent → payment.exchange → payment.processed.queue
- OrderPaidEvent → payment.exchange → order.paid.queue
```

---

### **Giai đoạn 2: Nhà hàng tiếp nhận (Restaurant Processing)**

#### 2.1. Nhận thông báo đơn hàng
- **Product Service** (Restaurant) lắng nghe `OrderPaidEvent`
- Tạo bản ghi `RestaurantOrder` với status="PENDING_CONFIRMATION"
- Nhà hàng nhận được thông báo có đơn mới

#### 2.2. Xác nhận nhận đơn
- Chủ quán nhấn "Nhận đơn" qua API:
  ```
  POST /api/restaurants/orders/{orderId}/confirm
  ```
- Cập nhật trạng thái: `PENDING_CONFIRMATION` → `PREPARING`

```
Trạng thái nhà hàng: PENDING_CONFIRMATION → PREPARING
```

#### 2.3. Hoàn tất chế biến
- Khi món ăn xong, nhà hàng nhấn "Sẵn sàng" qua API:
  ```
  POST /api/restaurants/orders/{orderId}/ready
  ```
- Cập nhật trạng thái: `PREPARING` → `READY`
- Phát sự kiện `OrderReadyEvent` → Delivery Service

```
Trạng thái nhà hàng: PREPARING → READY
Event: OrderReadyEvent → restaurant.exchange → order.ready.queue
```

---

### **Giai đoạn 3: Giao hàng (Drone Delivery)**

#### 3.1. Tìm và gán drone
- **Delivery Service** lắng nghe `OrderReadyEvent`
- Tự động tạo delivery record
- Gán drone (ID ngẫu nhiên, ví dụ: `DRONE-A7B3C2D1`)
- Drone bắt đầu bay đến nhà hàng

```
Trạng thái giao hàng: PENDING → ASSIGNED → PICKING_UP
```

#### 3.2. Lấy món ăn
- Drone đến nhà hàng và lấy món (giả lập sau 3 giây)
- Cập nhật trạng thái: `PICKING_UP` → `PICKED_UP`
- Phát sự kiện `OrderPickedUpEvent` → Order Service

```
Trạng thái giao hàng: PICKING_UP → PICKED_UP
Event: OrderPickedUpEvent → delivery.exchange → order.pickedup.queue
Trạng thái đơn hàng: PAID → PICKED_UP
```

#### 3.3. Giao hàng
- Drone bay đến vị trí khách hàng
- Cập nhật trạng thái: `PICKED_UP` → `DELIVERING`
- Giả lập giao hàng (5 giây)

```
Trạng thái giao hàng: PICKED_UP → DELIVERING
```

#### 3.4. Hoàn thành
- Drone giao món và xác nhận
- Cập nhật trạng thái: `DELIVERING` → `COMPLETED`

```
Trạng thái giao hàng: DELIVERING → COMPLETED
Trạng thái đơn hàng: PICKED_UP → COMPLETED (cần thêm logic)
```

---

## Sơ đồ Trạng thái Đơn hàng

```
PENDING (Chờ thanh toán)
    ↓ (thanh toán thành công)
PAID (Đã thanh toán)
    ↓ (drone lấy hàng)
PICKED_UP (Drone đã lấy)
    ↓ (đang giao)
DELIVERING (Đang giao hàng)
    ↓ (hoàn tất)
COMPLETED (Hoàn thành)

Hoặc:
PENDING → CANCELLED (nếu thanh toán thất bại)
```

---

## API Endpoints Chính

### Order Service (Port 8083)
```
POST   /api/orders                    # Tạo đơn hàng mới
GET    /api/orders/{id}               # Lấy thông tin đơn hàng
GET    /api/orders/user/{userId}      # Lấy đơn hàng theo user
```

### Payment Service (Port 8084)
```
POST   /api/payments/process          # Xử lý thanh toán
GET    /api/payments/order/{orderId}  # Kiểm tra thanh toán
```

### Product Service - Restaurant (Port 8082)
```
GET    /api/restaurants/{restaurantId}/orders              # Danh sách đơn của nhà hàng
POST   /api/restaurants/orders/{orderId}/confirm           # Xác nhận nhận đơn
POST   /api/restaurants/orders/{orderId}/ready             # Đánh dấu sẵn sàng
```

### Delivery Service (Port 8086)
```
GET    /api/deliveries                            # Tất cả deliveries
GET    /api/deliveries/order/{orderId}            # Delivery theo order
GET    /api/deliveries/active                     # Deliveries đang hoạt động
POST   /api/deliveries/{deliveryId}/pickup        # Đánh dấu đã lấy hàng (manual)
POST   /api/deliveries/{deliveryId}/complete      # Hoàn thành giao hàng (manual)
```

---

## Cấu hình Database

Cần tạo database mới cho Delivery Service:

```sql
CREATE DATABASE delivery_db;
```

Các bảng sẽ tự động được tạo khi chạy service (JPA auto-create).

---

## Cấu hình RabbitMQ

Các Exchanges & Queues cần thiết:
- **order.exchange** → order.created.queue
- **payment.exchange** → payment.processed.queue, order.paid.queue
- **restaurant.exchange** → order.ready.queue
- **delivery.exchange** → order.pickedup.queue

---

## Chạy Hệ thống

### 1. Start các service cơ bản:
```powershell
# Eureka, Config, API Gateway
```

### 2. Start microservices:
```powershell
# Order Service (8083)
# Payment Service (8084)
# Product Service (8082)
# Delivery Service (8086) - MỚI
```

### 3. Kiểm tra RabbitMQ:
- URL: http://localhost:15672
- User: guest / guest

---

## Test Luồng Hoàn Chỉnh

### Bước 1: Tạo đơn hàng
```bash
POST http://localhost:8083/api/orders
{
  "userId": 1,
  "restaurantId": 1,
  "items": [
    {"productId": 1, "quantity": 2}
  ],
  "paymentMethod": "MOMO",
  "deliveryInfo": {
    "fullName": "Nguyen Van A",
    "phone": "0901234567",
    "address": "123 Le Loi, Q1",
    "city": "Ho Chi Minh"
  }
}
```

### Bước 2: Kiểm tra thanh toán
```bash
GET http://localhost:8084/api/payments/order/1
```

### Bước 3: Nhà hàng xác nhận
```bash
POST http://localhost:8082/api/restaurants/orders/1/confirm
```

### Bước 4: Nhà hàng đánh dấu sẵn sàng
```bash
POST http://localhost:8082/api/restaurants/orders/1/ready
```

### Bước 5: Kiểm tra delivery
```bash
GET http://localhost:8086/api/deliveries/order/1
```

---

## Giả lập Drone

Delivery Service tự động giả lập quá trình:
1. Gán drone (ngay lập tức)
2. Bay đến nhà hàng (3 giây)
3. Lấy món ăn (ngay lập tức)
4. Bay đến khách (2 giây chuẩn bị)
5. Giao hàng (5 giây)
6. Hoàn thành

**Tổng thời gian giả lập: ~10 giây**

---

## Lưu ý Quan trọng

1. **Trạng thái đồng bộ**: Order Service cập nhật trạng thái dựa trên events từ các service khác
2. **Event-driven**: Tất cả giao tiếp giữa services qua RabbitMQ events
3. **Idempotency**: Payment Service hỗ trợ idempotency key để tránh thanh toán trùng
4. **Resilience**: Có fallback và error handling cho từng bước

---

## Cải tiến Tương lai

1. Thêm trạng thái `DELIVERING` và `COMPLETED` vào Order Service
2. WebSocket để real-time tracking drone
3. Multi-drone management
4. Tính toán thời gian giao hàng thực tế
5. Tích hợp GPS thực
6. Thông báo real-time cho khách hàng
