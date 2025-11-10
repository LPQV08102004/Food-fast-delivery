# Backend Startup Guide

## Yêu cầu

- Java 17 hoặc cao hơn
- Maven 3.6+
- Gradle 7.0+ (cho API Gateway)
- MySQL Server đang chạy
- **Docker Desktop (cho RabbitMQ)** ⭐ MỚI
- Port 8080-8084, 8761, 5672, 15672 available

## Chuẩn bị Database

### 1. Tạo Databases

Kết nối MySQL và chạy các lệnh sau:

```sql
-- Tạo databases
CREATE DATABASE IF NOT EXISTS user_service;
CREATE DATABASE IF NOT EXISTS product_service;
CREATE DATABASE IF NOT EXISTS order_service;
CREATE DATABASE IF NOT EXISTS payment_service;

-- Kiểm tra
SHOW DATABASES;
```

### 2. Cấu hình MySQL Connection

Các services đã cấu hình:
- **Username**: root
- **Password**: 08102004
- **Host**: localhost:3306

Nếu MySQL của bạn khác, cập nhật file `application.properties` hoặc `application.yml` trong từng service.

## ⭐ MỚI: Chuẩn bị RabbitMQ

### Cách nhanh nhất: Sử dụng Script

```cmd
start-rabbitmq.bat
```

Script sẽ tự động:
- ✅ Kiểm tra Docker
- ✅ Tạo/Start RabbitMQ container  
- ✅ Mở Management Console

**RabbitMQ Management Console**: http://localhost:15672
- Username: `guest`
- Password: `guest`

### Cách thủ công: Docker Command

```cmd
docker run -d --name rabbitmq ^
  -p 5672:5672 ^
  -p 15672:15672 ^
  -e RABBITMQ_DEFAULT_USER=guest ^
  -e RABBITMQ_DEFAULT_PASS=guest ^
  rabbitmq:3-management
```

**Xem chi tiết**: `RABBITMQ_QUICK_START.md`

## Thứ tự khởi động Services

**QUAN TRỌNG**: Phải khởi động theo thứ tự này!

### 0. RabbitMQ (Message Queue) - PORT 5672, 15672 ⭐ MỚI

```cmd
# Chạy script
start-rabbitmq.bat

# Hoặc thủ công
docker start rabbitmq
```

Kiểm tra: http://localhost:15672 (guest/guest)

---

### 1. Eureka Service (Service Discovery) - PORT 8761

```powershell
# Terminal 1
cd C:\Study\CNPM\Food-fast-delivery\eureka-service
mvn clean install
mvn spring-boot:run
```

Đợi thấy:
```
Tomcat started on port(s): 8761
```

Kiểm tra: http://localhost:8761
- Bạn sẽ thấy Eureka Dashboard

---

### 2. User Service - PORT 8081

```powershell
# Terminal 2
cd C:\Study\CNPM\Food-fast-delivery\user-service
mvn clean install
mvn spring-boot:run
```

Đợi thấy:
```
Started UserServiceApplication on port 8081
```

Endpoints:
- POST /api/auth/register - Đăng ký
- POST /api/auth/login - Đăng nhập
- GET /api/users/profile - Lấy profile (cần token)
- GET /api/users - Admin: Lấy all users

---

### 3. Product Service - PORT 8082 ⭐ CÓ RABBITMQ

```powershell
# Terminal 3
cd C:\Study\CNPM\Food-fast-delivery\product-service
mvn clean install
mvn spring-boot:run
```

Đợi thấy:
```
Started ProductServiceApplication on port 8082
Connection to RabbitMQ established ✅
```

**Chức năng mới**:
- Listen order events để update inventory (sẵn sàng cho tương lai)

Endpoints:
- GET /api/products - Lấy tất cả products
- GET /api/products/{id} - Lấy product theo ID
- POST /api/products - Tạo product mới
- PUT /api/products/{id} - Update product
- DELETE /api/products/{id} - Xóa product

---

### 4. Order Service - PORT 8083 ⭐ CÓ RABBITMQ

```powershell
# Terminal 4
cd C:\Study\CNPM\Food-fast-delivery\order-service
mvn clean install
mvn spring-boot:run
```

Đợi thấy:
```
Started OrderServiceApplication on port 8083
Connection to RabbitMQ established ✅
```

**Chức năng mới**:
- ✅ Publish order events khi tạo order
- ✅ Listen payment results để update order status
- ✅ Async payment processing (không blocking)

Endpoints:
- POST /api/orders - Tạo order mới (ASYNC với RabbitMQ)
- GET /api/orders - Lấy tất cả orders
- GET /api/orders/{id} - Lấy order theo ID
- GET /api/orders/my-orders - Orders của user hiện tại
- PUT /api/orders/{id}/status - Update status

---

### 5. Payment Service - PORT 8084 ⭐ CÓ RABBITMQ

```powershell
# Terminal 5
cd C:\Study\CNPM\Food-fast-delivery\payment-service
mvn clean install
mvn spring-boot:run
```

Đợi thấy:
```
Started PaymentServiceApplication on port 8084
Connection to RabbitMQ established ✅
Listening to payment.request.queue
```

**Chức năng mới**:
- ✅ Listen order events để xử lý payment
- ✅ Publish payment results
- ✅ Auto retry khi failed
- ✅ 80% success rate (simulate real world)

Endpoints:
- POST /api/payments - Tạo payment (vẫn có cho backward compatibility)
- POST /api/payments/{id}/process - Xử lý payment
- GET /api/payments/{id} - Lấy payment theo ID
- GET /api/payments/order/{orderId} - Lấy payment theo order

---

### 6. API Gateway - PORT 8080

```powershell
# Terminal 6
cd C:\Study\CNPM\Food-fast-delivery\api-gateway

# Nếu dùng Gradle wrapper
./gradlew clean build
./gradlew bootRun

# Hoặc nếu có Gradle installed
gradle clean build
gradle bootRun
```

Đợi thấy:
```
Netty started on port 8080
```

API Gateway Routes:
- http://localhost:8080/api/auth/** → User Service
- http://localhost:8080/api/users/** → User Service
- http://localhost:8080/api/products/** → Product Service
- http://localhost:8080/api/orders/** → Order Service
- http://localhost:8080/api/payments/** → Payment Service

---

### 7. Frontend - PORT 3000

```powershell
# Terminal 7
cd C:\Study\CNPM\Food-fast-delivery\Front_end\foodfast-app

# Cài đặt dependencies (chạy lần đầu tiên hoặc khi có thay đổi package.json)
npm install

# Start frontend
npm start
```

Đợi thấy:
```
webpack compiled successfully
```

Frontend URL: http://localhost:3000

**Lưu ý:** Nếu gặp lỗi `Module not found: Error: Can't resolve 'axios'` hoặc package nào khác, chạy `npm install` trước khi start.

---

## ⭐ MỚI: Kiểm tra RabbitMQ Message Flow

### 1. Xem RabbitMQ Queues

Truy cập: http://localhost:15672 → Tab "Queues"

Bạn sẽ thấy các queues:
- ✅ `order.created.queue` - Orders đang đợi xử lý
- ✅ `payment.request.queue` - Payment requests
- ✅ `payment.processed.queue` - Payment results
- ✅ `order.status.updated.queue` - Order status updates

### 2. Test Order với RabbitMQ

```bash
# Tạo order
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"paymentMethod\":\"card\",\"items\":[{\"productId\":1,\"quantity\":2}],\"deliveryInfo\":{\"fullName\":\"Test User\",\"phone\":\"0123456789\",\"address\":\"123 Test\",\"city\":\"HCMC\"}}"
```

**Xem logs để thấy message flow**:

**Order Service** sẽ log:
```
INFO: Creating order for user: 1
INFO: Order created with ID: 1
INFO: Publishing order created event
```

**Payment Service** sẽ log:
```
INFO: Received order created event: Order ID 1
INFO: Processing payment...
INFO: Payment processed successfully
INFO: Publishing payment result
```

**Order Service** sẽ log:
```
INFO: Received payment processed event
INFO: Payment successful, updating order status
INFO: Order CONFIRMED
```

### 3. Giám sát trong RabbitMQ Console

- **Exchanges**: Xem message routing
- **Queues**: Xem messages waiting/processed
- **Connections**: Xem services connected
- **Channels**: Xem communication channels

---

## Ports Summary

| Service | Port | URL | RabbitMQ |
|---------|------|-----|----------|
| Eureka Server | 8761 | http://localhost:8761 | ❌ |
| User Service | 8081 | http://localhost:8081 | ❌ |
| Product Service | 8082 | http://localhost:8082 | ✅ |
| Order Service | 8083 | http://localhost:8083 | ✅ |
| Payment Service | 8084 | http://localhost:8084 | ✅ |
| API Gateway | 8080 | http://localhost:8080 | ❌ |
| RabbitMQ AMQP | 5672 | - | - |
| RabbitMQ Management | 15672 | http://localhost:15672 | - |
| Frontend | 3000 | http://localhost:3000 | ❌ |

---

## Kiểm tra hệ thống

### 1. Kiểm tra Services đã connect RabbitMQ

Vào RabbitMQ Console → Connections:
```
✅ order-service (2 channels)
✅ payment-service (2 channels)
✅ product-service (1 channel)
```

### 2. Kiểm tra Queues có messages không

Vào RabbitMQ Console → Queues:
- **Ready**: Messages đang chờ xử lý
- **Unacked**: Messages đang được xử lý
- **Total**: Tổng số messages

### 3. Test Full Flow

1. Tạo order qua API
2. Xem logs của Order Service → Payment Service → Order Service
3. Check RabbitMQ Console xem message flow
4. Check order status đã update chưa

---

## Troubleshooting

### RabbitMQ connection failed

**Lỗi**: `Connection refused: localhost:5672`

**Giải pháp**:
```cmd
# Kiểm tra RabbitMQ
docker ps | findstr rabbitmq

# Nếu không chạy
docker start rabbitmq

# Xem logs
docker logs rabbitmq
```

### Service không thể connect RabbitMQ

**Kiểm tra**:
1. RabbitMQ đang chạy: http://localhost:15672
2. Port 5672 available
3. application.yml có config đúng:
```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

### Messages không được consume

1. Check service có đang chạy không
2. Xem logs có error không
3. Check RabbitMQ Console → Queues → "Ready" messages
4. Check Consumers có active không

---

## Tài liệu tham khảo

- **RabbitMQ Quick Start**: `RABBITMQ_QUICK_START.md`
- **RabbitMQ Integration Guide**: `RABBITMQ_INTEGRATION_GUIDE.md`
- **Cart & Restaurant Logic**: `Front_end/foodfast-app/CART_RESTAURANT_LOGIC.md`

---

## Tóm tắt Flow mới với RabbitMQ

### TRƯỚC (Synchronous):
```
User → Order Service → Payment Service (REST) → Response
              ↓ (blocking)
          Wait...
```

### SAU (Asynchronous với RabbitMQ):
```
User → Order Service → RabbitMQ → Payment Service
         ↓ (immediate)              ↓
    Response ngay               Process async
         ↓                           ↓
    Order saved              Publish result
                                    ↓
                            Order status updated
```

**Lợi ích**:
- ✅ Non-blocking - User không phải đợi
- ✅ Loose coupling - Services độc lập
- ✅ Auto retry - RabbitMQ tự động retry 3 lần
- ✅ Resilient - Payment down không ảnh hưởng order creation
- ✅ Scalable - Scale từng service độc lập

---

🚀 **Hệ thống đã sẵn sàng với Event-Driven Architecture!**
