# Hướng dẫn sửa lỗi Load Orders cho User

## Vấn đề
Khi gọi `/api/orders/my-orders`, server trả về lỗi **400 Bad Request**.

## Nguyên nhân
1. API Gateway JWT Filter chưa extract `userId` từ token đúng cách
2. Header `X-User-Id` không được gửi đến Order Service
3. Order Controller yêu cầu header bắt buộc nhưng không nhận được

## Các sửa đổi đã thực hiện

### 1. Order Service - OrderController.java
```java
@GetMapping("/my-orders")
public ResponseEntity<List<OrderResponse>> getMyOrders(
        @RequestHeader(value = "X-User-Id", required = false) Long userId) {
    if (userId == null) {
        return ResponseEntity.badRequest().build();
    }
    return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
}
```
✅ Đổi `required=false` và thêm validation

### 2. API Gateway - JwtAuthenticationFilter.java
```java
// Parse JWT token using new API (JJWT 0.11.5)
Claims claims = Jwts.parser()
        .verifyWith(getSigningKey())
        .build()
        .parseSignedClaims(token)
        .getPayload();

// Extract userId - handle both Integer and Long
Object userIdObj = claims.get("userId");
String userId = null;

if (userIdObj instanceof Integer) {
    userId = String.valueOf((Integer) userIdObj);
} else if (userIdObj instanceof Long) {
    userId = String.valueOf((Long) userIdObj);
} else if (userIdObj != null) {
    userId = userIdObj.toString();
}

// Add header
ServerWebExchange modifiedExchange = exchange.mutate()
        .request(r -> r.header("X-User-Id", userId))
        .build();
```
✅ Cập nhật để sử dụng JJWT API mới
✅ Xử lý cả Integer và Long cho userId
✅ Thêm logging để debug

## Cách rebuild và test

### Bước 1: Rebuild các service
```bash
# Chạy script tự động
rebuild-order-fix.bat

# HOẶC rebuild thủ công:

# Build Order Service
cd order-service
gradlew.bat clean build -x test

# Build API Gateway  
cd ..\api-gateway
gradlew.bat clean build -x test

# Build Frontend
cd ..\Front_end\foodfast-app
npm run build
```

### Bước 2: Restart Docker
```bash
# Stop tất cả containers
docker-compose down

# Rebuild và start lại
docker-compose up --build -d

# Xem logs để debug
docker-compose logs -f api-gateway
docker-compose logs -f order-service
```

### Bước 3: Test chức năng
1. Mở trình duyệt và vào http://localhost:3000
2. Đăng nhập với user A
3. Tạo vài đơn hàng
4. Vào trang "My Orders" → Xem có hiển thị đơn hàng không
5. Mở DevTools (F12) → Console để xem lỗi (nếu có)
6. Đăng xuất và đăng nhập với user B
7. Kiểm tra "My Orders" → Chỉ thấy đơn hàng của user B

### Bước 4: Debug nếu vẫn lỗi

#### Kiểm tra JWT token trong browser
```javascript
// Mở Console (F12) và chạy:
const token = localStorage.getItem('token');
console.log('Token:', token);

// Decode token (không verify)
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token payload:', payload);
// Phải thấy: { userId: <number>, email: "...", role: "...", ... }
```

#### Xem logs API Gateway
```bash
docker logs api-gateway-container-name 2>&1 | findstr "JWT"
```
Phải thấy: `JWT Filter: Added X-User-Id header: <userId>`

#### Xem logs Order Service
```bash
docker logs order-service-container-name
```

#### Test API trực tiếp với Postman/curl
```bash
# Get token từ login
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"password\":\"password123\"}"

# Gọi my-orders với token
curl -X GET http://localhost:8080/api/orders/my-orders ^
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

## Lưu ý quan trọng

### JWT Secret phải khớp
- User Service: `mySecretKeyForJWTTokenGenerationAndValidation12345`
- API Gateway: `mySecretKeyForJWTTokenGenerationAndValidation12345`
- Đã được cấu hình trong `application.properties`

### JWT Token structure
Token phải chứa:
```json
{
  "sub": "username",
  "userId": 123,
  "email": "user@example.com",
  "role": "USER",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### CORS Configuration
API Gateway đã cho phép:
- Origin: http://localhost:3000
- Headers: Authorization, Content-Type
- Methods: GET, POST, PUT, DELETE

## Troubleshooting phổ biến

| Lỗi | Nguyên nhân | Giải pháp |
|-----|------------|-----------|
| 400 Bad Request | Header X-User-Id null | Kiểm tra JWT filter logs |
| 401 Unauthorized | Token invalid/expired | Login lại để lấy token mới |
| 403 Forbidden | Không có quyền | Kiểm tra role trong token |
| 404 Not Found | Endpoint sai | Đảm bảo gọi `/my-orders` |
| 500 Server Error | Database/service lỗi | Xem logs chi tiết |

## Flow hoạt động đầy đủ

```
Frontend                 API Gateway              Order Service
   |                          |                         |
   |-- GET /my-orders ------->|                         |
   |   (Bearer token)         |                         |
   |                          |                         |
   |                    [JWT Filter]                    |
   |                    - Parse token                   |
   |                    - Extract userId                |
   |                    - Add X-User-Id header          |
   |                          |                         |
   |                          |-- GET /my-orders ------>|
   |                          |   (X-User-Id: 123)      |
   |                          |                         |
   |                          |              [OrderController]
   |                          |              - Read X-User-Id
   |                          |              - Query DB by userId
   |                          |                         |
   |                          |<--- Orders list --------|
   |<--- Orders list ---------|                         |
```

## Kết luận
Sau khi rebuild và restart Docker, chức năng "My Orders" sẽ chỉ hiển thị đơn hàng của người dùng hiện tại đang đăng nhập.
@echo off
echo ========================================
echo Rebuilding Services for Order Fix
echo ========================================

echo.
echo [1/3] Building Order Service...
cd order-service
call gradlew.bat clean build -x test
if errorlevel 1 (
    echo ERROR: Order Service build failed!
    pause
    exit /b 1
)
echo Order Service build SUCCESS!

echo.
echo [2/3] Building API Gateway...
cd ..\api-gateway
call gradlew.bat clean build -x test
if errorlevel 1 (
    echo ERROR: API Gateway build failed!
    pause
    exit /b 1
)
echo API Gateway build SUCCESS!

echo.
echo [3/3] Building Frontend...
cd ..\Front_end\foodfast-app
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo Frontend build SUCCESS!

cd ..\..
echo.
echo ========================================
echo All services built successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Stop Docker: docker-compose down
echo 2. Rebuild Docker: docker-compose up --build -d
echo.
pause

