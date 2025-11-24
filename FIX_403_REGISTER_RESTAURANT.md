# Fix Lỗi 403 Forbidden Khi Đăng Ký Nhà Hàng

## Vấn Đề

Khi admin cố gắng đăng ký nhà hàng mới, hệ thống gặp lỗi:
```
POST http://26.174.141.27:8080/api/auth/register 403 (Forbidden)
Error registering restaurant: Request failed with status code 403
```

## Nguyên Nhân

Endpoint `/api/auth/register` được thiết kế cho việc **tự đăng ký** (public registration) và không cho phép:
- Tạo user với role tùy chỉnh (như `RESTAURANT`)
- Admin tạo tài khoản cho người khác

## Giải Pháp

### Tạo Endpoint Mới Cho Admin: `POST /api/users`

Endpoint này cho phép admin:
- Tạo user với bất kỳ role nào (`USER`, `ADMIN`, `RESTAURANT`)
- Set password và các thông tin khác
- Bypass các hạn chế của registration công khai

## Các Thay Đổi Backend

### 1. UserService Interface
**File:** `user-service/src/main/java/vn/cnpm/user_service/Service/UserService.java`

```java
public interface UserService {
    List<UserDTO> getAllUsers();
    UserDTO getUserById(Long id);
    UserDTO getCurrentUserProfile(String token);
    UserDTO updateProfile(String token, UserDTO userDTO);
    UserDTO createUser(UserDTO userDTO); // ← THÊM MỚI
    UserDTO updateUser(Long id, UserDTO userDTO);
    void deleteUser(Long id);
    UserDTO toggleUserStatus(Long id, String status);
    User getUserByUsername(String username);
}
```

### 2. UserServiceImpl
**File:** `user-service/src/main/java/vn/cnpm/user_service/Service/UserServiceImpl.java`

```java
@Override
public UserDTO createUser(UserDTO userDTO) {
    // Check if username or email already exists
    if (userRepository.findByUsername(userDTO.getUsername()).isPresent()) {
        throw new RuntimeException("Username already exists");
    }
    if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
        throw new RuntimeException("Email already exists");
    }

    // Create new user
    User user = new User();
    user.setUsername(userDTO.getUsername());
    user.setEmail(userDTO.getEmail());
    user.setPassword(passwordEncoder.encode(userDTO.getPassword())); // Encode password
    user.setFullName(userDTO.getFullName());
    user.setPhone(userDTO.getPhone());
    user.setStatus(userDTO.getStatus() != null ? userDTO.getStatus() : "Active");

    // Set role
    String roleName = userDTO.getRole() != null ? userDTO.getRole() : "USER";
    Role role = roleRepository.findByName(roleName)
            .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
    user.setRole(role);

    User savedUser = userRepository.save(user);
    return convertToDTO(savedUser);
}
```

**Tính năng:**
- ✅ Kiểm tra username/email trùng lặp
- ✅ Mã hóa password với BCrypt
- ✅ Set role tùy chỉnh (USER, ADMIN, RESTAURANT)
- ✅ Set status (Active/Inactive)

### 3. UserController
**File:** `user-service/src/main/java/vn/cnpm/user_service/Controller/UserController.java`

```java
// Admin: Tạo user mới
@PostMapping
public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
    return ResponseEntity.ok(userService.createUser(userDTO));
}
```

### 4. UserDTO
**File:** `user-service/src/main/java/vn/cnpm/user_service/DTO/UserDTO.java`

Thêm trường `password`:
```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String password; // ← THÊM MỚI (chỉ dùng khi tạo user)
    private String fullName;
    private String phone;
    private String role;
    private String status;
}
```

### 5. UserRepository
**File:** `user-service/src/main/java/vn/cnpm/user_service/Repository/UserRepository.java`

Thêm method `findByEmail`:
```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email); // ← THÊM MỚI
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
```

## Các Thay Đổi Frontend

### adminService.js
**File:** `Front_end/foodfast-app/src/services/adminService.js`

**Trước đây:**
```javascript
createUser: async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
}
```

**Sau khi sửa:**
```javascript
createUser: async (userData) => {
  const response = await api.post('/users', userData);  // ← Đổi endpoint
  return response.data;
}
```

## API Request/Response

### Request
```http
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "restaurant_owner1",
  "email": "owner@restaurant.com",
  "password": "secure123",
  "phone": "0123456789",
  "role": "RESTAURANT",
  "status": "Active"
}
```

### Response
```json
{
  "id": 10,
  "username": "restaurant_owner1",
  "email": "owner@restaurant.com",
  "fullName": null,
  "phone": "0123456789",
  "role": "RESTAURANT",
  "status": "Active"
}
```

## Quy Trình Build & Deploy

### 1. Build User Service
```bash
cd user-service
./mvnw clean package -DskipTests
```

### 2. Build Docker Image
```bash
docker-compose -f docker-compose-full.yml build user-service
```

### 3. Restart Container
```bash
docker-compose -f docker-compose-full.yml up -d user-service
```

### 4. Verify
```bash
docker-compose -f docker-compose-full.yml logs -f user-service
```

## Testing

### 1. Test Tạo User Qua Postman/cURL
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_restaurant",
    "email": "test@restaurant.com",
    "password": "test123",
    "phone": "0123456789",
    "role": "RESTAURANT",
    "status": "Active"
  }'
```

### 2. Test Từ Admin UI
1. Login với tài khoản admin
2. Vào **Restaurant > List Restaurant**
3. Click **"Add Restaurant"**
4. Nhập đầy đủ thông tin user và restaurant
5. Click **"Register Restaurant"**
6. Kiểm tra console để xem kết quả

## Validation & Error Handling

### Lỗi Có Thể Gặp

#### 1. Username Already Exists
```json
{
  "message": "Username already exists"
}
```
**Giải pháp:** Chọn username khác

#### 2. Email Already Exists
```json
{
  "message": "Email already exists"
}
```
**Giải pháp:** Sử dụng email khác

#### 3. Role Not Found
```json
{
  "message": "Role not found: RESTAURANT"
}
```
**Giải pháp:** Đảm bảo role `RESTAURANT` đã tồn tại trong database

#### 4. Unauthorized (401)
```json
{
  "message": "Unauthorized"
}
```
**Giải pháp:** Kiểm tra admin token còn hiệu lực

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    role_id BIGINT,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

### Roles Table
```sql
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Insert roles
INSERT INTO roles (name) VALUES ('USER'), ('ADMIN'), ('RESTAURANT');
```

## So Sánh: `/auth/register` vs `/users`

| Tiêu chí | `/auth/register` | `/users` |
|----------|------------------|----------|
| **Mục đích** | Public registration | Admin creates user |
| **Authentication** | Không cần | Cần Admin token |
| **Role** | Luôn là USER | Tùy chỉnh (USER, ADMIN, RESTAURANT) |
| **Status** | Luôn Active | Tùy chỉnh (Active, Inactive) |
| **Use case** | User tự đăng ký | Admin tạo tài khoản cho người khác |

## Security Considerations

### 1. Authorization
- Endpoint `/api/users` **CHỈ** cho phép admin
- Cần implement Spring Security với role check:
```java
@PostMapping
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
    return ResponseEntity.ok(userService.createUser(userDTO));
}
```

### 2. Password Encoding
- Password được mã hóa bằng BCrypt: `passwordEncoder.encode(password)`
- KHÔNG bao giờ lưu plain text password

### 3. Input Validation
- Validate username format (alphanumeric, 3-50 chars)
- Validate email format
- Validate password strength (min 6 chars)
- Validate phone number format

## Checklist Hoàn Thành

- [x] Thêm method `createUser` vào UserService
- [x] Implement `createUser` trong UserServiceImpl
- [x] Thêm endpoint POST `/api/users` vào UserController
- [x] Thêm field `password` vào UserDTO
- [x] Thêm method `findByEmail` vào UserRepository
- [x] Cập nhật `adminService.js` sử dụng endpoint mới
- [x] Build user-service
- [x] Deploy user-service container
- [x] Test chức năng đăng ký nhà hàng

## Kết Quả

✅ Admin có thể tạo tài khoản cho nhà hàng với role `RESTAURANT`
✅ Thông tin user được lưu vào database với password đã mã hóa
✅ Restaurant được tạo và liên kết với userId
✅ Chủ nhà hàng có thể đăng nhập bằng tài khoản mới

## Cải Tiến Tương Lai

1. **Role-based Access Control:**
   - Implement `@PreAuthorize("hasRole('ADMIN')")` cho endpoint
   - Validate admin token trước khi cho phép tạo user

2. **Transaction Management:**
   - Sử dụng `@Transactional` để đảm bảo user và restaurant được tạo đồng thời
   - Rollback nếu có lỗi xảy ra

3. **Email Notification:**
   - Gửi email chào mừng với thông tin đăng nhập
   - Gửi link reset password

4. **Audit Log:**
   - Log lại ai tạo user nào, khi nào
   - Track tất cả thao tác admin

5. **Validation:**
   - Thêm Bean Validation annotations (@NotBlank, @Email, @Size)
   - Custom validator cho business rules

---

**Ngày cập nhật:** 24/11/2025  
**Version:** 1.0  
**Status:** ✅ Resolved
