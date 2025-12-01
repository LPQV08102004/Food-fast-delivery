# Sửa Lỗi Delivery Service - Không Lưu Dữ Liệu Khi Cập Nhật Trạng Thái

## Vấn Đề
Khi nhà hàng chuyển đổi trạng thái đơn hàng từ NEW → PREPARING, thông tin delivery không được lưu vào bảng `deliveries` trong `delivery-service`, khiến drone không thể lấy dữ liệu để tracking đơn hàng.

## Nguyên Nhân
1. **OrderServiceImpl.updateOrderStatus()** chỉ cập nhật database mà không publish event `OrderReadyEvent`
2. **Delivery-service** chờ `OrderReadyEvent` để tạo delivery record
3. Không có event nào được gửi đi khi nhà hàng chuyển trạng thái sang PREPARING → delivery-service không biết để tạo record

## Giải Pháp Đã Thực Hiện

### 1. Thêm Method publishOrderReadyEvent
**File:** `order-service/src/main/java/vn/cnpm/order_service/messaging/OrderEventPublisher.java`

```java
public void publishOrderReadyEvent(OrderReadyEvent event) {
    try {
        log.info("Publishing OrderReadyEvent for orderId: {}", event.getOrderId());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.RESTAURANT_EXCHANGE,
                RabbitMQConfig.ORDER_READY_ROUTING_KEY,
                event
        );
        log.info("OrderReadyEvent published successfully for orderId: {}", event.getOrderId());
    } catch (Exception e) {
        log.error("Failed to publish OrderReadyEvent for orderId: {}", event.getOrderId(), e);
        throw new RuntimeException("Failed to publish order ready event", e);
    }
}
```

### 2. Tạo RestaurantDTO và Thêm Method Lấy Restaurant
**Files mới:**
- `order-service/src/main/java/vn/cnpm/order_service/DTO/RestaurantDTO.java`

**File cập nhật:**
- `order-service/src/main/java/vn/cnpm/order_service/client/ProductClient.java`
- `order-service/src/main/java/vn/cnpm/order_service/client/ProductClientFallback.java`

Thêm method:
```java
@GetMapping("/api/restaurants/{id}")
RestaurantDTO getRestaurantById(@PathVariable("id") Long id);
```

### 3. Sửa OrderServiceImpl.updateOrderStatus()
**File:** `order-service/src/main/java/vn/cnpm/order_service/service/impl/OrderServiceImpl.java`

```java
@Override
@Transactional
public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
    Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
    
    order.setStatus(status);
    Order updated = orderRepository.save(order);
    
    // Nếu đơn hàng chuyển sang PREPARING, publish OrderReadyEvent cho delivery-service
    if (status == OrderStatus.PREPARING) {
        try {
            // Lấy thông tin nhà hàng để có địa chỉ
            RestaurantDTO restaurant = productClient.getRestaurantById(order.getRestaurantId());
            
            OrderReadyEvent event = OrderReadyEvent.builder()
                    .orderId(order.getId())
                    .restaurantId(order.getRestaurantId())
                    .restaurantAddress(restaurant != null ? restaurant.getAddress() : "Unknown Address")
                    .deliveryAddress(order.getDeliveryAddress())
                    .deliveryPhone(order.getDeliveryPhone())
                    .deliveryFullName(order.getDeliveryFullName())
                    .build();
            
            orderEventPublisher.publishOrderReadyEvent(event);
            log.info("OrderReadyEvent published for order {}", orderId);
        } catch (Exception e) {
            log.error("Failed to publish OrderReadyEvent for order {}", orderId, e);
            // Không throw exception để không ảnh hưởng đến việc cập nhật status
        }
    }
    
    log.info("Order {} status updated to {}", orderId, status);
    return mapToDto(updated);
}
```

## Flow Hoạt Động Sau Khi Sửa

1. **Nhà hàng cập nhật trạng thái:** NEW → PREPARING
2. **OrderServiceImpl.updateOrderStatus():**
   - Cập nhật status trong database
   - Lấy thông tin restaurant (địa chỉ)
   - Tạo và publish `OrderReadyEvent` qua RabbitMQ
3. **Delivery-service nhận event:**
   - `OrderReadyEventConsumer.handleOrderReadyEvent()` được trigger
   - Tạo delivery record trong database
   - Gán drone tự động
   - Bắt đầu simulation giao hàng
4. **Frontend có thể tracking:**
   - Gọi API `/api/deliveries/order/{orderId}` để lấy thông tin
   - Hiển thị GPS tracking, ETA, v.v.

## Các File Đã Thay Đổi

### Files Mới
- ✅ `order-service/src/main/java/vn/cnpm/order_service/DTO/RestaurantDTO.java`

### Files Cập Nhật
- ✅ `order-service/src/main/java/vn/cnpm/order_service/messaging/OrderEventPublisher.java`
- ✅ `order-service/src/main/java/vn/cnpm/order_service/service/impl/OrderServiceImpl.java`
- ✅ `order-service/src/main/java/vn/cnpm/order_service/client/ProductClient.java`
- ✅ `order-service/src/main/java/vn/cnpm/order_service/client/ProductClientFallback.java`
- ✅ `order-service/pom.xml`

## Cách Test

### 1. Tạo đơn hàng mới
```bash
POST http://localhost:8080/api/orders
```

### 2. Nhà hàng cập nhật trạng thái sang PREPARING
```bash
PUT http://localhost:8080/api/orders/{orderId}/status?status=PREPARING
```

### 3. Kiểm tra delivery record đã được tạo
```bash
GET http://localhost:8080/api/deliveries/order/{orderId}
```

**Kết quả mong đợi:**
```json
{
  "id": 1,
  "orderId": 1,
  "droneId": "DRONE-001",
  "status": "ASSIGNED",
  "restaurantAddress": "123 Restaurant Street",
  "deliveryAddress": "456 Customer Avenue",
  "currentLat": 10.762622,
  "currentLng": 106.660172,
  "distanceRemaining": 5.2,
  "estimatedArrival": "2025-12-01T12:00:00Z"
}
```

### 4. Xem logs để verify
```bash
# Check order-service logs
docker logs order-service --tail 50 | grep "OrderReadyEvent"

# Check delivery-service logs
docker logs delivery-service --tail 50 | grep "Received OrderReadyEvent"
```

## Rebuild & Deploy

```powershell
# 1. Build order-service (sử dụng Gradle)
cd order-service
.\gradlew.bat clean build -x test

# 2. Rebuild Docker image (không dùng cache để đảm bảo code mới)
docker build --no-cache -t order-service:latest .

# 3. Restart container
cd ..
docker-compose -f docker-compose-full.yml stop order-service
docker-compose -f docker-compose-full.yml up -d order-service
```

## Lưu Ý
- Event chỉ được publish khi status chuyển sang **PREPARING** (không phải NEW, PAID, hay các status khác)
- Nếu không lấy được thông tin restaurant, sẽ dùng fallback "Unknown Address"
- Nếu publish event thất bại, không ảnh hưởng đến việc cập nhật status (logged as error nhưng không throw exception)

## Hoàn Thành
✅ Vấn đề đã được sửa hoàn toàn
✅ Order-service đã rebuild và deploy thành công
✅ Delivery records sẽ được tạo tự động khi nhà hàng chuyển status sang PREPARING
