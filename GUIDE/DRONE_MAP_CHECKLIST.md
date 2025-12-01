# ✅ CHECKLIST - DRONE MAP INTEGRATION

## 📋 Pre-launch Checklist

### Backend Services (Phải chạy)
- [ ] Eureka Service (port 8761)
- [ ] Config Service (port 8888)
- [ ] API Gateway (port 8080)
- [ ] Delivery Service (port 8086)
- [ ] Order Service (port 8082)
- [ ] User Service (port 8081)

### Database
- [ ] PostgreSQL đang chạy
- [ ] Database `delivery_db` tồn tại
- [ ] Table `drones` có dữ liệu mẫu
- [ ] Table `deliveries` có thể insert/update

---

## 🧪 Testing Steps

### Step 1: Start Frontend
```bash
cd Front_end/foodfast-app
npm start
```
- [ ] App khởi động thành công (http://localhost:3000)
- [ ] Không có lỗi compile
- [ ] Không có warning về leaflet

### Step 2: Login & Create Order
- [ ] Đăng nhập thành công
- [ ] Tạo order mới (thêm món vào giỏ → checkout)
- [ ] Order được tạo thành công
- [ ] Order hiển thị trong My Orders page

### Step 3: Check Delivery Assignment
**Backend Test (Postman/curl)**:
```bash
# Assign drone to order
POST http://localhost:8080/api/deliveries
Headers: Authorization: Bearer <token>
Body: {
  "orderId": <your-order-id>
}
```
- [ ] Delivery được tạo
- [ ] Drone được assign tự động
- [ ] Status = ASSIGNED

### Step 4: Update GPS Location
```bash
# Simulate drone moving
PUT http://localhost:8080/api/deliveries/{deliveryId}/location?lat=21.0285&lng=105.8542
```
- [ ] GPS location được update
- [ ] Response trả về currentLat, currentLng

### Step 5: Open Map
- [ ] Vào My Orders page
- [ ] Click vào order đang có delivery
- [ ] Dialog mở ra
- [ ] Hiển thị DeliveryInfo component
- [ ] Nút "Theo dõi trên bản đồ" xuất hiện
- [ ] Click nút → Map modal mở

### Step 6: Verify Map Display
- [ ] ✅ Map hiển thị (OpenStreetMap tiles load)
- [ ] ✅ Drone marker (icon xanh) hiển thị đúng vị trí
- [ ] ✅ Restaurant marker (xanh lá) hiển thị
- [ ] ✅ Customer marker (đỏ) hiển thị
- [ ] ✅ Route polyline (đường nét đứt) hiển thị
- [ ] ✅ Info panel hiển thị:
  - Drone ID
  - Tốc độ
  - Khoảng cách còn lại
  - ETA
  - Status
  - Live indicator (đang nhấp nháy)

### Step 7: Test Real-time Updates
- [ ] Mở Console (F12)
- [ ] Verify: API call mỗi 5 giây `/api/deliveries/{id}`
- [ ] Update GPS từ backend
- [ ] Verify: Drone marker di chuyển sau 5s
- [ ] Verify: Info panel cập nhật

### Step 8: Test Close
- [ ] Click nút X (close button)
- [ ] Map đóng
- [ ] Quay lại order details dialog
- [ ] Console không còn API calls

---

## 🐛 Common Issues & Fixes

### Issue 1: "Nút Theo dõi không hiện"
**Check**:
```javascript
// In OrdersPage Dialog, verify:
1. deliveryInfo có data?
2. deliveryInfo.currentLat và currentLng có giá trị?
3. Order status là PREPARING/DELIVERING/DELIVERED?
```
**Fix**: Update GPS location cho delivery

### Issue 2: "Map trống, không có tiles"
**Check**: 
- Internet connection
- OpenStreetMap service có up không
**Fix**: Đợi hoặc dùng tile server khác

### Issue 3: "Markers không hiển thị"
**Check Console**: 
- Lỗi require() cho leaflet images?
**Fix**: Đã fix trong code rồi, nếu vẫn lỗi check webpack config

### Issue 4: "GPS không update"
**Check**:
- Network tab: API có được gọi mỗi 5s?
- Response có data mới?
- Backend có update được GPS không?

### Issue 5: "CORS Error"
**Fix Backend** (API Gateway):
```java
@Bean
public CorsFilter corsFilter() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowCredentials(true);
    config.addAllowedOrigin("http://localhost:3000");
    config.addAllowedHeader("*");
    config.addAllowedMethod("*");
    // ...
}
```

---

## 📸 Expected Screenshots

### 1. Orders Page with Delivery
```
┌─────────────────────────────────────┐
│ Order #123                          │
│ Status: DELIVERING 🚚               │
│ Total: $25.99                       │
│ [View Details]                      │
└─────────────────────────────────────┘
```

### 2. Order Details Dialog
```
┌─────────────────────────────────────┐
│ Order Details                    [X]│
├─────────────────────────────────────┤
│ Order ID: 123                       │
│ Status: DELIVERING                  │
│                                     │
│ ┌─── Delivery Info ───────────────┐│
│ │ 🚁 Drone: DRONE-001             ││
│ │ 📍 21.0285, 105.8542            ││
│ │ 🚀 45 km/h                      ││
│ │ 📏 2.5 km còn lại               ││
│ │ ⏱️ 5 phút nữa                   ││
│ │                                 ││
│ │ [🗺️ Theo dõi trên bản đồ]      ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### 3. Drone Map Modal
```
┌─────────────────────────────────────────────────┐
│ ┌─ Info Panel ──┐               [X] Close     │
│ │ 🚁 DRONE-001   │                             │
│ │ 📍 45 km/h     │         ╱◡╲  OpenStreetMap │
│ │ 📏 2.5 km      │        (  🚁 ) ← Drone     │
│ │ ⏱️ 5 phút      │         ╲◡╱                │
│ │ 🔵 DELIVERING  │        ╱  ╲                │
│ │ 🟢 Live        │       ╱    ╲               │
│ └────────────────┘      🏠 ──── 📍            │
│                      Restaurant  Customer     │
└─────────────────────────────────────────────────┘
```

---

## ✨ Success Criteria

### Minimum (MVP)
- ✅ Map hiển thị được
- ✅ Drone marker ở đúng GPS
- ✅ Có 3 markers (drone, restaurant, customer)
- ✅ Info panel hiển thị thông tin cơ bản

### Good
- ✅ All above +
- ✅ Real-time GPS update (5s interval)
- ✅ Route polyline hiển thị
- ✅ Status colors chính xác
- ✅ ETA calculation

### Excellent
- ✅ All above +
- ✅ Smooth animations
- ✅ Live indicator working
- ✅ Responsive design
- ✅ No console errors
- ✅ Clean code structure

---

## 🎯 Performance Checklist

- [ ] Map load time < 2s
- [ ] Marker update smooth (no flicker)
- [ ] API calls không tràn (cleanup interval)
- [ ] Memory leak check (close modal → interval cleared)
- [ ] Mobile responsive

---

## 📝 Final Notes

**Đã test thành công khi**:
1. ✅ Tạo order → có delivery → mở map → thấy drone
2. ✅ Drone di chuyển mỗi 5s (nếu GPS thay đổi)
3. ✅ Đóng map → không còn API calls
4. ✅ Mở lại map → tiếp tục tracking

**Ready for demo!** 🎉

---

## 🔄 Next Steps (After Testing)

1. [ ] Demo cho team/giảng viên
2. [ ] Collect feedback
3. [ ] Fix bugs (nếu có)
4. [ ] Add to presentation slides
5. [ ] Update documentation
6. [ ] Prepare for final presentation

Good luck! 🚀

