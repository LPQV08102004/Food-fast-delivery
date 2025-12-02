# Delivery Notification System - Thông báo giao hàng cho nhà hàng và khách hàng

## 📢 Tổng quan

Delivery service bây giờ **GỬI THÔNG BÁO REAL-TIME** cho nhà hàng và khách hàng trong suốt quá trình giao hàng qua RabbitMQ.

## 🔔 Các loại thông báo

### 1. **OrderPickedUpEvent** - Drone đã lấy hàng ✅
**Khi**: Drone đến nhà hàng và lấy món ăn  
**Routing Key**: `order.pickedup`  
**Queue**: `order.pickedup.queue`  
**Dữ liệu**:
```json
{
  "orderId": 123,
  "droneId": "DRONE-001"
}
```
**Người nhận**: 
- ✅ **Nhà hàng**: "Drone đã lấy món ăn của bạn"
- ✅ **Khách hàng**: "Món ăn đang trên đường giao đến bạn"

---

### 2. **OrderDeliveringEvent** - Bắt đầu giao hàng 🚁
**Khi**: Drone rời nhà hàng và bắt đầu bay đến khách hàng  
**Routing Key**: `order.delivering`  
**Queue**: `order.delivering.queue`  
**Dữ liệu**:
```json
{
  "orderId": 123,
  "droneId": "DRONE-001",
  "currentLat": 10.7769,
  "currentLng": 106.7009,
  "estimatedMinutes": 15.5
}
```
**Người nhận**:
- ✅ **Khách hàng**: "Drone đang trên đường, dự kiến 15 phút nữa sẽ đến"
- ✅ **Nhà hàng**: "Đơn hàng #123 đang được giao"

---

### 3. **DroneLocationUpdateEvent** - Cập nhật GPS mỗi 5 giây 📍
**Khi**: Trong quá trình PICKING_UP, PICKED_UP, DELIVERING  
**Routing Key**: `drone.location.update`  
**Queue**: `drone.location.update.queue`  
**Tần suất**: **5 giây/lần**  
**Dữ liệu**:
```json
{
  "orderId": 123,
  "droneId": "DRONE-001",
  "status": "DELIVERING",
  "currentLat": 10.7850,
  "currentLng": 106.7120,
  "distanceRemaining": 2.3,
  "currentSpeed": 45.0,
  "estimatedArrivalSeconds": 184
}
```
**Người nhận**:
- ✅ **Khách hàng**: Cập nhật bản đồ real-time, ETA countdown
- ✅ **Nhà hàng**: Theo dõi tiến độ giao hàng

---

### 4. **OrderCompletedEvent** - Giao hàng thành công ✅
**Khi**: Drone đã đến khách hàng (< 50m) và hoàn thành  
**Routing Key**: `order.completed`  
**Queue**: `order.completed.queue`  
**Dữ liệu**:
```json
{
  "orderId": 123,
  "droneId": "DRONE-001",
  "completedAt": "2025-12-02T08:30:15Z",
  "deliveryLat": 10.7245,
  "deliveryLng": 106.7412
}
```
**Người nhận**:
- ✅ **Khách hàng**: "Đơn hàng đã được giao thành công!"
- ✅ **Nhà hàng**: "Đơn #123 hoàn tất - Thanh toán đã xử lý"

## 🔧 Implementation

### Backend Events

**Các file event được tạo**:
1. `OrderDeliveringEvent.java` - Bắt đầu giao
2. `OrderCompletedEvent.java` - Hoàn thành
3. `DroneLocationUpdateEvent.java` - GPS real-time

### RabbitMQ Configuration

**File**: `RabbitMQConfig.java`

```java
// Queues
public static final String ORDER_PICKED_UP_QUEUE = "order.pickedup.queue";
public static final String ORDER_DELIVERING_QUEUE = "order.delivering.queue";
public static final String ORDER_COMPLETED_QUEUE = "order.completed.queue";
public static final String DRONE_LOCATION_UPDATE_QUEUE = "drone.location.update.queue";

// Routing Keys
public static final String ORDER_PICKED_UP_ROUTING_KEY = "order.pickedup";
public static final String ORDER_DELIVERING_ROUTING_KEY = "order.delivering";
public static final String ORDER_COMPLETED_ROUTING_KEY = "order.completed";
public static final String DRONE_LOCATION_UPDATE_ROUTING_KEY = "drone.location.update";
```

### Event Publisher

**File**: `DeliveryEventPublisher.java`

```java
public void publishOrderPickedUpEvent(OrderPickedUpEvent event)
public void publishOrderDeliveringEvent(OrderDeliveringEvent event)
public void publishOrderCompletedEvent(OrderCompletedEvent event)
public void publishDroneLocationUpdate(DroneLocationUpdateEvent event)
```

### GPS Simulation Service

**File**: `GpsSimulationService.java`

Tự động gửi events khi:
- ✅ Drone đến nhà hàng → `publishDeliveringEvent()`
- ✅ Drone hoàn thành → `publishCompletedEvent()`
- ✅ Mỗi 5 giây → `publishLocationUpdate()`

## 📊 Flow hoàn chỉnh

```
1. Nhà hàng tạo đơn → ORDER_READY_EVENT
   ↓
2. Delivery Service nhận → Gán drone → Drone bay đến nhà hàng
   ↓
3. Drone GPS update mỗi 5s → DRONE_LOCATION_UPDATE
   ↓
4. Drone đến nhà hàng (< 50m) → ORDER_PICKED_UP_EVENT
   ↓
5. Drone bắt đầu giao hàng → ORDER_DELIVERING_EVENT
   ↓
6. Drone GPS update mỗi 5s → DRONE_LOCATION_UPDATE
   ↓
7. Drone đến khách (< 50m) → ORDER_COMPLETED_EVENT
```

## 🧪 Test thông báo

### 1. Kiểm tra RabbitMQ Queues

Truy cập: http://localhost:15672  
Login: `admin` / `admin`

Kiểm tra các queues:
- ✅ `order.pickedup.queue`
- ✅ `order.delivering.queue`
- ✅ `order.completed.queue`
- ✅ `drone.location.update.queue`

### 2. Subscribe vào events (Frontend/Order Service)

```java
@RabbitListener(queues = "order.delivering.queue")
public void handleOrderDelivering(OrderDeliveringEvent event) {
    // Thông báo cho khách hàng qua WebSocket/SSE
    notificationService.notifyCustomer(
        event.getOrderId(), 
        "Drone đang trên đường, dự kiến " + event.getEstimatedMinutes() + " phút"
    );
}

@RabbitListener(queues = "drone.location.update.queue")
public void handleDroneLocationUpdate(DroneLocationUpdateEvent event) {
    // Cập nhật bản đồ real-time
    websocketService.sendToOrder(
        event.getOrderId(), 
        "/topic/drone-location",
        event
    );
}

@RabbitListener(queues = "order.completed.queue")
public void handleOrderCompleted(OrderCompletedEvent event) {
    // Thông báo hoàn thành
    notificationService.notifyCustomer(
        event.getOrderId(),
        "✅ Đơn hàng đã được giao thành công!"
    );
    
    // Cập nhật order status
    orderService.markAsDelivered(event.getOrderId());
}
```

### 3. Xem logs real-time

```powershell
# Xem logs delivery service
docker logs -f delivery-service

# Tìm các event được publish
docker logs delivery-service | Select-String "Publishing|published"
```

Kết quả mong đợi:
```
Publishing OrderPickedUpEvent for orderId: 123 by drone DRONE-001
OrderPickedUpEvent published successfully

Publishing OrderDeliveringEvent for orderId: 123 by drone DRONE-001
OrderDeliveringEvent published successfully

Drone location update published for order: 123 - Lat: 10.7850, Lng: 106.7120, Distance: 2.3 km

Publishing OrderCompletedEvent for orderId: 123 by drone DRONE-001
OrderCompletedEvent published successfully
```

## 🎯 Tích hợp Frontend

### WebSocket cho real-time updates

```javascript
// OrdersPage.js hoặc OrderDetailPage.js
import { Stomp } from '@stomp/stompjs';

useEffect(() => {
  const client = Stomp.over(() => new WebSocket('ws://localhost:8080/ws'));
  
  client.connect({}, () => {
    // Subscribe vào drone location updates
    client.subscribe(`/topic/drone-location/${orderId}`, (message) => {
      const update = JSON.parse(message.body);
      setDroneLocation({
        lat: update.currentLat,
        lng: update.currentLng
      });
      setETA(update.estimatedArrivalSeconds);
    });
    
    // Subscribe vào order status changes
    client.subscribe(`/topic/order-status/${orderId}`, (message) => {
      const event = JSON.parse(message.body);
      if (event.type === 'DELIVERING') {
        showNotification('🚁 Drone đang trên đường!');
      } else if (event.type === 'COMPLETED') {
        showNotification('✅ Giao hàng thành công!');
        confetti();
      }
    });
  });
  
  return () => client.disconnect();
}, [orderId]);
```

### Notification Component

```jsx
const OrderNotification = ({ event }) => {
  const messages = {
    PICKED_UP: '📦 Drone đã lấy món ăn từ nhà hàng',
    DELIVERING: '🚁 Drone đang trên đường giao đến bạn',
    COMPLETED: '✅ Đơn hàng đã được giao thành công!'
  };
  
  return (
    <div className="notification">
      <p>{messages[event.status]}</p>
      {event.estimatedMinutes && (
        <p className="eta">Dự kiến: {Math.ceil(event.estimatedMinutes)} phút</p>
      )}
    </div>
  );
};
```

## 🔄 Tần suất gửi events

| Event | Tần suất | Khi nào |
|-------|----------|---------|
| `OrderPickedUpEvent` | 1 lần/đơn | Drone đến nhà hàng |
| `OrderDeliveringEvent` | 1 lần/đơn | Bắt đầu giao hàng |
| `DroneLocationUpdateEvent` | **Mỗi 5 giây** | Trong quá trình bay |
| `OrderCompletedEvent` | 1 lần/đơn | Đến địa điểm giao |

**Lưu ý**: `DroneLocationUpdateEvent` chỉ gửi khi drone đang di chuyển (PICKING_UP, PICKED_UP, DELIVERING), KHÔNG gửi khi COMPLETED.

## ✅ Lợi ích

1. ✅ **Khách hàng**: 
   - Theo dõi drone real-time trên bản đồ
   - Nhận thông báo từng giai đoạn
   - Biết chính xác ETA

2. ✅ **Nhà hàng**:
   - Xác nhận drone đã lấy hàng
   - Theo dõi tiến độ giao hàng
   - Biết khi nào giao thành công

3. ✅ **Hệ thống**:
   - Tách biệt concerns (microservices)
   - Dễ mở rộng (thêm service mới subscribe dễ dàng)
   - Reliable (RabbitMQ đảm bảo message delivery)

## 🚀 Deploy

```powershell
# Rebuild delivery-service
cd delivery-service
mvn clean package -DskipTests

# Rebuild Docker image
cd ..
docker-compose -f docker-compose-full.yml build delivery-service

# Restart container
docker-compose -f docker-compose-full.yml up -d delivery-service
```

## 📝 Next Steps

1. ✅ Tạo consumer trong Order Service để nhận events
2. ✅ Tạo WebSocket endpoint để forward events đến frontend
3. ✅ Implement notification UI cho khách hàng
4. ✅ Thêm push notifications (FCM/OneSignal) cho mobile
5. ✅ Lưu notification history vào database

---

**Updated**: 2025-12-02  
**Status**: ✅ Implemented - Ready for integration
