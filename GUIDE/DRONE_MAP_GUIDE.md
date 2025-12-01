# 🗺️ HƯỚNG DẪN SỬ DỤNG DRONE MAP

## ✅ ĐÃ HOÀN THÀNH

### 📁 Files đã tạo/sửa:

1. **DroneMap.jsx** - Component bản đồ theo dõi drone
   - Path: `Front_end/foodfast-app/src/components/DroneMap.jsx`
   - Features:
     - 🗺️ Hiển thị bản đồ OpenStreetMap
     - 🚁 Icon drone với vị trí GPS thời gian thực
     - 🍽️ Marker nhà hàng (điểm lấy hàng)
     - 📍 Marker khách hàng (điểm giao)
     - 📏 Đường bay (route polyline)
     - 🔄 Auto-refresh GPS mỗi 5 giây
     - 📊 Info panel hiển thị trạng thái drone
     - 📱 Responsive + fullscreen modal

2. **OrdersPage.js** - Đã tích hợp DroneMap
   - Thêm import DroneMap component
   - Thêm state `showMap` để quản lý modal
   - Thêm nút "Theo dõi trên bản đồ" trong delivery info
   - Thêm DroneMap modal hiển thị toàn màn hình

3. **deliveryService.js** - Thêm API method
   - Thêm `getDeliveryById()` để fetch delivery details

4. **index.css** - Import Leaflet CSS
   - Thêm import cho leaflet styles

---

## 🚀 CÁCH SỬ DỤNG

### Bước 1: Khởi động ứng dụng

```bash
cd Front_end/foodfast-app
npm start
```

### Bước 2: Tạo đơn hàng và theo dõi

1. **Đăng nhập** vào ứng dụng
2. **Tạo đơn hàng** mới từ menu
3. Đợi đơn hàng chuyển sang trạng thái **PREPARING** hoặc **DELIVERING**
4. Vào trang **My Orders** (`/orders`)
5. Click vào đơn hàng đang giao
6. Trong dialog chi tiết, nếu có thông tin delivery, sẽ hiển thị nút:
   - **"Theo dõi trên bản đồ"** (Track on Map)
7. Click nút để mở bản đồ theo dõi drone thời gian thực

### Bước 3: Xem drone trên bản đồ

Khi bản đồ mở:
- ✅ **Drone icon** (màu xanh) - Vị trí hiện tại của drone
- ✅ **Restaurant marker** (màu xanh lá) - Điểm lấy hàng
- ✅ **Customer marker** (màu đỏ) - Điểm giao hàng
- ✅ **Route line** (đường nét đứt xanh) - Tuyến bay dự kiến
- ✅ **Completed route** (đường liền xanh lá) - Phần đã bay

**Info Panel** hiển thị:
- 🚁 Drone ID
- 📍 Tốc độ hiện tại (km/h)
- 📏 Khoảng cách còn lại (km)
- ⏱️ Thời gian đến dự kiến (ETA)
- 🔵 Trạng thái delivery
- 🟢 Live indicator (cập nhật mỗi 5s)

---

## 🎯 FEATURES CHI TIẾT

### 1. Real-time GPS Tracking
```javascript
// Auto-refresh GPS every 5 seconds
useEffect(() => {
  const intervalRef = setInterval(() => {
    fetchDroneLocation(); // Gọi API lấy vị trí mới
  }, 5000);
  
  return () => clearInterval(intervalRef);
}, []);
```

### 2. Custom Icons
- **Drone Icon**: SVG động với pulse effect
- **Restaurant Icon**: Marker xanh lá với chữ "R"
- **Customer Icon**: Pin đỏ truyền thống

### 3. Map Auto-centering
- Map tự động center theo vị trí drone
- Smooth animation khi drone di chuyển

### 4. Status Tracking
- `PENDING` - Chờ xử lý
- `ASSIGNED` - Đã gán drone
- `PICKING_UP` - Đang đến nhà hàng
- `PICKED_UP` - Đã lấy hàng
- `DELIVERING` - Đang giao hàng
- `COMPLETED` - Hoàn thành

---

## 🔧 TROUBLESHOOTING

### Lỗi: Map không hiển thị
**Nguyên nhân**: Thiếu Leaflet CSS
**Giải pháp**: Đảm bảo đã import trong `index.css`:
```css
@import 'leaflet/dist/leaflet.css';
```

### Lỗi: Marker icons bị lỗi
**Nguyên nhân**: Default icons không load
**Giải pháp**: Code đã fix trong DroneMap.jsx:
```javascript
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
```

### Lỗi: GPS không cập nhật
**Kiểm tra**:
1. Backend delivery-service có đang chạy không?
2. Delivery có `currentLat` và `currentLng` không?
3. Console có lỗi API không?

### Nút "Theo dõi trên bản đồ" không hiện
**Điều kiện hiển thị**:
- Order phải ở trạng thái: `PREPARING`, `DELIVERING`, hoặc `DELIVERED`
- DeliveryInfo phải có dữ liệu
- DeliveryInfo phải có `currentLat` và `currentLng`

---

## 📊 KIẾN TRÚC

```
OrdersPage
  └── Dialog (Order Details)
      ├── DeliveryInfo Component
      └── "Theo dõi trên bản đồ" Button
          └── DroneMap Modal
              ├── MapContainer (Leaflet)
              ├── Info Panel
              ├── Drone Marker (auto-update)
              ├── Restaurant Marker
              ├── Customer Marker
              └── Route Polylines
```

---

## 🎨 CUSTOMIZATION

### Thay đổi refresh interval
File: `DroneMap.jsx`
```javascript
// Hiện tại: 5 giây
intervalRef.current = setInterval(fetchDroneLocation, 5000);

// Nhanh hơn: 3 giây
intervalRef.current = setInterval(fetchDroneLocation, 3000);
```

### Thay đổi màu route
File: `DroneMap.jsx`
```javascript
<Polyline
  positions={routePositions}
  pathOptions={{
    color: '#3B82F6', // Đổi màu này
    weight: 3,
    opacity: 0.7,
  }}
/>
```

### Thay đổi vị trí mặc định
File: `DroneMap.jsx`
```javascript
// Restaurant location (Hanoi center)
const restaurantPosition = [21.0285, 105.8542];

// Customer location
const customerPosition = [21.0245, 105.8412];
```

**Lưu ý**: Trong production, nên lấy tọa độ thực từ:
- Restaurant data (từ order.restaurantId)
- Customer address (geocoding từ deliveryAddress)

---

## 🧪 TESTING

### Test Case 1: Xem bản đồ
1. Tạo order mới
2. Đợi status = PREPARING/DELIVERING
3. Vào Orders page
4. Click order
5. Verify: Có nút "Theo dõi trên bản đồ"
6. Click nút
7. Verify: Map hiển thị với 3 markers

### Test Case 2: Real-time update
1. Mở map
2. Đợi 5 giây
3. Verify: Console log API call mới
4. Verify: Drone position có thay đổi (nếu GPS thay đổi)

### Test Case 3: Close map
1. Mở map
2. Click nút X (close)
3. Verify: Map đóng
4. Verify: Interval đã clear (không còn API calls)

---

## 📝 TODO / IMPROVEMENTS

### Phase 1 (Đã hoàn thành)
- ✅ Component DroneMap cơ bản
- ✅ Tích hợp vào OrdersPage
- ✅ Real-time GPS tracking
- ✅ Custom icons
- ✅ Info panel

### Phase 2 (Có thể mở rộng)
- ⬜ Lấy tọa độ restaurant thật từ database
- ⬜ Geocoding customer address → GPS
- ⬜ Hiển thị nhiều drone cùng lúc (fleet view)
- ⬜ Thêm weather layer
- ⬜ Hiển thị battery level của drone
- ⬜ Play/Pause tracking
- ⬜ Historical route replay
- ⬜ Notifications khi drone đến gần
- ⬜ ETA recalculation dựa trên traffic

---

## 🔗 DEPENDENCIES

```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^5.0.0"
}
```

Đã được cài trong `package.json` rồi.

---

## 📞 SUPPORT

Nếu có lỗi, check:
1. Console browser (F12)
2. Network tab - API calls
3. Backend logs (delivery-service)

**Common Issues**:
- CORS errors → Check backend CORS config
- 401 Unauthorized → Token expired, login lại
- Map blank → Check Leaflet CSS import
- Icons missing → Check marker icon config

---

## 🎉 SUMMARY

**Đã hoàn thành giả lập GPS tracking cho drone delivery!**

✅ Component DroneMap hoàn chỉnh  
✅ Real-time GPS updates  
✅ Beautiful UI với custom icons  
✅ Responsive design  
✅ Auto-refresh mỗi 5s  
✅ Live status indicator  

**Ready to use! 🚀**

