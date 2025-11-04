# Backend Startup Guide

## Yêu cầu

- Java 17 hoặc cao hơn
- Maven 3.6+
- Gradle 7.0+ (cho API Gateway)
- MySQL Server đang chạy
- Port 8080-8084 và 8761 available

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

## Thứ tự khởi động Services

**QUAN TRỌNG**: Phải khởi động theo thứ tự này!

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

### 3. Product Service - PORT 8082

```powershell
# Terminal 3
cd C:\Study\CNPM\Food-fast-delivery\product-service
mvn clean install
mvn spring-boot:run
```

Đợi thấy:
```
Started ProductServiceApplication on port 8082
```

Endpoints:
- GET /api/products - Lấy tất cả products
- GET /api/products/{id} - Lấy product theo ID
- POST /api/products - Tạo product mới
- PUT /api/products/{id} - Update product
- DELETE /api/products/{id} - Xóa product

---

### 4. Order Service - PORT 8083

```powershell
# Terminal 4
cd C:\Study\CNPM\Food-fast-delivery\order-service
mvn clean install
mvn spring-boot:run
```

Đợi thấy:
```
Started OrderServiceApplication on port 8083
```

Endpoints:
- POST /api/orders - Tạo order mới
- GET /api/orders - Lấy tất cả orders
- GET /api/orders/{id} - Lấy order theo ID
- GET /api/orders/my-orders - Orders của user hiện tại
- PUT /api/orders/{id}/status - Update status

---

### 5. Payment Service - PORT 8084

```powershell
# Terminal 5
cd C:\Study\CNPM\Food-fast-delivery\payment-service
mvn clean install
mvn spring-boot:run
```

Đợi thấy:
```
Started PaymentServiceApplication on port 8084
```

Endpoints:
- POST /api/payments - Tạo payment
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
npm start
```

Đợi thấy:
```
webpack compiled successfully
```

Frontend URL: http://localhost:3000

---

## Kiểm tra Services

### 1. Eureka Dashboard
Truy cập: http://localhost:8761

Bạn sẽ thấy tất cả services đã register:
- USER-SERVICE
- PRODUCT-SERVICE
- ORDER-SERVICE
- PAYMENT-SERVICE
- API-GATEWAY

### 2. Test API với Postman hoặc cURL

#### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "phone": "0123456789"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "USER"
  }
}
```

#### Get Products (No auth required)
```bash
curl http://localhost:8080/api/products
```

#### Get Profile (Auth required)
```bash
curl http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Troubleshooting

### Port already in use
```powershell
# Kiểm tra port đang dùng
netstat -ano | findstr :8080

# Kill process
taskkill /PID <PID> /F
```

### MySQL Connection Error
```
# Kiểm tra MySQL đang chạy
Get-Service -Name MySQL*

# Start MySQL service
Start-Service MySQL80

# Kiểm tra kết nối
mysql -u root -p
```

### Eureka không thấy services
- Đợi 30 giây sau khi start service
- Refresh Eureka dashboard (F5)
- Kiểm tra log của service có lỗi không

### Gradle không tìm thấy
```powershell
# Dùng gradlew (Gradle Wrapper)
cd api-gateway
./gradlew bootRun

# Hoặc cài Gradle
# Download từ https://gradle.org/releases/
# Thêm vào PATH
```

### Maven build failed
```powershell
# Clean và rebuild
mvn clean install -DskipTests

# Update dependencies
mvn clean install -U
```

---

## Scripts tự động (Optional)

### Start All Services (PowerShell Script)

Tạo file `start-all.ps1`:

```powershell
# Start Eureka
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Study\CNPM\Food-fast-delivery\eureka-service; mvn spring-boot:run"

# Đợi Eureka khởi động
Start-Sleep -Seconds 30

# Start User Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Study\CNPM\Food-fast-delivery\user-service; mvn spring-boot:run"

# Start Product Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Study\CNPM\Food-fast-delivery\product-service; mvn spring-boot:run"

# Start Order Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Study\CNPM\Food-fast-delivery\order-service; mvn spring-boot:run"

# Start Payment Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Study\CNPM\Food-fast-delivery\payment-service; mvn spring-boot:run"

# Đợi services khởi động
Start-Sleep -Seconds 30

# Start API Gateway
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Study\CNPM\Food-fast-delivery\api-gateway; ./gradlew bootRun"

# Start Frontend
Start-Sleep -Seconds 20
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Study\CNPM\Food-fast-delivery\Front_end\foodfast-app; npm start"

Write-Host "All services started!"
Write-Host "Eureka: http://localhost:8761"
Write-Host "API Gateway: http://localhost:8080"
Write-Host "Frontend: http://localhost:3000"
```

Chạy:
```powershell
.\start-all.ps1
```

---

## Monitoring

### 1. Logs
Mỗi service sẽ in logs ra console. Chú ý:
- `ERROR` - Lỗi nghiêm trọng
- `WARN` - Cảnh báo
- `INFO` - Thông tin bình thường

### 2. Health Check
```bash
# User Service
curl http://localhost:8081/actuator/health

# Product Service
curl http://localhost:8082/actuator/health

# Order Service
curl http://localhost:8083/actuator/health

# Payment Service
curl http://localhost:8084/actuator/health
```

### 3. Eureka Dashboard
http://localhost:8761 - Xem status tất cả services

---

## Next Steps

1. ✅ Start all backend services
2. ✅ Verify Eureka Dashboard
3. ✅ Test APIs with Postman
4. ✅ Start Frontend
5. ✅ Test full user flow:
   - Register → Login → Browse Products → Add to Cart → Checkout → Payment
6. ✅ Test Admin features:
   - Login as admin → Manage users/orders/products/restaurants

Chúc may mắn! 🚀
