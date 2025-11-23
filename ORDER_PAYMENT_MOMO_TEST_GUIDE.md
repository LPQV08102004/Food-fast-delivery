# 🧪 HƯỚNG DẪN TEST ORDER VỚI PAYMENT MOMO

## 📋 Tổng quan

Tài liệu này hướng dẫn chi tiết cách test luồng tạo Order và thanh toán qua MoMo Payment Gateway trong hệ thống Food Fast Delivery.

## 🔄 Luồng hoạt động (Flow)

```
1. User tạo Order → Order Service
2. Order Service lưu Order → Publish OrderCreatedEvent qua RabbitMQ
3. Payment Service nhận event → Tạo Payment với MoMo
4. MoMo trả về PayURL → User redirect đến MoMo
5. User thanh toán trên MoMo
6. MoMo callback về Payment Service → Cập nhật trạng thái
7. Payment Service cập nhật Order status qua RabbitMQ
```

## 🚀 Bước 1: Chuẩn bị môi trường

### 1.1. Start các services cần thiết

```bash
# 1. Start Eureka Service (port 8761)
cd eureka-service
mvnw spring-boot:run

# 2. Start RabbitMQ (Docker)
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin123 rabbitmq:3-management

# 3. Start MySQL cho Payment Service
# Đảm bảo MySQL đang chạy và có database: payment_service

# 4. Start MySQL cho Order Service
# Đảm bảo MySQL đang chạy và có database: order_service

# 5. Start Product Service (port 8082)
cd product-service
mvnw spring-boot:run

# 6. Start User Service (port 8081)
cd user-service
mvnw spring-boot:run

# 7. Start Order Service (port 8083)
cd order-service
gradlew bootRun

# 8. Start Payment Service (port 8084)
cd payment-service
gradlew bootRun
```

### 1.2. Kiểm tra services đang chạy

```bash
# Check RabbitMQ
http://localhost:15672
# Login: admin/admin123

# Check Eureka Dashboard
http://localhost:8761

# Check Order Service Health
curl http://localhost:8083/actuator/health

# Check Payment Service Health
curl http://localhost:8084/actuator/health
```

## 📝 Bước 2: Chuẩn bị dữ liệu test

### 2.1. Tạo Product (nếu chưa có)

```bash
# POST http://localhost:8082/api/products
curl -X POST http://localhost:8082/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Phở Bò Đặc Biệt",
    "description": "Phở bò truyền thống Hà Nội",
    "price": 55000,
    "category": "FOOD",
    "imageUrl": "https://example.com/pho.jpg",
    "restaurantId": 1,
    "available": true
  }'
```

**Response mẫu:**
```json
{
  "id": 1,
  "name": "Phở Bò Đặc Biệt",
  "price": 55000,
  "category": "FOOD",
  "restaurantId": 1,
  "available": true
}
```

### 2.2. Tạo User (nếu chưa có)

```bash
# POST http://localhost:8081/api/users/register
curl -X POST http://localhost:8081/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Nguyễn Văn Test",
    "phoneNumber": "0901234567"
  }'
```

## 🧪 Bước 3: Test luồng Order + Payment MoMo

### 3.1. Tạo Order với Payment Method là MOMO

```bash
# POST http://localhost:8083/api/orders
curl -X POST http://localhost:8083/api/orders \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 1" \
  -d '{
    "userId": 1,
    "restaurantId": 1,
    "paymentMethod": "MOMO",
    "items": [
      {
        "productId": 1,
        "quantity": 2
      }
    ],
    "deliveryInfo": {
      "fullName": "Nguyễn Văn Test",
      "phone": "0901234567",
      "address": "123 Nguyễn Huệ",
      "city": "TP.HCM",
      "notes": "Giao giờ hành chính"
    }
  }'
```

**Response mẫu:**
```json
{
  "id": 1,
  "userId": 1,
  "status": "PENDING",
  "totalPrice": 110000.0,
  "paymentMethod": "MOMO",
  "paymentStatus": "PENDING",
  "orderItems": [
    {
      "productId": 1,
      "productName": "Phở Bò Đặc Biệt",
      "quantity": 2,
      "price": 55000.0
    }
  ],
  "createdAt": "2025-11-22T10:30:00Z",
  "updatedAt": "2025-11-22T10:30:00Z"
}
```

**Lưu ý:** Order Service sẽ publish `OrderCreatedEvent` qua RabbitMQ

### 3.2. Kiểm tra RabbitMQ đã nhận event

Vào RabbitMQ Management: http://localhost:15672
- Tab **Queues**: Kiểm tra queue `order.created.queue`
- Tab **Exchanges**: Kiểm tra exchange `order.exchange`

### 3.3. Payment Service tự động tạo Payment với MoMo

Payment Service lắng nghe RabbitMQ và tự động tạo payment. Kiểm tra:

```bash
# GET http://localhost:8084/api/payments/order/1
curl http://localhost:8084/api/payments/order/1
```

**Response mẫu:**
```json
{
  "id": 1,
  "orderId": 1,
  "amount": 110000.0,
  "status": "PENDING",
  "paymentMethod": "MOMO",
  "momoPayUrl": "https://test-payment.momo.vn/pay/store/TEST12345",
  "momoRequestId": "550e8400-e29b-41d4-a716-446655440000",
  "momoOrderId": "ORDER_1_1732270200000",
  "momoResultCode": 0,
  "momoMessage": "Successful",
  "createdAt": "2025-11-22T10:30:00Z"
}
```

### 3.4. Redirect user đến MoMo Payment URL

**Frontend cần làm:**
1. Nhận `momoPayUrl` từ response
2. Redirect user đến URL này: `window.location.href = response.momoPayUrl`
3. User sẽ thấy trang thanh toán MoMo

### 3.5. Test thanh toán trên MoMo Sandbox

**Thông tin test MoMo:**
- Môi trường: **Test/Sandbox**
- URL: https://test-payment.momo.vn
- Không cần thẻ thật, chỉ cần click "Thanh toán" trên sandbox

**Trên trang MoMo:**
1. Nhập số điện thoại: `0909000000` (số test)
2. Nhập OTP: `123456` (OTP test)
3. Click "Xác nhận thanh toán"

### 3.6. MoMo Callback tự động

Sau khi thanh toán, MoMo sẽ gọi callback về:
```
POST http://localhost:8084/api/payments/momo/callback
```

**Callback data từ MoMo:**
```json
{
  "orderId": "ORDER_1_1732270200000",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "resultCode": 0,
  "message": "Successful",
  "transId": "2567893210",
  "amount": 110000,
  "signature": "..."
}
```

**Payment Service sẽ:**
- Cập nhật payment status = `SUCCESS`
- Lưu `momoTransId`
- Publish event cập nhật Order

### 3.7. Kiểm tra kết quả Payment

```bash
# GET http://localhost:8084/api/payments/order/1
curl http://localhost:8084/api/payments/order/1
```

**Response sau khi thanh toán thành công:**
```json
{
  "id": 1,
  "orderId": 1,
  "amount": 110000.0,
  "status": "SUCCESS",
  "paymentMethod": "MOMO",
  "momoTransId": "2567893210",
  "momoResultCode": 0,
  "momoMessage": "Successful",
  "createdAt": "2025-11-22T10:30:00Z",
  "updatedAt": "2025-11-22T10:35:00Z"
}
```

### 3.8. Kiểm tra Order đã được cập nhật

```bash
# GET http://localhost:8083/api/orders/1
curl http://localhost:8083/api/orders/1
```

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "status": "CONFIRMED",
  "totalPrice": 110000.0,
  "paymentMethod": "MOMO",
  "paymentStatus": "SUCCESS",
  "orderItems": [...],
  "createdAt": "2025-11-22T10:30:00Z",
  "updatedAt": "2025-11-22T10:35:00Z"
}
```

## 🔍 Bước 4: Test các trường hợp khác

### 4.1. Test thanh toán thất bại

MoMo trả về `resultCode != 0`:

```json
{
  "orderId": "ORDER_2_1732270300000",
  "requestId": "...",
  "resultCode": 1001,
  "message": "Transaction timeout",
  "transId": null
}
```

Payment status sẽ là `FAILED`

### 4.2. Test kiểm tra payment result từ frontend

```bash
# GET http://localhost:8084/api/payments/momo/result?orderId=ORDER_1_1732270200000
curl "http://localhost:8084/api/payments/momo/result?orderId=ORDER_1_1732270200000"
```

**Response:**
```json
{
  "orderId": 1,
  "status": "SUCCESS",
  "amount": 110000.0,
  "resultCode": 0,
  "message": "Successful"
}
```

### 4.3. Test lấy danh sách orders của user

```bash
# GET http://localhost:8083/api/orders/my-orders
curl -H "X-User-Id: 1" http://localhost:8083/api/orders/my-orders
```

## 🐛 Troubleshooting

### Lỗi 1: Payment Service không nhận được event từ RabbitMQ

**Kiểm tra:**
```bash
# Check RabbitMQ connection
curl http://localhost:15672/api/queues

# Check logs của Order Service
# Tìm dòng: "OrderCreatedEvent published for orderId: X"

# Check logs của Payment Service
# Tìm dòng: "Received OrderCreatedEvent for orderId: X"
```

**Giải pháp:**
- Kiểm tra RabbitMQ đang chạy
- Kiểm tra config RabbitMQ trong application.yml
- Restart cả 2 services

### Lỗi 2: MoMo trả về lỗi signature invalid

**Nguyên nhân:** 
- Secret key không đúng
- Format data sign không đúng

**Giải pháp:**
- Kiểm tra `application.yml` của payment-service
- Đảm bảo đang dùng môi trường `dev`

### Lỗi 3: Callback từ MoMo không hoạt động

**Nguyên nhân:**
- MoMo không thể gọi đến localhost

**Giải pháp (Production):**
- Deploy payment-service lên server public
- Cấu hình `notify-url` với domain thật

**Giải pháp (Test local):**
- Dùng ngrok để expose localhost:
  ```bash
  ngrok http 8084
  ```
- Cập nhật `notify-url` trong application.yml:
  ```yaml
  momo:
    urls:
      notify-url: https://your-ngrok-url.ngrok.io/api/payments/momo/callback
  ```

### Lỗi 4: Database connection failed

**Kiểm tra MySQL:**
```bash
# Test connection
mysql -u root -p
USE payment_service;
SHOW TABLES;
```

**Tạo database nếu chưa có:**
```sql
CREATE DATABASE IF NOT EXISTS payment_service;
CREATE DATABASE IF NOT EXISTS order_service;
```

## 📊 Monitoring & Logs

### Xem logs real-time

**Order Service:**
```bash
cd order-service
gradlew bootRun
# Xem logs tại console
```

**Payment Service:**
```bash
cd payment-service
gradlew bootRun
# Xem logs tại console
```

### Check Actuator endpoints

```bash
# Order Service
curl http://localhost:8083/actuator/health
curl http://localhost:8083/actuator/metrics

# Payment Service
curl http://localhost:8084/actuator/health
curl http://localhost:8084/actuator/metrics
curl http://localhost:8084/actuator/circuitbreakers
```

## 🎯 Test Cases Summary

| Test Case | Endpoint | Expected Result |
|-----------|----------|-----------------|
| Tạo order với MoMo | POST /api/orders | Order PENDING, có momoPayUrl |
| Payment tự động tạo | GET /api/payments/order/{id} | Payment PENDING với MoMo info |
| Thanh toán thành công | MoMo callback | Payment SUCCESS, Order CONFIRMED |
| Thanh toán thất bại | MoMo callback | Payment FAILED, Order PENDING |
| Kiểm tra payment result | GET /api/payments/momo/result | Trả về status chính xác |
| Lấy orders của user | GET /api/orders/my-orders | Danh sách orders + payment status |

## 📱 Frontend Integration Example

```javascript
// 1. Tạo order
async function createOrderWithMomo(orderData) {
  const response = await fetch('http://localhost:8083/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId
    },
    body: JSON.stringify({
      ...orderData,
      paymentMethod: 'MOMO'
    })
  });
  
  const order = await response.json();
  
  // 2. Lấy payment info
  const paymentResponse = await fetch(
    `http://localhost:8084/api/payments/order/${order.id}`
  );
  const payment = await paymentResponse.json();
  
  // 3. Redirect đến MoMo
  if (payment.momoPayUrl) {
    window.location.href = payment.momoPayUrl;
  }
}

// 4. Trang result callback
async function checkPaymentResult() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');
  const resultCode = urlParams.get('resultCode');
  
  const response = await fetch(
    `http://localhost:8084/api/payments/momo/result?orderId=${orderId}&resultCode=${resultCode}`
  );
  const result = await response.json();
  
  if (result.status === 'SUCCESS') {
    // Show success message
    alert('Thanh toán thành công!');
    window.location.href = '/orders';
  } else {
    // Show error message
    alert('Thanh toán thất bại: ' + result.message);
  }
}
```

## ✅ Checklist trước khi test

- [ ] RabbitMQ đang chạy (port 5672, 15672)
- [ ] MySQL đang chạy với databases: payment_service, order_service
- [ ] Eureka Service đang chạy (port 8761)
- [ ] Product Service đang chạy (port 8082)
- [ ] User Service đang chạy (port 8081)
- [ ] Order Service đang chạy (port 8083)
- [ ] Payment Service đang chạy (port 8084)
- [ ] Đã tạo Product test
- [ ] Đã tạo User test
- [ ] Có tool test API (Postman/cURL/Insomnia)

## 🎉 Kết luận

Hệ thống Order + Payment MoMo đã hoạt động với luồng:
1. ✅ Order Service tạo order
2. ✅ RabbitMQ message broker
3. ✅ Payment Service tích hợp MoMo
4. ✅ MoMo callback cập nhật status
5. ✅ Order status được sync với payment

**Next Steps:**
- Tích hợp Delivery Service
- Thêm Notification Service (Email/SMS)
- Implement retry mechanism cho failed payments
- Add payment history tracking
- Setup monitoring với Prometheus + Grafana

