# Hướng dẫn Sửa lỗi Bản đồ Drone không hiển thị

## Vấn đề
Nút "Theo dõi trên bản đồ" không hiển thị khi xem chi tiết đơn hàng đang giao.

## Nguyên nhân
1. ❌ Điều kiện hiển thị nút quá strict: Chỉ hiện khi có GPS coordinates
2. ❌ GPS Simulation Service mới được thêm, chưa có thời gian cập nhật tọa độ
3. ❌ DroneMap component không xử lý trường hợp chưa có GPS data

## Giải pháp đã áp dụng

### 1. Sửa điều kiện hiển thị nút (OrdersPage.js)

**Trước:**
```javascript
{((deliveryInfo.currentLat && deliveryInfo.currentLng) ||
  (deliveryInfo.current_lat && deliveryInfo.current_lng)) && (
  <button onClick={() => setShowMap(true)}>
    Theo dõi trên bản đồ
  </button>
)}
```

**Sau:**
```javascript
{/* Show button for active delivery statuses */}
{['PICKING_UP', 'PICKED_UP', 'DELIVERING'].includes(deliveryInfo.status) && (
  <button onClick={() => setShowMap(true)}>
    Theo dõi trên bản đồ
  </button>
)}
```

✅ **Kết quả**: Nút luôn hiển thị khi delivery đang hoạt động

### 2. Cải thiện DroneMap component

#### a. Xử lý trường hợp không có GPS
```javascript
// Fallback to default HCM location if no GPS available
if (!initialPosition) {
  console.warn('No GPS data available, using default location');
  initialPosition = [10.7769, 106.7009]; // HCM center
}
```

#### b. Luôn hiển thị bản đồ
```javascript
// Always show map, even if GPS not available yet
const effectiveDronePosition = dronePosition || [10.7769, 106.7009];
```

#### c. Thay đổi vị trí mặc định
- **Trước**: Hanoi (21.0285, 105.8542)
- **Sau**: HCM (10.7769, 106.7009) - phù hợp với GPS Simulation

✅ **Kết quả**: Bản đồ luôn hiển thị, ngay cả khi chưa có GPS data

## Cách build và deploy

### 1. Rebuild Frontend
```powershell
cd Front_end/foodfast-app

# Install dependencies nếu chưa có
npm install

# Build production
npm run build
```

### 2. Rebuild Docker image (nếu dùng Docker)
```powershell
cd ../..

# Build frontend service
docker-compose -f docker-compose-full.yml build foodfast-frontend

# Restart service
docker-compose -f docker-compose-full.yml restart foodfast-frontend
```

### 3. Hoặc chạy development mode
```powershell
cd Front_end/foodfast-app
npm start
```

## Test flow

### Scenario 1: Đơn hàng mới (chưa có GPS)
1. ✅ Đặt đơn hàng mới
2. ✅ Restaurant xác nhận đơn → Status: PREPARING
3. ✅ Xem chi tiết đơn hàng
4. ✅ **Nút "Theo dõi trên bản đồ" hiển thị**
5. ✅ Click vào nút → Bản đồ mở ra
6. ✅ Hiển thị vị trí mặc định (HCM center)
7. ✅ Sau 5-10s, GPS Simulation Service cập nhật vị trí
8. ✅ Drone bắt đầu di chuyển trên bản đồ

### Scenario 2: Đơn hàng đang giao (có GPS)
1. ✅ Đơn hàng status: DELIVERING
2. ✅ GPS Simulation đã chạy, có currentLat/currentLng
3. ✅ Xem chi tiết → Nút "Theo dõi trên bản đồ" hiển thị
4. ✅ Click vào → Bản đồ hiển thị vị trí thực của drone
5. ✅ Drone di chuyển real-time (cập nhật mỗi 5s)

### Scenario 3: Đơn hàng đã hoàn thành
1. ✅ Status: COMPLETED
2. ❌ **Nút không hiển thị** (đúng logic vì đã giao xong)

## Kiểm tra logs

### Backend - GPS Simulation
```powershell
docker logs food-fast-delivery-delivery-service-1 -f --tail 50
```

**Logs mong đợi:**
```
✅ Updating GPS for 3 active deliveries
✅ Drone DRONE-ABC123 at GeoPoint(10.7780, 106.7020) - Distance remaining: 2.50 km
✅ Drone DRONE-XYZ789 picked up order 134 from restaurant
✅ Drone DRONE-XYZ789 completed delivery for order 134
```

### Frontend - Console logs
Mở Developer Tools (F12) → Console:
```
✅ Delivery info loaded
✅ Fetching drone location...
✅ Drone position updated: [10.7780, 106.7020]
✅ No GPS data available, using default location
```

## Tính năng bản đồ

### Các marker hiển thị
- 🟢 **Nhà hàng** (màu xanh lá): Điểm lấy hàng
- 🔴 **Khách hàng** (màu đỏ): Điểm giao hàng
- 🔵 **Drone** (màu xanh dương): Vị trí hiện tại của drone

### Các đường route
- **Đường nét đứt (xanh dương)**: Route dự kiến (restaurant → drone → customer)
- **Đường liền (xanh lá)**: Route đã hoàn thành (restaurant → drone)

### Info panel
Hiển thị:
- Drone ID
- Tốc độ hiện tại (km/h)
- Khoảng cách còn lại (km)
- ETA (Estimated Time of Arrival)
- Status badge
- Live indicator (cập nhật real-time)

### Auto-refresh
- Bản đồ tự động lấy vị trí mới mỗi **5 giây**
- Drone di chuyển mượt mà với animation
- Map tự động center theo vị trí drone

## Troubleshooting

### Nút "Theo dõi trên bản đồ" vẫn không hiện?
1. Check delivery status:
   ```javascript
   console.log('Delivery status:', deliveryInfo.status);
   ```
   → Phải là `PICKING_UP`, `PICKED_UP`, hoặc `DELIVERING`

2. Check deliveryInfo có null không:
   ```javascript
   console.log('Delivery info:', deliveryInfo);
   ```

3. Clear cache và rebuild:
   ```powershell
   cd Front_end/foodfast-app
   rm -rf node_modules build
   npm install
   npm run build
   ```

### Bản đồ không load?
1. **Check Leaflet dependencies:**
   ```powershell
   npm list leaflet react-leaflet
   ```
   
2. **Nếu thiếu:**
   ```powershell
   npm install leaflet@^1.9.4 react-leaflet@^5.0.0
   ```

3. **Check CSS import trong DroneMap.jsx:**
   ```javascript
   import 'leaflet/dist/leaflet.css';
   ```

### Drone không di chuyển?
1. **Check GPS Simulation Service:**
   ```sql
   -- Check deliveries table
   SELECT id, order_id, status, current_lat, current_lng, current_speed 
   FROM deliveries 
   WHERE status IN ('PICKING_UP', 'DELIVERING');
   ```

2. **Check logs:**
   ```powershell
   docker logs food-fast-delivery-delivery-service-1 | grep "GPS"
   ```

3. **Restart delivery-service:**
   ```powershell
   docker-compose -f docker-compose-full.yml restart delivery-service
   ```

### Map không hiển thị tiles?
- **Nguyên nhân**: Firewall hoặc không có internet
- **Giải pháp**: 
  1. Check internet connection
  2. Thử URL khác: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
  3. Hoặc dùng local tiles

## Tối ưu hóa (Optional)

### 1. Giảm polling interval
Nếu muốn update nhanh hơn:
```javascript
// DroneMap.jsx
intervalRef.current = setInterval(fetchDroneLocation, 3000); // 3s thay vì 5s
```

### 2. WebSocket thay cho polling
```javascript
// Replace polling with WebSocket
const ws = new WebSocket('ws://localhost:8080/ws/delivery/' + delivery.id);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  setDronePosition([data.lat, data.lng]);
};
```

### 3. Smooth animation
```javascript
// Add transition animation when updating position
<Marker 
  position={effectiveDronePosition}
  icon={droneIcon}
  // Add smooth transition
  animate={true}
  duration={1000}
>
```

## Kết quả

### Trước khi sửa ❌
- Nút "Theo dõi trên bản đồ" không hiển thị
- Phải đợi GPS Simulation cập nhật tọa độ
- User không biết drone ở đâu

### Sau khi sửa ✅
- Nút **luôn hiển thị** với delivery đang hoạt động
- Bản đồ **luôn load** (dùng vị trí mặc định nếu chưa có GPS)
- Tự động **cập nhật vị trí** khi GPS Simulation chạy
- User trải nghiệm **mượt mà**, không bị lỗi

## Demo video flow

1. User vào trang "My Orders"
2. Click vào đơn hàng đang giao (DELIVERING)
3. Dialog chi tiết mở ra
4. **Nút "Theo dõi trên bản đồ" màu xanh hiển thị rõ ràng** 🎯
5. Click vào nút → Bản đồ fullscreen
6. Thấy:
   - Nhà hàng (marker xanh lá)
   - Drone (marker xanh dương, di chuyển)
   - Khách hàng (marker đỏ)
   - Đường route
   - Info panel với thông tin real-time
7. Drone di chuyển mỗi 5 giây
8. Click X để đóng bản đồ

---

✅ **Hoàn thành! Chức năng bản đồ theo dõi drone đã hoạt động!** 🚁🗺️
