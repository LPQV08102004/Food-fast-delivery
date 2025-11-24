# Hướng Dẫn Admin Đăng Ký Tài Khoản Nhà Hàng

## Tổng Quan Nghiệp Vụ

Khi admin đăng ký tài khoản cho nhà hàng:
1. **Tạo tài khoản user** với role RESTAURANT trong bảng `users`
2. **Tạo thông tin nhà hàng** trong bảng `restaurants` với userId mapping

## API Endpoint

### 1. Admin Tạo Tài Khoản User (Nhà Hàng)

**Endpoint:** `POST /api/users`

**Authentication:** Yêu cầu JWT token với role ADMIN

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
    "username": "nha_hang_abc",
    "email": "nhahangabc@example.com",
    "password": "matkhau123",
    "phone": "0909123456",
    "role": "RESTAURANT",
    "status": "Active"
}
```

**Response (Success - 200):**
```json
{
    "id": 12,
    "username": "nha_hang_abc",
    "email": "nhahangabc@example.com",
    "password": "",
    "fullName": "nha_hang_abc",
    "phone": "0909123456",
    "role": "RESTAURANT",
    "status": "Active"
}
```

**Lưu ý:**
- Field `fullName` sẽ tự động được set = `username` nếu không cung cấp
- Password sẽ được mã hóa bằng BCrypt trước khi lưu
- Chỉ admin mới có quyền gọi endpoint này

### 2. Tạo Thông Tin Nhà Hàng

**Endpoint:** `POST /api/restaurants`

**Request Body:**
```json
{
    "name": "Nhà Hàng ABC",
    "address": "123 Đường XYZ, Quận 1",
    "phone": "0909123456",
    "userId": 12,
    "status": "Active"
}
```

## Testing với Postman

### Bước 1: Login Admin

**Request:**
```
POST http://26.174.141.27:8080/api/auth/login

Body (JSON):
{
    "username": "sa",
    "password": "vonguoita3"
}
```

**Response:**
```json
{
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 6,
        "username": "sa",
        "role": "ADMIN"
    }
}
```

Copy token để sử dụng cho các request tiếp theo.

### Bước 2: Tạo Tài Khoản Nhà Hàng

**Request:**
```
POST http://26.174.141.27:8080/api/users

Headers:
- Content-Type: application/json
- Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

Body (JSON):
{
    "username": "nha_hang_test",
    "email": "nhahang@test.com",
    "password": "matkhau123",
    "phone": "0909123456",
    "role": "RESTAURANT",
    "status": "Active"
}
```

**Response (Success):**
```json
{
    "id": 12,
    "username": "nha_hang_test",
    "email": "nhahang@test.com",
    "fullName": "nha_hang_test",
    "phone": "0909123456",
    "role": "RESTAURANT",
    "status": "Active"
}
```

Lưu `id` để mapping với restaurant.

### Bước 3: Tạo Restaurant

**Request:**
```
POST http://26.174.141.27:8080/api/restaurants

Headers:
- Content-Type: application/json
- Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

Body (JSON):
{
    "name": "Nhà Hàng Test",
    "address": "123 Đường ABC",
    "phone": "0909123456",
    "userId": 12,
    "status": "Active"
}
```

## Testing với PowerShell

```powershell
# 1. Login và lấy admin token
$loginResponse = Invoke-RestMethod -Uri "http://26.174.141.27:8080/api/auth/login" -Method POST -Headers @{'Content-Type'='application/json'} -Body (@{username='sa'; password='vonguoita3'} | ConvertTo-Json)
$token = $loginResponse.token

# 2. Tạo tài khoản nhà hàng
$userResponse = Invoke-RestMethod -Uri "http://26.174.141.27:8080/api/users" -Method POST -Headers @{'Content-Type'='application/json'; 'Authorization'="Bearer $token"} -Body (@{
    username='nha_hang_test'
    email='nhahang@test.com'
    password='matkhau123'
    phone='0909123456'
    role='RESTAURANT'
    status='Active'
} | ConvertTo-Json)

Write-Host "User ID: $($userResponse.id)"

# 3. Tạo restaurant với userId mapping
$restaurantResponse = Invoke-RestMethod -Uri "http://26.174.141.27:8080/api/restaurants" -Method POST -Headers @{'Content-Type'='application/json'; 'Authorization'="Bearer $token"} -Body (@{
    name='Nhà Hàng Test'
    address='123 Đường ABC'
    phone='0909123456'
    userId=$userResponse.id
    status='Active'
} | ConvertTo-Json)

Write-Host "Restaurant ID: $($restaurantResponse.id)"
```

## Frontend Integration (React)

### adminService.js

```javascript
// Tạo user (tài khoản nhà hàng)
export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Tạo restaurant
export const createRestaurant = async (restaurantData) => {
  try {
    const response = await api.post('/restaurants', restaurantData);
    return response.data;
  } catch (error) {
    console.error('Error creating restaurant:', error);
    throw error;
  }
};
```

### AdminPage.js

```javascript
const handleRegisterRestaurant = async (formData) => {
  try {
    // 1. Tạo user account cho nhà hàng
    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: 'RESTAURANT',
      status: 'Active'
    };
    
    const userResponse = await adminService.createUser(userData);
    
    // 2. Tạo restaurant với userId mapping
    const restaurantData = {
      name: formData.restaurantName,
      address: formData.address,
      phone: formData.phone,
      userId: userResponse.id,
      status: 'Active'
    };
    
    const restaurantResponse = await adminService.createRestaurant(restaurantData);
    
    console.log('Restaurant created successfully:', restaurantResponse);
    // Refresh restaurant list
    fetchRestaurants();
    
  } catch (error) {
    console.error('Failed to register restaurant:', error);
    alert('Đăng ký nhà hàng thất bại!');
  }
};
```

## Kiểm Tra Trong Database

```sql
-- Kiểm tra user đã tạo
SELECT * FROM users WHERE role_id = 3; -- 3 = RESTAURANT

-- Kiểm tra restaurant với userId mapping
SELECT r.*, u.username, u.email 
FROM restaurants r 
JOIN users u ON r.userId = u.id 
WHERE u.role_id = 3;

-- Kiểm tra password đã được mã hóa
SELECT id, username, password, role_id FROM users WHERE username = 'nha_hang_test';
-- Password sẽ có dạng: $2a$10$... (BCrypt hash)
```

## Security

✅ **Đã triển khai:**
- JWT authentication với role-based access control
- Chỉ ADMIN có thể tạo user mới
- Password được mã hóa bằng BCrypt
- Kiểm tra duplicate username và email
- Session stateless với JWT

❌ **Bị chặn (403 Forbidden):**
- User với role USER không thể tạo user
- User với role RESTAURANT không thể tạo user
- Request không có token
- Request với token invalid hoặc expired

## Troubleshooting

### 1. Lỗi 403 Forbidden
**Nguyên nhân:** Token không hợp lệ hoặc user không phải admin
**Giải pháp:** Login lại với tài khoản admin (sa/vonguoita3)

### 2. Lỗi 400 Bad Request
**Nguyên nhân:** 
- Username đã tồn tại
- Email đã tồn tại
- Thiếu field bắt buộc

**Giải pháp:** Kiểm tra request body và đảm bảo username/email chưa được sử dụng

### 3. Lỗi 500 Internal Server Error
**Nguyên nhân:** 
- Role không tồn tại trong database
- Database connection issue

**Giải pháp:** Kiểm tra roles table có đầy đủ: ADMIN, USER, RESTAURANT

## Notes

1. **Auto-generate fullName:** Nếu không cung cấp `fullName`, system sẽ tự động set = `username`
2. **Password encoding:** Password được mã hóa tự động, không cần hash trước khi gửi
3. **userId mapping:** Restaurant phải có `userId` để map với user account
4. **Default status:** Nếu không cung cấp `status`, mặc định là "Active"

## API Ports

- **API Gateway:** http://26.174.141.27:8080
- **User Service (Direct):** http://localhost:8081
- **Product Service:** http://localhost:8082

Khuyến nghị sử dụng API Gateway để có logging và load balancing.
