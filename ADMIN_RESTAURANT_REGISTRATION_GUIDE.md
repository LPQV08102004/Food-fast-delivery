# Hướng Dẫn Đăng Ký Nhà Hàng Cho Admin

## Tổng Quan

Tính năng này cho phép Admin đăng ký tài khoản cho nhà hàng, bao gồm việc tạo:
1. **Tài khoản user** với role `RESTAURANT`
2. **Thông tin nhà hàng** được liên kết với tài khoản user thông qua `userId`

## Luồng Nghiệp Vụ

### 1. Admin Mở Form Đăng Ký Nhà Hàng

Admin có 2 cách để mở form đăng ký:

**Cách 1:** Click nút "Add Restaurant" trên trang Restaurant List
- Vào menu: **Restaurant > List Restaurant**
- Click nút **"Add Restaurant"** ở góc trên bên phải

**Cách 2:** Chọn "Register Restaurant" từ menu
- Vào menu: **Restaurant > Register Restaurant**
- Dialog đăng ký sẽ tự động mở

### 2. Nhập Thông Tin Tài Khoản User

Dialog đăng ký được chia thành 2 phần chính:

#### Phần 1: User Account Information (Bắt buộc)

| Trường | Bắt buộc | Mô tả |
|--------|----------|-------|
| **Username** | ✅ | Tên đăng nhập cho chủ nhà hàng |
| **Email** | ✅ | Email đăng nhập |
| **Password** | ✅ | Mật khẩu (tối thiểu 6 ký tự) |
| **Phone Number** | ❌ | Số điện thoại liên hệ |
| **Account Status** | ✅ | Active/Inactive (mặc định: Active) |
| **Role** | ✅ | Tự động set là RESTAURANT (không thể thay đổi) |

#### Phần 2: Restaurant Information

| Trường | Bắt buộc | Mô tả |
|--------|----------|-------|
| **Restaurant Name** | ✅ | Tên nhà hàng |
| **Address** | ✅ | Địa chỉ đầy đủ của nhà hàng |
| **Contact Number** | ❌ | Số liên hệ riêng của nhà hàng (nếu không nhập sẽ dùng phone từ user) |
| **Cuisine Type** | ❌ | Loại ẩm thực (VD: Italian, Vietnamese, Chinese) |
| **Description** | ❌ | Mô tả về nhà hàng |

### 3. Xác Thực Dữ Liệu

Hệ thống sẽ kiểm tra:
- ✅ Username, Email, Password đã nhập
- ✅ Restaurant Name và Address đã nhập
- ✅ Password có ít nhất 6 ký tự
- ✅ Email đúng định dạng

### 4. Quy Trình Đăng Ký (2 Bước)

```
BƯỚC 1: Tạo User Account
POST /api/auth/register
Body: {
  username: string,
  email: string,
  password: string,
  phone: string,
  role: "RESTAURANT",
  status: "Active"
}
Response: {
  id: number,
  username: string,
  email: string,
  role: "RESTAURANT"
}

↓

BƯỚC 2: Tạo Restaurant với userId mapping
POST /api/restaurants
Body: {
  name: string,
  address: string,
  contact: string,
  description: string,
  cuisineType: string,
  userId: number,  ← Link tới user account
  status: "Active"
}
Response: {
  id: number,
  name: string,
  userId: number,
  ...
}
```

### 5. Kết Quả

Sau khi đăng ký thành công:
- ✅ Tài khoản user với role RESTAURANT được tạo trong bảng `users`
- ✅ Thông tin nhà hàng được tạo trong bảng `restaurants` với `userId` ánh xạ đến tài khoản
- ✅ Nhà hàng xuất hiện trong danh sách Restaurant List
- ✅ Chủ nhà hàng có thể đăng nhập bằng username/email và password đã tạo

## Cấu Trúc Dữ Liệu

### User Table
```sql
{
  id: number,
  username: string,
  email: string,
  password: string (encrypted),
  phone: string,
  role: "RESTAURANT",
  status: "Active" | "Inactive",
  createdAt: timestamp
}
```

### Restaurant Table
```sql
{
  id: number,
  name: string,
  address: string,
  contact: string,
  description: string,
  cuisineType: string,
  userId: number,  ← Foreign Key to users.id
  status: "Active" | "Inactive",
  createdAt: timestamp
}
```

## API Endpoints

### 1. Tạo User Account
```
POST /api/auth/register
Authorization: Admin Token
Content-Type: application/json

Body:
{
  "username": "restaurant_owner1",
  "email": "owner@restaurant.com",
  "password": "secure123",
  "phone": "0123456789",
  "role": "RESTAURANT",
  "status": "Active"
}
```

### 2. Tạo Restaurant
```
POST /api/restaurants
Authorization: Admin Token
Content-Type: application/json

Body:
{
  "name": "Nhà Hàng ABC",
  "address": "123 Đường XYZ, Quận 1, TP.HCM",
  "contact": "0123456789",
  "description": "Nhà hàng phục vụ món Việt truyền thống",
  "cuisineType": "Vietnamese",
  "userId": 123,
  "status": "Active"
}
```

### 3. Lấy Danh Sách Restaurants
```
GET /api/restaurants
Authorization: Admin Token
```

## Code Implementation

### Frontend: AdminPage.js

#### State Management
```javascript
const [newRestaurant, setNewRestaurant] = useState({
  // User information
  username: '',
  email: '',
  password: '',
  phone: '',
  role: 'RESTAURANT',
  status: 'Active',
  // Restaurant information
  restaurantName: '',
  address: '',
  contact: '',
  description: '',
  cuisineType: ''
});
```

#### Handler Function
```javascript
const handleRegisterRestaurant = async () => {
  // Step 1: Create user account
  const userResponse = await adminService.createUser({
    username: newRestaurant.username,
    email: newRestaurant.email,
    password: newRestaurant.password,
    phone: newRestaurant.phone,
    role: 'RESTAURANT',
    status: newRestaurant.status
  });

  // Step 2: Create restaurant with userId
  const restaurantResponse = await adminService.createRestaurant({
    name: newRestaurant.restaurantName,
    address: newRestaurant.address,
    contact: newRestaurant.contact || newRestaurant.phone,
    description: newRestaurant.description,
    cuisineType: newRestaurant.cuisineType,
    userId: userResponse.id,
    status: 'Active'
  });
};
```

### Backend Requirements

#### User Service
- Endpoint: `POST /auth/register`
- Phải hỗ trợ role `RESTAURANT`
- Trả về `id` hoặc `userId` sau khi tạo thành công

#### Product Service (Restaurant Management)
- Endpoint: `POST /restaurants`
- Phải có trường `userId` để ánh xạ
- Endpoint: `GET /restaurants`
- Endpoint: `PUT /restaurants/{id}`
- Endpoint: `DELETE /restaurants/{id}`

## Lưu Ý Quan Trọng

### 1. **UserID Mapping**
- Khi tạo restaurant, **BẮT BUỘC** phải có `userId`
- `userId` là foreign key tham chiếu đến `users.id`
- Mỗi restaurant phải được liên kết với một user account duy nhất

### 2. **Role RESTAURANT**
- User được tạo phải có role là `RESTAURANT`
- Role này cho phép chủ nhà hàng:
  - Đăng nhập vào hệ thống
  - Quản lý sản phẩm của nhà hàng
  - Xem và xử lý đơn hàng

### 3. **Validation**
- Username và Email phải unique
- Password tối thiểu 6 ký tự
- Restaurant name và address là bắt buộc

### 4. **Error Handling**
- Nếu tạo user thành công nhưng tạo restaurant thất bại:
  - Cần rollback user account
  - Hoặc hiển thị lỗi rõ ràng cho admin

### 5. **Security**
- Password phải được mã hóa trước khi lưu
- Admin token phải được xác thực cho cả 2 API calls

## Testing Guide

### Test Case 1: Đăng Ký Thành Công
1. Login với tài khoản Admin
2. Vào Restaurant > List Restaurant
3. Click "Add Restaurant"
4. Nhập đầy đủ thông tin:
   - Username: `test_restaurant1`
   - Email: `test@restaurant.com`
   - Password: `test123`
   - Phone: `0123456789`
   - Restaurant Name: `Test Restaurant`
   - Address: `123 Test Street`
5. Click "Register Restaurant"
6. Kiểm tra:
   - ✅ Thông báo thành công
   - ✅ Restaurant xuất hiện trong danh sách
   - ✅ Có thể đăng nhập bằng account mới tạo

### Test Case 2: Validation Errors
1. Bỏ trống Username → Hiển thị lỗi
2. Password < 6 ký tự → Hiển thị lỗi
3. Bỏ trống Restaurant Name → Hiển thị lỗi
4. Email sai định dạng → Hiển thị lỗi

### Test Case 3: Duplicate Check
1. Tạo restaurant với username đã tồn tại → Hiển thị lỗi
2. Tạo restaurant với email đã tồn tại → Hiển thị lỗi

## Troubleshooting

### Lỗi: "Failed to register restaurant"
- Kiểm tra backend có hoạt động không
- Xem console log để biết chi tiết lỗi
- Kiểm tra admin token còn hiệu lực

### Lỗi: "User created but restaurant failed"
- User account đã được tạo trong database
- Cần xóa user account thủ công hoặc thử tạo restaurant lại
- Kiểm tra userId có được truyền đúng không

### Restaurant không hiển thị trong danh sách
- Refresh lại trang
- Kiểm tra database xem restaurant đã được tạo chưa
- Kiểm tra API `GET /restaurants` có trả về dữ liệu không

## Cải Tiến Tương Lai

1. **Transaction Support**: Đảm bảo cả user và restaurant được tạo hoặc rollback nếu có lỗi
2. **Email Verification**: Gửi email xác nhận cho chủ nhà hàng
3. **Bulk Import**: Cho phép import nhiều restaurants từ file CSV/Excel
4. **Advanced Validation**: Kiểm tra địa chỉ hợp lệ, số điện thoại đúng định dạng
5. **Image Upload**: Cho phép upload logo và ảnh nhà hàng
6. **Auto-generate Password**: Tự động tạo password và gửi email cho chủ nhà hàng

---

**Phiên bản:** 1.0  
**Ngày cập nhật:** 24/11/2025  
**Tác giả:** Development Team
