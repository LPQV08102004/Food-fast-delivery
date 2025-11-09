# User Service - Admin & User Management Guide

## 📋 Tổng quan

User service ĐÃ ĐƯỢC CẬP NHẬT ĐẦY ĐỦ với các chức năng:

✅ **JWT Token với Role Information**
- Token bao gồm: role, userId, email, username
- Methods để extract role từ token
- Method `isAdmin()` để kiểm tra quyền admin

✅ **User & Admin Login**
- Register tự động tạo role USER
- Login trả về token có chứa role
- Frontend có thể phân biệt admin/user từ token

✅ **User Management APIs**
- CRUD operations cho users
- Toggle user status (Active/Inactive)
- Admin có thể quản lý tất cả users

## 🔐 Authentication Flow

### 1. Register (User thường)
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123",
  "email": "john@example.com",
  "fullName": "John Doe",
  "phone": "0123456789"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phone": "0123456789",
    "role": "USER",
    "status": "Active"
  }
}
```

### 2. Login (Admin hoặc User)
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Admin):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@foodfast.com",
    "fullName": "Administrator",
    "phone": "0123456789",
    "role": "ADMIN",
    "status": "Active"
  }
}
```

### 3. Frontend Check Role
```javascript
import authService from './services/authService';

// Sau khi login thành công
const response = await authService.login({ username, password });

// Check role từ response
if (response.user.role === 'ADMIN') {
  navigate('/admin');
} else {
  navigate('/products');
}

// Hoặc decode từ token
const user = authService.getCurrentUser();
console.log(user.role); // "ADMIN" hoặc "USER"
```

## 📡 User Management APIs

### Get All Users (Admin only)
```http
GET /api/users
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@foodfast.com",
    "fullName": "Administrator",
    "phone": "0123456789",
    "role": "ADMIN",
    "status": "Active"
  },
  {
    "id": 2,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phone": "0987654321",
    "role": "USER",
    "status": "Active"
  }
]
```

### Get User by ID
```http
GET /api/users/{id}
Authorization: Bearer {token}
```

### Get Current User Profile
```http
GET /api/users/profile
Authorization: Bearer {token}
```

### Update Profile (Own profile)
```http
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "John Updated",
  "email": "newemail@example.com",
  "phone": "0111111111"
}
```

### Admin: Update User
```http
PUT /api/users/{id}
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "fullName": "Updated Name",
  "email": "updated@example.com",
  "phone": "0222222222",
  "status": "Active"
}
```

### Admin: Delete User
```http
DELETE /api/users/{id}
Authorization: Bearer {admin-token}
```

### Admin: Toggle User Status
```http
PUT /api/users/{id}/status
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "status": "Inactive"
}
```

## 🗄️ Database Setup

### 1. Run SQL Script
```bash
# Kết nối MySQL
mysql -u root -p

# Chọn database
USE user_service;

# Run script
source C:\Study\CNPM\Food-fast-delivery\user-service\setup_user_db.sql
```

### 2. Default Accounts

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Role: `ADMIN`

**User Account:**
- Username: `user`
- Password: `user123`
- Role: `USER`

## 🔒 JWT Token Structure

Token chứa các claims:
```json
{
  "sub": "admin",
  "role": "ADMIN",
  "userId": 1,
  "email": "admin@foodfast.com",
  "iat": 1699430400,
  "exp": 1699516800
}
```

## 🎯 Frontend Integration

### authService.js đã được cập nhật
```javascript
// Login và lưu user info
const response = await authService.login({ username, password });

// Token tự động lưu vào localStorage
// User info cũng được lưu vào localStorage

// Check if admin
const user = authService.getCurrentUser();
const isAdmin = user?.role === 'ADMIN';

// Redirect based on role
if (isAdmin) {
  navigate('/admin');
} else {
  navigate('/home');
}
```

### Protected Routes
```javascript
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

// Admin Route Guard
export const AdminRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

// User Route Guard
export const UserRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

### Usage in App.js
```javascript
import { AdminRoute, UserRoute } from './components/ProtectedRoute';

<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  {/* User routes */}
  <Route path="/home" element={
    <UserRoute>
      <HomePage />
    </UserRoute>
  } />
  
  {/* Admin routes */}
  <Route path="/admin" element={
    <AdminRoute>
      <AdminPage />
    </AdminRoute>
  } />
</Routes>
```

## 🔧 Backend Configuration

### application.properties
```properties
# JWT Configuration
jwt.secret=YourSecretKeyHereShouldBeAtLeast256BitsLong12345678901234567890
jwt.expiration=86400000

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/user_service
spring.datasource.username=root
spring.datasource.password=08102004
spring.jpa.hibernate.ddl-auto=update
```

## 📝 Testing

### Test Admin Login
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Test Get All Users (với admin token)
```bash
curl -X GET http://localhost:8081/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Test User Login
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user",
    "password": "user123"
  }'
```

## ⚠️ Security Notes

1. **Admin Endpoints** cần được protect bằng security config (sẽ implement tiếp)
2. **Password Encoding**: Sử dụng BCrypt
3. **Token Expiration**: Mặc định 24 giờ (có thể config)
4. **Status Check**: User có status "Inactive" không được phép login

## 🚀 Next Steps

1. ✅ JWT với role - DONE
2. ✅ User CRUD APIs - DONE
3. ✅ Admin management - DONE
4. 🔄 Security Config để protect admin endpoints
5. 🔄 Refresh token mechanism
6. 🔄 Password reset functionality

## 📞 Support

Nếu gặp vấn đề:
1. Check database đã setup đúng
2. Check JWT secret trong application.properties
3. Check token format: "Bearer {token}"
4. Check role trong token: decode tại jwt.io
-- Setup database cho User Service với roles và admin user

-- Tạo bảng roles
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Tạo bảng users
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Active',
    role_id BIGINT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Insert roles mặc định
INSERT INTO roles (id, name) VALUES 
(1, 'USER'),
(2, 'ADMIN')
ON DUPLICATE KEY UPDATE name = name;

-- Insert admin user mặc định
-- Password: admin123 (đã được encode bằng BCrypt)
INSERT INTO users (username, password, email, full_name, phone, status, role_id) 
VALUES (
    'admin',
    '$2a$10$XptfskLsT1l/bRTLRiiCgejHqOpgXFreUnNUa35gJdCr2v2QbVFzu',
    'admin@foodfast.com',
    'Administrator',
    '0123456789',
    'Active',
    2
)
ON DUPLICATE KEY UPDATE username = username;

-- Insert một user thường để test
-- Password: user123
INSERT INTO users (username, password, email, full_name, phone, status, role_id) 
VALUES (
    'user',
    '$2a$10$5Z7uKqLU9h4nGmKhjXfvAe7/.rKjF/WvYPPBZqmvEDnN/Xn4Xj.hW',
    'user@foodfast.com',
    'Regular User',
    '0987654321',
    'Active',
    1
)
ON DUPLICATE KEY UPDATE username = username;

-- Kiểm tra dữ liệu
SELECT u.id, u.username, u.email, u.full_name, r.name as role, u.status 
FROM users u 
JOIN roles r ON u.role_id = r.id;

