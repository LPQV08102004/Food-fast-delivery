# 🚁 PLAN TRIỂN KHAI GPS TRACKING CHO DRONE

## 📋 TỔNG QUAN
Tích hợp chức năng GPS tracking cho Drone vào hệ thống Food Fast Delivery với mục tiêu:
- Hiển thị vị trí drone real-time trên giao diện
- Lưu trữ lịch sử di chuyển của drone
- Theo dõi trạng thái giao hàng theo thời gian thực
- Giả lập chuyển động drone trên bản đồ

---

## 🎯 PHASE 1: BACKEND - CẢI TIẾN DELIVERY SERVICE (1-2 ngày)

### ✅ Bước 1.1: Bổ sung Drone Model Entity
**File:** `delivery-service/src/main/java/vn/cnpm/delivery_service/model/Drone.java`

**Mục đích:** Quản lý thông tin drone riêng biệt
```java
- id (Long)
- droneCode (String) // DRONE-XXXXXXXX
- name (String) // Tên drone
- status (DroneStatus) // AVAILABLE, BUSY, MAINTENANCE, OFFLINE
- batteryLevel (Integer) // % pin
- currentLat (Double)
- currentLng (Double)
- maxSpeed (Double) // km/h
- maxRange (Double) // km
- createdAt, updatedAt
```

**Task checklist:**
- [x] Tạo file `Drone.java` entity *(CẦN XÁC NHẬN)*
- [x] Tạo enum `DroneStatus.java` *(CẦN XÁC NHẬN)*
- [x] Tạo `DroneRepository.java` *(CẦN XÁC NHẬN)*
- [x] Migration SQL tạo bảng `drones` *(CẦN XÁC NHẬN)*

---

### ✅ Bước 1.2: Cải tiến GPS Tracking
**File:** `delivery-service/src/main/java/vn/cnpm/delivery_service/service/GpsSimulationService.java`

**Mục đích:** Giả lập di chuyển drone thực tế hơn

**Chức năng:**
- Tính toán lộ trình từ nhà hàng → khách hàng
- Cập nhật vị trí GPS theo từng giây
- Giả lập tốc độ bay (~30-50 km/h)
- Tính ETA (Estimated Time of Arrival)

**Task checklist:**
- [ ] Tạo class `GpsSimulationService`
- [ ] Hàm `calculateRoute(fromLat, fromLng, toLat, toLng)`
- [ ] Hàm `updateDronePosition(deliveryId)` - chạy mỗi 2-5 giây
- [ ] Hàm `calculateETA(currentPos, destination, speed)`
- [ ] Tích hợp Spring Scheduler để auto-update GPS

---

### ✅ Bước 1.3: Thêm Location History Tracking
**File:** `delivery-service/src/main/java/vn/cnpm/delivery_service/model/DeliveryLocationHistory.java`

**Mục đích:** Lưu lịch sử di chuyển để replay sau này

```java
- id (Long)
- deliveryId (Long)
- droneId (String)
- latitude (Double)
- longitude (Double)
- altitude (Double) // optional
- speed (Double) // km/h
- timestamp (Instant)
```

**Task checklist:**
- [ ] Tạo entity `DeliveryLocationHistory.java`
- [ ] Tạo repository
- [ ] Thêm logic lưu history mỗi lần update GPS
- [ ] API endpoint: `GET /api/deliveries/{id}/location-history`

---

### ✅ Bước 1.4: WebSocket Real-time Updates
**File:** `delivery-service/src/main/java/vn/cnpm/delivery_service/config/WebSocketConfig.java`

**Mục đích:** Push GPS updates đến frontend real-time (không cần polling)

**Task checklist:**
- [ ] Add dependency `spring-boot-starter-websocket`
- [ ] Tạo `WebSocketConfig.java`
- [ ] Tạo `DeliveryWebSocketHandler.java`
- [ ] Endpoint: `ws://localhost:8086/ws/delivery/{deliveryId}`
- [ ] Push message format: `{lat, lng, speed, status, eta, timestamp}`
- [ ] Test với Postman/WebSocket client

---

### ✅ Bước 1.5: Cải tiến DroneService
**File:** `delivery-service/src/main/java/vn/cnpm/delivery_service/service/DroneService.java`

**Cải tiến:**
- [ ] Thêm `assignAvailableDrone()` - Chọn drone gần nhất, pin > 30%
- [ ] Thêm `getDroneStatus(droneId)` - Thông tin drone realtime
- [ ] Thêm `updateDroneBattery(droneId, batteryLevel)`
- [ ] Logic tự động charge pin khi về base
- [ ] Tích hợp GPS simulation khi assign drone

---

### ✅ Bước 1.6: Bổ sung API Endpoints
**File:** `delivery-service/src/main/java/vn/cnpm/delivery_service/controller/DroneController.java` (MỚI)

**Endpoints:**
```
GET    /api/drones                    // Lấy tất cả drone
GET    /api/drones/{id}              // Chi tiết drone
POST   /api/drones                   // Tạo drone mới (admin)
PUT    /api/drones/{id}              // Cập nhật drone
DELETE /api/drones/{id}              // Xóa drone
GET    /api/drones/available         // Drone đang rảnh
GET    /api/drones/{id}/current-location  // Vị trí hiện tại
PUT    /api/drones/{id}/battery      // Cập nhật pin
```

**Task checklist:**
- [ ] Tạo `DroneController.java`
- [ ] Implement CRUD operations
- [ ] Validate input data
- [ ] Test với Postman

---

### ✅ Bước 1.7: Fix RabbitMQ Config
**File:** `delivery-service/src/main/resources/application.yml`

**Vấn đề:** Service dùng `localhost:5672` thay vì `rabbitmq` hostname

**Task checklist:**
- [ ] Sửa hostname: `spring.rabbitmq.host=rabbitmq`
- [ ] Test connection với RabbitMQ
- [ ] Verify OrderReadyEvent được consume đúng

---

## 🎨 PHASE 2: FRONTEND - UI COMPONENTS (2-3 ngày)

### ✅ Bước 2.1: Tạo Delivery Info Component
**File:** `Front_end/foodfast-app/src/components/DeliveryInfo.jsx` (MỚI)

**Mục đích:** Hiển thị thông tin delivery trong OrdersPage

**UI Elements:**
```jsx
<DeliveryInfo delivery={deliveryData}>
  - Drone ID badge
  - Status badge với màu sắc
  - Timeline (horizontal stepper):
    ✓ Assigned → ✓ Picking Up → ✓ Picked Up → ⏳ Delivering → Completed
  - ETA countdown timer
  - Current location (text): "Lat: X, Lng: Y"
  - Distance remaining
  - Drone info (battery, speed)
</DeliveryInfo>
```

**Task checklist:**
- [ ] Tạo component `DeliveryInfo.jsx`
- [ ] Design timeline UI với Tailwind
- [ ] Thêm icons (Plane, MapPin, Clock, Battery)
- [ ] Format timestamps (thư viện: `date-fns`)
- [ ] Tích hợp vào `OrdersPage.js`

---

### ✅ Bước 2.2: Tạo Map Component
**File:** `Front_end/foodfast-app/src/components/DroneMap.jsx` (MỚI)

**Mục đích:** Hiển thị vị trí drone trên bản đồ

**Thư viện:** `react-leaflet` hoặc `@vis.gl/react-google-maps`

**Features:**
- [ ] Marker vị trí drone (icon drone động)
- [ ] Marker nhà hàng (icon restaurant)
- [ ] Marker khách hàng (icon home)
- [ ] Đường đi từ restaurant → customer (polyline)
- [ ] Auto-center khi drone di chuyển
- [ ] Zoom controls

**Task checklist:**
- [ ] Cài đặt: `npm install react-leaflet leaflet`
- [ ] Tạo `DroneMap.jsx`
- [ ] Tải custom icons (drone, restaurant, home)
- [ ] Implement real-time marker update
- [ ] Test responsive design

---

### ✅ Bước 2.3: WebSocket Integration
**File:** `Front_end/foodfast-app/src/hooks/useDeliveryTracking.js` (MỚI)

**Mục đích:** Hook custom để subscribe WebSocket updates

```javascript
const useDeliveryTracking = (deliveryId) => {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState(null);
  
  useEffect(() => {
    // Connect WebSocket
    // Listen updates
    // Update state
  }, [deliveryId]);
  
  return { location, status, isConnected };
}
```

**Task checklist:**
- [ ] Tạo hook `useDeliveryTracking.js`
- [ ] Connect WebSocket: `ws://localhost:8086/ws/delivery/{id}`
- [ ] Handle reconnection khi disconnect
- [ ] Update location state khi nhận message
- [ ] Test với backend

---

### ✅ Bước 2.4: Cập nhật OrdersPage
**File:** `Front_end/foodfast-app/src/pages/OrdersPage.js`

**Thêm:**
- [ ] Import `DeliveryInfo` component
- [ ] Import `DroneMap` component
- [ ] State `deliveryInfo` cho order được chọn
- [ ] Fetch delivery khi click "View Details"
- [ ] Hiển thị DeliveryInfo bên dưới order items
- [ ] Button "Track on Map" mở modal với DroneMap

**Task checklist:**
- [ ] Thêm fetch delivery API call
- [ ] Render `<DeliveryInfo />` trong modal chi tiết order
- [ ] Thêm dialog cho map tracking
- [ ] Handle loading states
- [ ] Error handling

---

### ✅ Bước 2.5: Tạo Admin Drone Management Screen
**File:** `Front_end/foodfast-app/src/pages/AdminPage.js` - Thêm screen mới

**Features:**
- Bảng danh sách drone (Table)
  - Columns: ID, Name, Status, Battery, Location, Actions
- CRUD operations:
  - [ ] Create Drone form (dialog)
  - [ ] Edit Drone form
  - [ ] Delete confirmation
  - [ ] View active deliveries của drone
- Filters:
  - [ ] Filter by status (All, Available, Busy, Maintenance)
  - [ ] Search by drone code/name
- Statistics cards:
  - [ ] Total drones
  - [ ] Available drones
  - [ ] Active deliveries
  - [ ] Average battery level

**Task checklist:**
- [ ] Tạo `DroneManagementScreen` component
- [ ] Implement table với pagination
- [ ] Form tạo/sửa drone
- [ ] Connect với adminService API
- [ ] Add to AdminPage sidebar navigation

---

### ✅ Bước 2.6: Tạo Live Tracking Page (Tùy chọn)
**File:** `Front_end/foodfast-app/src/pages/LiveTrackingPage.jsx` (MỚI)

**Mục đích:** Trang riêng để customer xem drone real-time

**URL:** `/track/{orderId}`

**Features:**
- [ ] Full-screen map
- [ ] Drone animation di chuyển
- [ ] ETA countdown lớn
- [ ] Status updates
- [ ] Sharing link để chia sẻ

**Task checklist:**
- [ ] Tạo `LiveTrackingPage.jsx`
- [ ] Full-screen responsive layout
- [ ] Tích hợp WebSocket real-time
- [ ] Thêm route trong `App.js`
- [ ] Thêm "Track Live" button trong OrdersPage

---

## 🗄️ PHASE 3: DATABASE & MIGRATION (0.5 ngày)

### ✅ Bước 3.1: Tạo SQL Migrations
**File:** `delivery-service/src/main/resources/db/migration/V1__create_drones_table.sql`

```sql
CREATE TABLE drones (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    drone_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    status ENUM('AVAILABLE','BUSY','MAINTENANCE','OFFLINE') DEFAULT 'AVAILABLE',
    battery_level INT DEFAULT 100,
    current_lat DOUBLE,
    current_lng DOUBLE,
    max_speed DOUBLE DEFAULT 50.0,
    max_range DOUBLE DEFAULT 10.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE delivery_location_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    delivery_id BIGINT NOT NULL,
    drone_id VARCHAR(50),
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    altitude DOUBLE,
    speed DOUBLE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id),
    INDEX idx_delivery_id (delivery_id),
    INDEX idx_timestamp (timestamp)
);

-- Seed data: Tạo 5 drone mẫu
INSERT INTO drones (drone_code, name, status, battery_level, current_lat, current_lng) VALUES
('DRONE-A001', 'Sky Falcon 1', 'AVAILABLE', 95, 10.7769, 106.7009),
('DRONE-A002', 'Sky Falcon 2', 'AVAILABLE', 88, 10.7821, 106.6958),
('DRONE-A003', 'Sky Falcon 3', 'BUSY', 72, 10.7892, 106.7123),
('DRONE-A004', 'Sky Falcon 4', 'MAINTENANCE', 0, 10.7750, 106.7050),
('DRONE-A005', 'Sky Falcon 5', 'AVAILABLE', 100, 10.7800, 106.7100);
```

**Task checklist:**
- [ ] Tạo migration file
- [ ] Chạy migration trên local DB
- [ ] Verify bảng được tạo đúng
- [ ] Insert seed data

---

### ✅ Bước 3.2: Update Delivery Table
**File:** `delivery-service/src/main/resources/db/migration/V2__add_delivery_gps_fields.sql`

```sql
ALTER TABLE deliveries 
ADD COLUMN estimated_arrival TIMESTAMP,
ADD COLUMN distance_remaining DOUBLE,
ADD COLUMN current_speed DOUBLE,
ADD COLUMN route_data JSON;  -- Lưu lộ trình đã tính
```

**Task checklist:**
- [ ] Tạo migration
- [ ] Apply migration
- [ ] Update Delivery entity trong code

---

## 🧪 PHASE 4: TESTING & INTEGRATION (1 ngày)

### ✅ Bước 4.1: Backend Testing
- [ ] Test API endpoints với Postman
- [ ] Test RabbitMQ event flow
- [ ] Test WebSocket connection
- [ ] Test GPS simulation accuracy
- [ ] Load test với 10+ concurrent deliveries

### ✅ Bước 4.2: Frontend Testing
- [ ] Test UI components rendering
- [ ] Test WebSocket real-time updates
- [ ] Test map rendering trên mobile/desktop
- [ ] Test error handling (network fail, WebSocket disconnect)
- [ ] Browser compatibility (Chrome, Firefox, Safari)

### ✅ Bước 4.3: End-to-End Testing
**Scenario:**
1. Customer đặt order
2. Thanh toán thành công
3. Restaurant mark as READY
4. Backend auto-assign drone
5. Frontend hiển thị delivery info
6. WebSocket push GPS updates real-time
7. Map hiển thị drone di chuyển
8. Delivery completed
9. History được lưu

**Task checklist:**
- [ ] Test full flow manual
- [ ] Record demo video
- [ ] Fix bugs phát hiện

---

## 📦 PHASE 5: DEPLOYMENT & DOCUMENTATION (0.5 ngày)

### ✅ Bước 5.1: Docker Configuration
**File:** `docker-compose-full.yml`

```yaml
delivery-service:
  environment:
    - SPRING_RABBITMQ_HOST=rabbitmq
    - WEBSOCKET_ALLOWED_ORIGINS=http://localhost:3000,http://192.168.x.x:3000
```

**Task checklist:**
- [ ] Update docker-compose
- [ ] Test với Docker
- [ ] Verify all services connected

### ✅ Bước 5.2: Documentation
**File:** `DRONE_GPS_USER_GUIDE.md`

**Nội dung:**
- Hướng dẫn sử dụng cho customer
- Hướng dẫn quản lý drone cho admin
- API documentation
- WebSocket protocol docs
- Troubleshooting guide

**Task checklist:**
- [ ] Viết user guide
- [ ] Screenshot UI
- [ ] API examples
- [ ] Update README.md

---

## 📊 TIMELINE TỔNG HỢP

| Phase | Thời gian | Độ ưu tiên |
|-------|-----------|-----------|
| Phase 1: Backend | 1-2 ngày | 🔴 CAO |
| Phase 2: Frontend UI | 2-3 ngày | 🔴 CAO |
| Phase 3: Database | 0.5 ngày | 🟡 TRUNG BÌNH |
| Phase 4: Testing | 1 ngày | 🟢 THẤP (nhưng quan trọng) |
| Phase 5: Deploy & Docs | 0.5 ngày | 🟢 THẤP |
| **TỔNG** | **5-7 ngày** | |

---

## 🎯 MILESTONE QUAN TRỌNG

### ✅ Milestone 1: Backend GPS Working (Ngày 1-2)
- [x] Drone model created
- [x] GPS simulation service
- [x] WebSocket real-time working
- [ ] API endpoints tested

### ✅ Milestone 2: Frontend Basic UI (Ngày 3-4)
- [ ] DeliveryInfo component rendered
- [ ] Map showing drone location
- [ ] WebSocket connected

### ✅ Milestone 3: Admin Management (Ngày 5)
- [ ] Drone CRUD working
- [ ] Admin screen complete

### ✅ Milestone 4: Production Ready (Ngày 6-7)
- [ ] All tests passed
- [ ] Documentation complete
- [ ] Docker deployment working

---

## 🚀 QUICK START - BẮT ĐẦU NGAY

### Ngày 1 - Sáng (3-4 giờ):
1. ✅ **Bước 1.1:** Tạo Drone entity + repository
2. ✅ **Bước 1.7:** Fix RabbitMQ config
3. ✅ **Bước 3.1:** Tạo database migration

### Ngày 1 - Chiều (3-4 giờ):
4. ✅ **Bước 1.2:** GPS Simulation Service
5. ✅ **Bước 1.5:** Cải tiến DroneService
6. ✅ **Bước 1.6:** Tạo DroneController API

### Ngày 2 - Sáng (3-4 giờ):
7. ✅ **Bước 1.3:** Location History
8. ✅ **Bước 1.4:** WebSocket setup
9. ✅ **Test:** Backend integration

### Ngày 2 - Chiều (3-4 giờ):
10. ✅ **Bước 2.1:** Tạo DeliveryInfo component
11. ✅ **Bước 2.4:** Update OrdersPage

### Ngày 3-4: Frontend Map + WebSocket
### Ngày 5: Admin Management
### Ngày 6-7: Testing + Polish

---

## 📝 NOTES & TIPS

### 💡 Tips Quan Trọng:
1. **Commit thường xuyên** mỗi khi hoàn thành 1 bước nhỏ
2. **Test ngay** sau mỗi feature, đừng để đống lại cuối
3. **Dùng branch riêng:** `feature/drone-gps-tracking`
4. **Mock data** trước khi có backend (dễ test frontend)
5. **Console.log** là bạn tốt nhất khi debug WebSocket

### ⚠️ Vấn Đề Có Thể Gặp:
- **CORS issue:** Cấu hình WebSocket allowed origins
- **GPS không smooth:** Giảm update interval xuống 2-3s
- **Map lag:** Throttle updates, chỉ render khi change > 10m
- **RabbitMQ connection:** Kiểm tra hostname trong Docker

---

## 🎉 KẾT QUẢ MONG ĐỢI

Sau khi hoàn thành plan này, bạn sẽ có:

✅ **Backend:**
- Hệ thống quản lý drone hoàn chỉnh
- GPS tracking real-time với WebSocket
- Lịch sử di chuyển được lưu trữ
- API đầy đủ cho CRUD drone

✅ **Frontend:**
- UI hiển thị delivery info đẹp mắt
- Map tracking drone real-time
- Admin screen quản lý drone
- Live tracking page cho customer

✅ **Database:**
- Schema drone + location history
- Seed data sẵn sàng

✅ **Deployment:**
- Docker-ready
- Documentation đầy đủ

---

## 📊 TIẾN ĐỘ THỰC TẾ (CẬP NHẬT)

### ✅ ĐÃ HOÀN THÀNH CHẮC CHẮN:
- Phase 3: Database migrations (SQL files có sẵn)
- Một phần Phase 1 Backend (nếu code đã tạo)

### ⚠️ CẦN XÁC NHẬN (Kiểm tra xem file có tồn tại không):

**Backend Files:**
```
delivery-service/src/main/java/vn/cnpm/delivery_service/
├── model/
│   ├── Drone.java                          ❓
│   ├── DroneStatus.java                    ❓
│   └── DeliveryLocationHistory.java        ❓
├── repository/
│   ├── DroneRepository.java                ❓
│   └── DeliveryLocationHistoryRepository.java ❓
├── service/
│   ├── GpsSimulationService.java           ❓
│   └── DroneService.java (updated)         ❓
├── controller/
│   └── DroneController.java                ❓
└── config/
    └── WebSocketConfig.java                ❓
```

**Frontend Files:**
```
Front_end/foodfast-app/src/
├── components/
│   ├── DeliveryInfo.jsx                    ❓
│   └── DroneMap.jsx                        ❓
├── hooks/
│   └── useDeliveryTracking.js              ❓
└── pages/
    ├── OrdersPage.js (updated)             ❓
    └── LiveTrackingPage.jsx                ❓
```

### 🔍 CÁCH KIỂM TRA NHANH:

Chạy lệnh sau để kiểm tra files đã tạo:

**Backend:**
```bash
cd D:\Study\CNPM\Food-fast-delivery\delivery-service
dir /s /b | findstr "Drone"
dir /s /b | findstr "Gps"
dir /s /b | findstr "WebSocket"
```

**Frontend:**
```bash
cd D:\Study\CNPM\Food-fast-delivery\Front_end\foodfast-app
dir /s /b | findstr "Delivery"
dir /s /b | findstr "Drone"
dir /s /b | findstr "Track"
```

### 📋 CHECKLIST ĐỂ XÁC NHẬN HOÀN THÀNH:

#### Phase 1 - Backend:
- [ ] File `Drone.java` tồn tại và có đầy đủ fields
- [ ] File `GpsSimulationService.java` có logic tính toán GPS
- [ ] File `WebSocketConfig.java` đã config đúng
- [ ] RabbitMQ config dùng hostname `rabbitmq` thay vì `localhost`
- [ ] DroneController có đầy đủ 8 endpoints
- [ ] Test API với Postman thành công

#### Phase 2 - Frontend:
- [ ] Component `DeliveryInfo.jsx` render được
- [ ] Component `DroneMap.jsx` hiển thị map
- [ ] Hook `useDeliveryTracking.js` kết nối WebSocket
- [ ] OrdersPage đã tích hợp delivery tracking
- [ ] Admin có screen quản lý drone

#### Phase 3 - Database:
- [x] Migration files đã tạo *(Giả sử đã có)*
- [ ] Đã chạy migration trên database
- [ ] Có seed data 5 drone mẫu

#### Phase 4 - Testing:
- [ ] Backend API hoạt động
- [ ] Frontend UI hiển thị đúng
- [ ] WebSocket real-time working
- [ ] Full flow test thành công

---

## 🎯 CÂU TRẢ LỜI: ĐÃ CÀI ĐẶT HẾT CHƯA?

### ❌ CHƯA - Nếu:
- Files backend/frontend chưa được tạo
- Chỉ có plan mà chưa code
- Code có nhưng chưa test

### ✅ RỒI - Nếu:
- Tất cả files đã tạo và có code
- Test thành công
- UI hiển thị đúng

---

## 🚀 BƯỚC TIẾP THEO (Tùy kết quả kiểm tra):

### Nếu CHƯA có code → Bắt đầu từ Phase 1, Bước 1.1
### Nếu ĐÃ có backend → Làm tiếp Phase 2 (Frontend)
### Nếu ĐÃ có UI → Testing và polish

**👉 Hãy kiểm tra các files và cho tôi biết kết quả để tôi hỗ trợ tiếp!**
