# Delivery Service Integration với Frontend

## Tổng quan
Delivery service đã được tích hợp hoàn toàn với frontend để tracking drone giao hàng tự động.

## Các thay đổi đã thực hiện

### 1. Backend Changes (Delivery Service)
**File:** `delivery-service/src/main/java/vn/cnpm/delivery_service/messaging/OrderReadyEventConsumer.java`

- **Thời gian giao hàng:** Cập nhật từ 10s lên 38s (5s bay đến nhà hàng + 3s lấy hàng + 30s giao hàng)
- **Flow tự động:**
  1. Khi nhà hàng đánh dấu đơn hàng READY → RabbitMQ gửi event
  2. Delivery Service nhận event → Tự động tạo delivery record
  3. Tự động gán drone (ID ngẫu nhiên: DRONE-XXXXXXXX)
  4. Drone tự động bay đến nhà hàng (5s)
  5. Drone lấy hàng (3s)
  6. Drone giao hàng cho khách (30s)
  7. Hoàn thành

### 2. Frontend Changes

#### A. Service Layer
**File mới:** `Front_end/foodfast-app/src/services/deliveryService.js`
- API calls đến delivery service (port 8086)
- Helper functions: `formatDeliveryStatus()`, `getDeliveryStatusColor()`
- Các API endpoints:
  - `getDeliveryByOrderId(orderId)` - Lấy thông tin delivery theo order
  - `getActiveDeliveries()` - Lấy tất cả deliveries đang hoạt động
  - `getAllDeliveries()` - Lấy tất cả deliveries (admin)
  - `getDeliveriesByDrone(droneId)` - Lấy deliveries theo drone

**File cập nhật:** `Front_end/foodfast-app/src/config/apiConfig.js`
- Thêm `DELIVERY_SERVICE_URL` configuration
- Helper function: `getDeliveryServiceUrl(path)`
- Auto-detect localhost/LAN deployment

#### B. Customer View (OrdersPage)
**File:** `Front_end/foodfast-app/src/pages/OrdersPage.js`

**Thay đổi:**
- Import `deliveryService` và `Plane` icon
- Thêm states: `deliveryInfo`, `loadingDelivery`
- Cập nhật `handleViewDetails()` để fetch delivery info
- Hiển thị delivery information trong Order Details Dialog:
  - Drone ID
  - Delivery Status (với color badges)
  - Timeline: Assigned At, Picked Up At, Delivered At
  - Delivery Address

**UI/UX:**
- Blue-themed delivery info card
- Loading spinner khi fetch delivery data
- Chỉ hiển thị khi order status là PREPARING/DELIVERING/DELIVERED
- Message placeholder khi chưa có delivery info

#### C. Admin/Restaurant View (AdminPage)
**File:** `Front_end/foodfast-app/src/pages/AdminPage.js`

**Thay đổi:**
- Import `deliveryService`
- Thêm states trong `OrderScreen`: `deliveryInfo`, `loadingDelivery`
- Cập nhật `handleViewOrder()` để fetch delivery info
- Thêm function `handleCloseDetailDialog()` để reset delivery info
- Hiển thị Delivery Information section trong Order Detail Dialog:
  - Drone ID với icon
  - Delivery Status badge
  - Full timeline với grid layout
  - Current Location (GPS coordinates nếu có)

**UI/UX:**
- Blue-themed delivery section với Plane icon
- Grid layout 2 columns cho timestamps
- Loading state với spinner
- Fallback message khi chưa có drone assigned

## Delivery Status Flow

```
PENDING → ASSIGNED → PICKING_UP → PICKED_UP → DELIVERING → COMPLETED
```

### Status Meanings:
- **PENDING:** Chờ gán drone
- **ASSIGNED:** Đã gán drone
- **PICKING_UP:** Drone đang bay đến nhà hàng
- **PICKED_UP:** Drone đã lấy hàng
- **DELIVERING:** Đang giao hàng cho khách
- **COMPLETED:** Hoàn thành
- **CANCELLED:** Đã hủy

### Status Colors (Frontend):
- PENDING: Gray
- ASSIGNED: Blue
- PICKING_UP: Yellow
- PICKED_UP: Purple
- DELIVERING: Indigo
- COMPLETED: Green
- CANCELLED: Red

## Database Schema

**Table:** `delivery_db.deliveries`

```sql
CREATE TABLE deliveries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT,
  drone_id VARCHAR(255),
  status VARCHAR(50), -- ENUM
  
  -- Restaurant info
  restaurant_id BIGINT,
  restaurant_address VARCHAR(500),
  
  -- Customer delivery info
  delivery_address VARCHAR(500),
  delivery_phone VARCHAR(20),
  delivery_full_name VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP,
  assigned_at TIMESTAMP,
  picked_up_at TIMESTAMP,
  delivering_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- GPS tracking
  current_lat DOUBLE,
  current_lng DOUBLE,
  notes TEXT
);
```

## API Endpoints (Delivery Service)

Base URL: `http://localhost:8086/api`

### Public Endpoints:
- `GET /deliveries` - Lấy tất cả deliveries
- `GET /deliveries/order/{orderId}` - Lấy delivery theo orderId
- `GET /deliveries/active` - Lấy deliveries đang hoạt động
- `GET /deliveries/drone/{droneId}` - Lấy deliveries theo droneId

### Testing Endpoints (Manual control):
- `POST /deliveries/{deliveryId}/pickup` - Đánh dấu đã lấy hàng
- `POST /deliveries/{deliveryId}/start` - Bắt đầu giao hàng
- `POST /deliveries/{deliveryId}/complete` - Hoàn thành giao hàng
- `PUT /deliveries/{deliveryId}/location?lat={lat}&lng={lng}` - Cập nhật vị trí

## Testing Guide

### 1. Kiểm tra flow đầy đủ:
```bash
# 1. Start all services
docker-compose -f docker-compose-full.yml up -d

# 2. Access frontend
http://localhost:3000

# 3. Đặt hàng (customer)
- Login as customer
- Add items to cart
- Place order
- Pay with MoMo/COD

# 4. Nhà hàng xác nhận (restaurant/admin)
- Login as restaurant
- Go to Orders
- Change status to PREPARING
- Click "Mark as Ready" → Triggers drone delivery

# 5. Xem delivery info
- Customer: Orders page → View order details → See delivery info
- Admin: Order screen → View order → See delivery info with drone ID

# 6. Wait ~38 seconds
- Drone automatically delivers
- Order status changes to DELIVERED
```

### 2. Kiểm tra API trực tiếp:
```bash
# Get delivery by order ID
curl http://localhost:8086/api/deliveries/order/1

# Get all active deliveries
curl http://localhost:8086/api/deliveries/active
```

## Configuration

### Environment Variables (.env)
```env
# Optional - defaults to auto-detect
REACT_APP_DELIVERY_SERVICE_URL=http://localhost:8086/api
```

### Auto-detection Logic:
- **Localhost:** `http://localhost:8086/api`
- **LAN:** `http://{hostname}:8086/api`

## Lưu ý quan trọng

### 1. Timing
- Thời gian giao hàng là **giả lập** (38 giây tổng cộng)
- Trong production, thời gian này sẽ dựa vào:
  - Khoảng cách thực tế
  - Tốc độ drone
  - Điều kiện thời tiết
  - Traffic control

### 2. GPS Tracking
- Hiện tại GPS là **ngẫu nhiên** trong khu vực HCM
- Production cần:
  - Real-time GPS từ drone hardware
  - WebSocket cho live tracking
  - Map visualization (Google Maps/Leaflet)

### 3. Error Handling
- Nếu delivery service down, frontend vẫn hoạt động bình thường
- Delivery info sẽ không hiển thị nếu API call fail
- Không ảnh hưởng đến order flow

### 4. RabbitMQ Dependencies
- Delivery service phụ thuộc vào RabbitMQ
- Event `OrderReadyEvent` phải được publish từ Order Service
- Ensure RabbitMQ running: `docker ps | grep rabbitmq`

## Future Enhancements

### 1. Real-time Tracking
- [ ] WebSocket integration cho live updates
- [ ] Map view với drone position
- [ ] ETA calculation
- [ ] Push notifications

### 2. Multiple Drones
- [ ] Drone fleet management
- [ ] Smart assignment based on location
- [ ] Drone availability status
- [ ] Concurrent deliveries

### 3. Advanced Features
- [ ] Weather-based delays
- [ ] Route optimization
- [ ] Battery monitoring
- [ ] Delivery zones/restrictions
- [ ] Photo proof of delivery

## Troubleshooting

### Issue: Không thấy delivery info
**Solutions:**
1. Check delivery service running: `docker ps | grep delivery`
2. Check order status: Must be PREPARING/DELIVERING/DELIVERED
3. Check console for API errors
4. Verify RabbitMQ connection

### Issue: Drone không được gán
**Solutions:**
1. Check RabbitMQ logs: `docker logs rabbitmq`
2. Check delivery service logs: `docker logs delivery-service`
3. Ensure order status changed to PREPARING/READY
4. Check OrderReadyEvent is published

### Issue: API call failed
**Solutions:**
1. Check network: `curl http://localhost:8086/api/deliveries`
2. Check CORS configuration
3. Check delivery service port (8086)
4. Check database connection (delivery_db)

## Architecture Diagram

```
Order Service (8083)
    ↓ (OrderReadyEvent)
RabbitMQ
    ↓
Delivery Service (8086)
    ├→ Assigns Drone (auto)
    ├→ Updates Status (auto)
    └→ Publishes OrderPickedUpEvent
    
Frontend (3000)
    ├→ Customer View (OrdersPage)
    │   └→ Shows delivery tracking
    └→ Admin View (AdminPage)
        └→ Shows delivery status
```

## Contact & Support
- Backend: Check `delivery-service/` logs
- Frontend: Check browser console
- RabbitMQ: Check message queue status
