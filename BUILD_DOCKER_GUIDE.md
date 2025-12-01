# 🐳 HƯỚNG DẪN BUILD DOCKER SAU KHI SỬA GPS TRACKING

## ✅ ĐÃ SẴN SÀNG BUILD

Code đã được sửa để match hoàn toàn với `DELIVERY_SERVICE_INTEGRATION.md`:
- ✅ Support cả snake_case và camelCase
- ✅ Port đúng (8086 cho Delivery Service)
- ✅ API endpoints đúng
- ✅ No compile errors

---

## 🚀 BUILD VÀ CHẠY DOCKER

### Bước 1: Dọn dẹp (Clean Up)

```powershell
# Dừng tất cả containers
docker-compose -f docker-compose-full.yml down

# Xóa volumes (nếu muốn reset database)
docker-compose -f docker-compose-full.yml down -v

# Xóa images cũ để build lại sạch
docker system prune -a
# Nhấn 'y' để confirm
```

### Bước 2: Build tất cả services

```powershell
# Build tất cả services
docker-compose -f docker-compose-full.yml build

# Hoặc build một service cụ thể
docker-compose -f docker-compose-full.yml build frontend
docker-compose -f docker-compose-full.yml build delivery-service
```

### Bước 3: Khởi động

```powershell
# Start tất cả services
docker-compose -f docker-compose-full.yml up -d

# Hoặc build + start cùng lúc
docker-compose -f docker-compose-full.yml up -d --build
```

### Bước 4: Kiểm tra logs

```powershell
# Xem logs tất cả services
docker-compose -f docker-compose-full.yml logs -f

# Xem logs một service cụ thể
docker-compose -f docker-compose-full.yml logs -f frontend
docker-compose -f docker-compose-full.yml logs -f delivery-service
docker-compose -f docker-compose-full.yml logs -f api-gateway

# Stop xem logs: Ctrl + C
```

### Bước 5: Kiểm tra trạng thái

```powershell
# Xem trạng thái containers
docker-compose -f docker-compose-full.yml ps

# Xem resource usage
docker stats
```

---

## 🔍 KIỂM TRA SERVICES

### Sau khi build xong, check các endpoints:

| Service | URL | Expected |
|---------|-----|----------|
| **Frontend** | http://localhost:3000 | React app loads |
| **API Gateway** | http://localhost:8080 | Gateway running |
| **Eureka** | http://localhost:8761 | Dashboard visible |
| **Delivery Service** | http://localhost:8086/api/deliveries | JSON response |
| **RabbitMQ** | http://localhost:15672 | Login: admin/admin123 |
| **Grafana** | http://localhost:3001 | Login: admin/admin123 |
| **Prometheus** | http://localhost:9090 | Dashboard visible |

### Quick Test:

```powershell
# Test Delivery Service
curl http://localhost:8086/api/deliveries

# Test API Gateway
curl http://localhost:8080/api/deliveries

# Test Frontend (browser)
# Mở: http://localhost:3000
```

---

## 🧪 TEST GPS TRACKING

### Bước 1: Tạo Order

1. Mở frontend: http://localhost:3000
2. Login as customer
3. Add items to cart
4. Checkout và pay

### Bước 2: Nhà hàng xác nhận

1. Login as admin/restaurant
2. Go to Orders page
3. Change order status to PREPARING
4. Click "Mark as Ready" → Triggers delivery

### Bước 3: Check Delivery Created

```powershell
# Get all deliveries
curl http://localhost:8086/api/deliveries

# Get delivery by order ID (replace {orderId})
curl http://localhost:8086/api/deliveries/order/{orderId}
```

### Bước 4: Update GPS Manual (Test)

```powershell
# Update GPS location (replace {deliveryId})
curl -X PUT "http://localhost:8086/api/deliveries/{deliveryId}/location?lat=21.0285&lng=105.8542"

# Example:
curl -X PUT "http://localhost:8086/api/deliveries/1/location?lat=21.0285&lng=105.8542"
```

### Bước 5: Xem Map

1. Customer: Go to Orders page
2. Click vào order có delivery
3. Click "Theo dõi trên bản đồ"
4. Map sẽ hiển thị drone marker tại GPS vừa update

---

## 📊 EXPECTED BEHAVIOR

### Auto Delivery Flow (38 seconds total):

```
Order status = READY
    ↓ (RabbitMQ event)
Delivery Service auto-creates delivery
    ↓ (assign random drone)
Status: ASSIGNED
    ↓ (5 seconds - flying to restaurant)
Status: PICKING_UP
    ↓ (3 seconds - picking up food)
Status: PICKED_UP
    ↓ (30 seconds - delivering to customer)
Status: DELIVERING
    ↓
Status: COMPLETED
```

### GPS Data:

**From Database (snake_case):**
```sql
SELECT current_lat, current_lng, current_speed, distance_remaining 
FROM deliveries 
WHERE id = 1;
```

**From API (could be snake_case or camelCase):**
```json
{
  "current_lat": 21.0285,
  "current_lng": 105.8542,
  "current_speed": 35.5,
  "distance_remaining": 2.5
}
```
OR
```json
{
  "currentLat": 21.0285,
  "currentLng": 105.8542,
  "currentSpeed": 35.5,
  "distanceRemaining": 2.5
}
```

**Frontend:** ✅ Hỗ trợ CẢ HAI formats!

---

## 🐛 TROUBLESHOOTING

### Issue 1: Frontend build failed

**Symptom:**
```
ERROR in ./src/components/DroneMap.jsx
Module not found: Can't resolve 'leaflet'
```

**Solution:**
```powershell
# Vào frontend directory
cd Front_end/foodfast-app

# Install dependencies
npm install

# Build lại
cd ../..
docker-compose -f docker-compose-full.yml build frontend
```

### Issue 2: Delivery Service không start

**Symptom:**
```
delivery-service | Failed to connect to database
```

**Solution:**
```powershell
# Check MySQL running
docker-compose -f docker-compose-full.yml ps mysql

# Restart MySQL
docker-compose -f docker-compose-full.yml restart mysql

# Wait 30s rồi restart delivery-service
docker-compose -f docker-compose-full.yml restart delivery-service
```

### Issue 3: RabbitMQ connection error

**Symptom:**
```
delivery-service | Could not connect to RabbitMQ
```

**Solution:**
```powershell
# Check RabbitMQ
docker-compose -f docker-compose-full.yml logs rabbitmq

# Restart RabbitMQ
docker-compose -f docker-compose-full.yml restart rabbitmq

# Wait for RabbitMQ to fully start (check logs)
docker-compose -f docker-compose-full.yml logs -f rabbitmq
# Wait until you see: "Server startup complete"

# Then restart delivery-service
docker-compose -f docker-compose-full.yml restart delivery-service
```

### Issue 4: Frontend không load map

**Symptom:** Map trắng, không có tiles

**Check:**
1. Browser console (F12) - có lỗi Leaflet không?
2. Internet connection
3. Leaflet CSS đã load chưa

**Solution:**
```powershell
# Rebuild frontend
docker-compose -f docker-compose-full.yml build frontend
docker-compose -f docker-compose-full.yml restart frontend

# Clear browser cache (Ctrl + Shift + Delete)
# Reload trang (Ctrl + F5)
```

### Issue 5: GPS không hiển thị

**Symptom:** Nút "Theo dõi trên bản đồ" không xuất hiện

**Check:**
1. Order status phải là PREPARING/DELIVERING/DELIVERED
2. Delivery record đã được tạo chưa
3. Delivery có `current_lat` và `current_lng` chưa

**Solution:**
```sql
-- Kết nối database
docker exec -it mysql mysql -uroot -p08102004

USE delivery_service;

-- Check delivery
SELECT * FROM deliveries WHERE order_id = {yourOrderId};

-- Update GPS if null
UPDATE deliveries 
SET current_lat = 21.0285, 
    current_lng = 105.8542,
    current_speed = 35.5,
    distance_remaining = 2.5
WHERE order_id = {yourOrderId};
```

### Issue 6: Port already in use

**Symptom:**
```
Error: bind: address already in use
```

**Solution:**
```powershell
# Find process using port (e.g., 3000)
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in docker-compose-full.yml
```

---

## 📝 BUILD OPTIMIZATION

### Quick Rebuild (chỉ frontend):

```powershell
# Nếu chỉ sửa frontend code
docker-compose -f docker-compose-full.yml build frontend
docker-compose -f docker-compose-full.yml restart frontend
```

### Quick Rebuild (chỉ delivery-service):

```powershell
# Nếu chỉ sửa delivery service
docker-compose -f docker-compose-full.yml build delivery-service
docker-compose -f docker-compose-full.yml restart delivery-service
```

### Full Clean Rebuild:

```powershell
# Nuclear option - rebuild everything
docker-compose -f docker-compose-full.yml down -v
docker system prune -a -f
docker-compose -f docker-compose-full.yml up -d --build
```

---

## ⏱️ ESTIMATED BUILD TIME

| Step | Time | Notes |
|------|------|-------|
| **Download base images** | 2-5 min | First time only |
| **Build backend services** | 3-5 min | Maven download deps |
| **Build frontend** | 2-4 min | npm install |
| **Start all services** | 1-2 min | Wait for health checks |
| **Total** | **8-16 min** | First build |
| **Rebuild (cached)** | **2-5 min** | Subsequent builds |

---

## ✅ VERIFICATION CHECKLIST

After build completes:

- [ ] All containers running: `docker-compose -f docker-compose-full.yml ps`
- [ ] Frontend accessible: http://localhost:3000
- [ ] Eureka shows services: http://localhost:8761
- [ ] Can login to frontend
- [ ] Can create order
- [ ] Can confirm order (admin)
- [ ] Delivery created automatically
- [ ] GPS data in database
- [ ] "Theo dõi trên bản đồ" button appears
- [ ] Map opens with drone marker
- [ ] Info panel shows GPS data
- [ ] Auto-refresh works (check console - API calls every 5s)

---

## 🎯 READY!

Nếu tất cả checklist ✅, bạn đã sẵn sàng demo!

### Next Steps:

1. ✅ **Test full flow** - Từ order → delivery → map
2. ✅ **Chụp screenshots** - Cho báo cáo
3. ✅ **Prepare demo script** - Xem DRONE_MAP_QUICK_START.md
4. ✅ **Practice demo** - 3 phút

---

## 📞 SUPPORT

Nếu gặp vấn đề:

1. **Check logs:** `docker-compose -f docker-compose-full.yml logs -f`
2. **Check file:** `GPS_TRACKING_FIX_SUMMARY.md` - Chi tiết những gì đã sửa
3. **Check guide:** `DELIVERY_SERVICE_INTEGRATION.md` - Spec gốc
4. **Check checklist:** `DRONE_MAP_CHECKLIST.md` - Test cases

---

**🚀 CHÚC BẠN BUILD THÀNH CÔNG!** 🎉

