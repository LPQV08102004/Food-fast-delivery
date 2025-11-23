# Hướng dẫn sử dụng tính năng thêm sản phẩm

## Tính năng mới đã thêm

### 1. **AddProductModal Component**
Modal form để thêm sản phẩm mới với các tính năng:
- Form validation đầy đủ
- Load danh mục tự động từ backend
- **Thêm nhiều ảnh sản phẩm bằng URL**
- **Preview ảnh đầu tiên**
- Hiển thị thông báo lỗi/thành công
- Loading state khi submit
- Responsive design

### 2. **Cập nhật ProductScreen**
- Nút "Add product" mở modal thêm sản phẩm
- Hiển thị empty state khi chưa có sản phẩm
- Tự động reload danh sách sau khi thêm thành công
- Phân biệt trường hợp: không có sản phẩm vs. không tìm thấy kết quả tìm kiếm

## Cách sử dụng

### Từ Restaurant Dashboard:

1. **Đăng nhập** với tài khoản Restaurant Owner
2. **Vào tab "Product"** trong sidebar
3. **Click nút "Add product"** hoặc "Thêm sản phẩm đầu tiên"
4. **Điền thông tin sản phẩm:**
   - Tên sản phẩm (bắt buộc)
   - Mô tả (tùy chọn)
   - Giá (bắt buộc, > 0)
   - Số lượng (bắt buộc, >= 0)
   - Danh mục (bắt buộc)
   - **URL ảnh sản phẩm (tùy chọn, có thể thêm nhiều ảnh)**
   - Trạng thái hoạt động (checkbox)
5. **Click "Thêm sản phẩm"**

## Dữ liệu gửi đi

```json
{
  "name": "Tên sản phẩm",
  "description": "Mô tả sản phẩm",
  "price": 50000,
  "stock": 100,
  "categoryId": 1,
  "restaurantId": 1,
  "isActive": true,
  "imageUrls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

## API Endpoint sử dụng

- **POST** `/api/products` - Tạo sản phẩm mới
- **GET** `/api/categories` - Lấy danh sách danh mục
- **GET** `/api/products/restaurant/{restaurantId}` - Lấy sản phẩm của restaurant

## Validation

### Frontend validation:
- ✅ Tên sản phẩm: Bắt buộc
- ✅ Giá: Bắt buộc, phải > 0
- ✅ Số lượng: Bắt buộc, phải >= 0
- ✅ Danh mục: Bắt buộc

### Backend validation:
- ProductRequest DTO validation trong Spring Boot
- Database constraints

## Error Handling

- **Không có danh mục**: Hiển thị thông báo "Chưa có danh mục nào"
- **Lỗi network**: Toast error "Không thể thêm sản phẩm"
- **Validation fail**: Toast error với message cụ thể
- **Success**: Toast success + reload danh sách + đóng modal

## Files đã tạo/sửa

### Tạo mới:
- `AddProductModal.js` - Component modal thêm sản phẩm

### Cập nhật:
- `ProductScreen.js` - Thêm state và logic cho modal
- `index.js` - Export AddProductModal

## Tính năng tiếp theo có thể thêm

1. ✨ **Edit Product** - Sửa thông tin sản phẩm
2. 📸 **Upload Image** - Thêm hình ảnh sản phẩm
3. 📋 **Bulk Import** - Import nhiều sản phẩm từ Excel/CSV
4. 🏷️ **Product Tags** - Thêm tags cho sản phẩm
5. 📊 **Product Analytics** - Thống kê sản phẩm bán chạy
6. 🎯 **Product Variants** - Biến thể sản phẩm (size, màu...)
7. 💰 **Discount Management** - Quản lý giảm giá
8. 📦 **Stock Alert** - Cảnh báo hết hàng

## Testing Checklist

- [ ] Modal mở/đóng đúng
- [ ] Load categories thành công
- [ ] Validation form hoạt động
- [ ] Submit tạo product thành công
- [ ] Toast notification hiển thị
- [ ] Danh sách reload sau khi thêm
- [ ] Modal reset form sau khi thêm
- [ ] Empty state hiển thị đúng
- [ ] Search không ảnh hưởng empty state
- [ ] Responsive trên mobile
