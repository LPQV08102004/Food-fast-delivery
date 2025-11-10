# Hướng dẫn Logic Giỏ Hàng và Xem Menu Theo Nhà Hàng

## Tổng quan
Đã cập nhật logic giỏ hàng để đảm bảo mỗi đơn hàng chỉ chứa sản phẩm từ một nhà hàng duy nhất. Khi người dùng click vào sản phẩm, họ sẽ được chuyển đến trang menu của nhà hàng đó.

## Các thay đổi đã thực hiện

### 1. CartContext (contexts/CartContext.js)
**Tính năng mới:**
- Lưu trữ `currentRestaurantId` và `currentRestaurantName`
- Tự động reset giỏ hàng khi chuyển sang nhà hàng khác
- Hiển thị dialog xác nhận trước khi xóa giỏ hàng cũ
- Lưu trữ thông tin nhà hàng vào localStorage

**Logic xử lý:**
```javascript
const addToCart = (product, quantity = 1) => {
  // 1. Lấy restaurantId từ sản phẩm
  const productRestaurantId = product.restaurantId || product.restaurant?.id;
  
  // 2. Kiểm tra nếu giỏ hàng đang có sản phẩm từ nhà hàng khác
  if (currentRestaurantId && currentRestaurantId !== productRestaurantId) {
    // Hiển thị dialog xác nhận
    const confirmSwitch = window.confirm("Your cart will be cleared...");
    
    if (!confirmSwitch) {
      return false; // Không thêm sản phẩm
    }
    
    // Xóa giỏ hàng cũ và chuyển sang nhà hàng mới
    setCartItems([]);
    setCurrentRestaurantId(productRestaurantId);
    setCurrentRestaurantName(productRestaurantName);
  }
  
  // 3. Thêm sản phẩm vào giỏ
  // ...
}
```

**Methods mới:**
- `canAddFromRestaurant(restaurantId)`: Kiểm tra xem có thể thêm sản phẩm từ nhà hàng này không

### 2. RestaurantMenuPage (pages/RestaurantMenuPage.js)
**Trang mới để hiển thị menu của một nhà hàng cụ thể**

**Tính năng:**
- Hiển thị thông tin chi tiết nhà hàng (tên, địa chỉ, rating, số điện thoại, mô tả)
- Lấy và hiển thị tất cả sản phẩm của nhà hàng
- Cảnh báo nếu giỏ hàng đang có sản phẩm từ nhà hàng khác
- Thêm sản phẩm vào giỏ với thông tin nhà hàng đầy đủ

**Cấu trúc:**
```
/restaurant/:restaurantId/menu
```

**Ví dụ:**
```
/restaurant/1/menu  -> Menu của nhà hàng ID 1
/restaurant/5/menu  -> Menu của nhà hàng ID 5
```

### 3. ProductPage (pages/ProductPage.js)
**Cập nhật:**
- Khi click vào ảnh hoặc tên sản phẩm -> chuyển đến trang menu nhà hàng
- Thêm overlay "View Restaurant Menu" khi hover vào ảnh sản phẩm
- Nút "Add" và "Buy" có `stopPropagation()` để không trigger navigation

**Handler mới:**
```javascript
const handleViewRestaurant = (product) => {
  if (product.restaurantId) {
    navigate(`/restaurant/${product.restaurantId}/menu`);
  } else {
    toast.error('Restaurant information not available');
  }
};
```

### 4. App.js
**Route mới:**
```javascript
<Route path="/restaurant/:restaurantId/menu" element={<RestaurantMenuPage />} />
```

## Quy trình hoạt động

### Kịch bản 1: Thêm sản phẩm từ cùng một nhà hàng
1. User click "Add to Cart" cho sản phẩm từ nhà hàng A
2. Sản phẩm được thêm vào giỏ, `currentRestaurantId` = A
3. User click "Add to Cart" cho sản phẩm khác từ nhà hàng A
4. Sản phẩm được thêm vào giỏ thành công (không có cảnh báo)

### Kịch bản 2: Thêm sản phẩm từ nhà hàng khác
1. Giỏ hàng đang có sản phẩm từ nhà hàng A
2. User click "Add to Cart" cho sản phẩm từ nhà hàng B
3. Hệ thống hiển thị dialog xác nhận:
   ```
   Your cart contains items from "Restaurant A".
   Adding items from "Restaurant B" will clear your current cart.
   Do you want to continue?
   ```
4. Nếu user chọn "OK":
   - Xóa toàn bộ giỏ hàng cũ
   - Set `currentRestaurantId` = B
   - Thêm sản phẩm mới từ nhà hàng B
5. Nếu user chọn "Cancel":
   - Giữ nguyên giỏ hàng
   - Không thêm sản phẩm mới

### Kịch bản 3: Xem menu nhà hàng
1. User vào trang Products
2. User click vào ảnh/tên một sản phẩm
3. Hệ thống chuyển đến trang `/restaurant/:restaurantId/menu`
4. Hiển thị thông tin nhà hàng và tất cả sản phẩm của nhà hàng đó
5. User có thể thêm nhiều sản phẩm từ cùng nhà hàng vào giỏ

## Dữ liệu cần có trong Product

Để logic hoạt động đúng, mỗi product cần có:
```javascript
{
  id: "1",
  name: "Product Name",
  price: 10.99,
  restaurantId: "5",           // QUAN TRỌNG: ID của nhà hàng
  restaurantName: "Restaurant A", // Tùy chọn: Tên nhà hàng
  // ... các trường khác
}
```

Hoặc:
```javascript
{
  id: "1",
  name: "Product Name", 
  price: 10.99,
  restaurant: {              // QUAN TRỌNG: Object chứa thông tin nhà hàng
    id: "5",
    name: "Restaurant A"
  },
  // ... các trường khác
}
```

## UI/UX Features

### 1. Warning Banner
Khi user vào trang menu của nhà hàng B nhưng giỏ hàng đang có sản phẩm từ nhà hàng A:
```
⚠️ Your cart contains items from "Restaurant A"
   Adding items from this restaurant will clear your current cart.
```

### 2. Hover Effect
Khi hover vào ảnh sản phẩm:
- Overlay màu đen mờ xuất hiện
- Text "View Restaurant Menu" hiển thị ở giữa
- Ảnh zoom in nhẹ

### 3. Confirm Dialog
Dialog xác nhận khi thêm sản phẩm từ nhà hàng khác:
- Hiển thị tên nhà hàng hiện tại trong giỏ
- Hiển thị tên nhà hàng mới
- Nút OK/Cancel rõ ràng

## LocalStorage

Hệ thống lưu trữ:
- `cart`: Danh sách sản phẩm trong giỏ
- `currentRestaurantId`: ID nhà hàng hiện tại
- `currentRestaurantName`: Tên nhà hàng hiện tại

Dữ liệu được duy trì khi:
- Refresh trang
- Đóng/mở lại browser
- Chuyển giữa các trang

Dữ liệu bị xóa khi:
- User xóa toàn bộ giỏ hàng
- User chuyển sang nhà hàng khác và xác nhận
- User xóa localStorage của browser

## Testing

### Test Case 1: Thêm sản phẩm từ cùng nhà hàng
1. Vào Products page
2. Click "Add" cho sản phẩm từ nhà hàng A
3. Click "Add" cho sản phẩm khác từ nhà hàng A
4. **Expected**: Cả 2 sản phẩm đều có trong giỏ

### Test Case 2: Thêm sản phẩm từ nhà hàng khác (Accept)
1. Thêm sản phẩm từ nhà hàng A vào giỏ
2. Click "Add" cho sản phẩm từ nhà hàng B
3. Click "OK" trong dialog xác nhận
4. **Expected**: 
   - Sản phẩm từ nhà hàng A bị xóa
   - Chỉ có sản phẩm từ nhà hàng B trong giỏ

### Test Case 3: Thêm sản phẩm từ nhà hàng khác (Cancel)
1. Thêm sản phẩm từ nhà hàng A vào giỏ
2. Click "Add" cho sản phẩm từ nhà hàng B
3. Click "Cancel" trong dialog xác nhận
4. **Expected**: 
   - Sản phẩm từ nhà hàng A vẫn còn
   - Sản phẩm từ nhà hàng B không được thêm

### Test Case 4: Xem menu nhà hàng
1. Vào Products page
2. Click vào ảnh một sản phẩm
3. **Expected**: Chuyển đến trang menu của nhà hàng đó

### Test Case 5: LocalStorage persistence
1. Thêm sản phẩm vào giỏ
2. Refresh trang
3. **Expected**: Sản phẩm vẫn còn trong giỏ

## Lưu ý quan trọng

1. **Backend phải trả về restaurantId**: Đảm bảo API `/products` trả về `restaurantId` cho mỗi product

2. **API endpoint cần có**: 
   - `GET /api/restaurants/:id` - Lấy thông tin nhà hàng
   - `GET /api/products/restaurant/:restaurantId` - Lấy sản phẩm theo nhà hàng

3. **Product status**: Chỉ hiển thị sản phẩm có `status = "APPROVED"`

4. **Error handling**: Xử lý trường hợp không tìm thấy nhà hàng hoặc sản phẩm không có restaurantId

## Các file đã thay đổi

```
src/
├── App.js                        [UPDATED] - Thêm route mới
├── contexts/
│   └── CartContext.js           [UPDATED] - Thêm logic restaurant
└── pages/
    ├── ProductPage.js           [UPDATED] - Thêm navigation
    └── RestaurantMenuPage.js    [NEW] - Trang menu nhà hàng
```

## Cách sử dụng

1. **Xem tất cả sản phẩm**: Vào `/products`
2. **Xem menu nhà hàng**: Click vào bất kỳ sản phẩm nào
3. **Thêm vào giỏ**: Click nút "Add to Cart"
4. **Xem giỏ hàng**: Click icon giỏ hàng ở header

## Troubleshooting

**Vấn đề**: Không thể thêm sản phẩm vào giỏ
- **Giải pháp**: Kiểm tra xem product có `restaurantId` không

**Vấn đề**: Dialog xác nhận không hiện
- **Giải pháp**: Kiểm tra console log, đảm bảo `currentRestaurantId` được set đúng

**Vấn đề**: Trang menu không load
- **Giải pháp**: Kiểm tra API `/api/restaurants/:id` và `/api/products/restaurant/:restaurantId`

**Vấn đề**: Giỏ hàng bị reset không mong muốn
- **Giải pháp**: Kiểm tra `restaurantId` của các products có nhất quán không

