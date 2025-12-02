# GPS Coordinates Fix - Giải quyết lỗi bản đồ hiển thị sai vị trí

## 🐛 Vấn đề ban đầu

Khi mở bản đồ tracking drone, bản đồ hiển thị:
- **Drone**: ở Hồ Chí Minh ✅
- **Nhà hàng và Điểm giao hàng**: ở Hà Nội ❌ (Hardcoded)

Kết quả: Bản đồ hiển thị drone bay từ HCM lên Hà Nội (~1,600km) - hoàn toàn sai!

## 🔧 Nguyên nhân

1. **Backend**: Model `Delivery.java` không có trường lưu GPS của nhà hàng và khách hàng
2. **Frontend**: `DroneMap.jsx` sử dụng tọa độ hardcoded thay vì GPS thực từ backend
3. **Database**: Thiếu các cột `restaurant_lat`, `restaurant_lng`, `delivery_lat`, `delivery_lng`

```javascript
// ❌ Code cũ - Hardcoded GPS
const restaurantPosition = [10.7769, 106.7009]; // Luôn là HCM center
const customerPosition = [10.7245, 106.7412];   // Luôn là HCM area
```

## ✅ Giải pháp đã thực hiện

### 1. Cập nhật Backend Model

**File**: `delivery-service/src/main/java/vn/cnpm/delivery_service/model/Delivery.java`

Thêm 4 trường GPS mới:

```java
// Restaurant GPS
private Double restaurantLat;
private Double restaurantLng;

// Customer GPS  
private Double deliveryLat;
private Double deliveryLng;
```

### 2. Parse GPS từ địa chỉ khi tạo Delivery

**File**: `delivery-service/src/main/java/vn/cnpm/delivery_service/messaging/OrderReadyEventConsumer.java`

```java
// Parse địa chỉ thành GPS coordinates
GeoPoint restaurantGPS = gpsSimulationService.parseAddressToGPS(event.getRestaurantAddress());
GeoPoint customerGPS = gpsSimulationService.parseAddressToGPS(event.getDeliveryAddress());

Delivery delivery = Delivery.builder()
    .orderId(event.getOrderId())
    .restaurantLat(restaurantGPS.getLat())
    .restaurantLng(restaurantGPS.getLng())
    .deliveryLat(customerGPS.getLat())
    .deliveryLng(customerGPS.getLng())
    // ... other fields
    .build();
```

### 3. GPS Simulation Service

**File**: `delivery-service/src/main/java/vn/cnpm/delivery_service/service/GpsSimulationService.java`

Method `parseAddressToGPS()` đã được thay đổi từ `private` → `public`:

```java
public GeoPoint parseAddressToGPS(String address) {
    // Base: HCM center (10.7769, 106.7009)
    // Random offset: ±0.1 degrees (~10km)
    // Hash-based để consistent (cùng address = cùng GPS)
    
    double baseLat = 10.7769;
    double baseLng = 106.7009;
    
    int hash = address != null ? address.hashCode() : 0;
    Random r = new Random(hash);
    
    double lat = baseLat + (r.nextDouble() - 0.5) * 0.1;
    double lng = baseLng + (r.nextDouble() - 0.5) * 0.1;
    
    return new GeoPoint(lat, lng);
}
```

**Lưu ý**: Production nên dùng Google Geocoding API hoặc OpenStreetMap Nominatim.

### 4. Database Migration

**File**: `delivery-service/migration_add_gps_fields.sql`

```sql
ALTER TABLE deliveries 
ADD COLUMN restaurant_lat DOUBLE DEFAULT NULL AFTER restaurant_address,
ADD COLUMN restaurant_lng DOUBLE DEFAULT NULL AFTER restaurant_lat,
ADD COLUMN delivery_lat DOUBLE DEFAULT NULL AFTER delivery_full_name,
ADD COLUMN delivery_lng DOUBLE DEFAULT NULL AFTER delivery_lat;
```

**Chạy migration**:

```powershell
Get-Content delivery-service/migration_add_gps_fields.sql | `
  docker exec -i mysql mysql -uroot -p08102004 delivery_service
```

### 5. Cập nhật Frontend

**File**: `Front_end/foodfast-app/src/components/DroneMap.jsx`

Thay đổi từ hardcoded sang dynamic GPS:

```javascript
// ✅ Code mới - Lấy GPS thực từ backend
const restaurantPosition = deliveryData.restaurantLat && deliveryData.restaurantLng
  ? [deliveryData.restaurantLat, deliveryData.restaurantLng]
  : [10.7769, 106.7009]; // Fallback

const customerPosition = deliveryData.deliveryLat && deliveryData.deliveryLng
  ? [deliveryData.deliveryLat, deliveryData.deliveryLng]
  : [10.7245, 106.7412]; // Fallback
```

## 🚀 Build & Deploy

### Backend

```powershell
# Build Java service
cd delivery-service
mvn clean package -DskipTests

# Rebuild Docker image
cd ..
docker-compose -f docker-compose-full.yml build delivery-service

# Restart container
docker-compose -f docker-compose-full.yml up -d delivery-service
```

### Frontend

```powershell
# Build React app
cd Front_end/foodfast-app
npm run build

# Rebuild Docker image
cd ../..
docker-compose -f docker-compose-full.yml build frontend

# Restart container
docker-compose -f docker-compose-full.yml up -d frontend
```

## ✅ Kết quả

Sau khi deploy:

1. ✅ **Nhà hàng GPS**: Lấy từ `deliveryData.restaurantLat/Lng`
2. ✅ **Khách hàng GPS**: Lấy từ `deliveryData.deliveryLat/Lng`
3. ✅ **Drone GPS**: Lấy từ `deliveryData.currentLat/Lng` (update real-time)
4. ✅ **Tất cả vị trí** đều trong khu vực HCM (±10km từ center)
5. ✅ **Bản đồ hiển thị chính xác** route ngắn trong thành phố

## 🧪 Test

### 1. Tạo đơn hàng mới

```bash
# Đơn hàng mới sẽ tự động parse GPS từ địa chỉ nhà hàng và khách hàng
```

### 2. Kiểm tra database

```sql
SELECT 
  id, 
  order_id,
  restaurant_address,
  restaurant_lat,
  restaurant_lng,
  delivery_address,
  delivery_lat,
  delivery_lng
FROM deliveries
ORDER BY id DESC
LIMIT 5;
```

### 3. Xem bản đồ

- Vào trang **Orders** → Click **Xem chi tiết** → Mở bản đồ
- Kiểm tra 3 markers:
  - 🍽️ **Nhà hàng** (green): Phải ở HCM area
  - 📍 **Khách hàng** (red): Phải ở HCM area  
  - 🚁 **Drone** (blue): Di chuyển giữa 2 điểm

### 4. Xác nhận GPS

```powershell
# Check Hibernate query có chứa GPS fields
docker logs delivery-service --tail 20 | Select-String "restaurant_lat"
```

Kết quả mong đợi:

```sql
Hibernate: select d1_0.id,...,d1_0.restaurant_lat,d1_0.restaurant_lng,...,d1_0.delivery_lat,d1_0.delivery_lng,...
```

## 📝 Lưu ý quan trọng

### GPS Simulation (Demo mode)

Hiện tại đang dùng **hash-based random GPS** cho demo:

- ✅ Consistent: Cùng address → Cùng GPS
- ✅ Random trong ±10km HCM center
- ❌ Không chính xác địa chỉ thực

### Production - Dùng Geocoding API

Thay method `parseAddressToGPS()` bằng real API:

```java
// Option 1: Google Maps Geocoding API
// $5/1000 requests (40,000 free/month)
// https://developers.google.com/maps/documentation/geocoding

// Option 2: OpenStreetMap Nominatim (Free)
// https://nominatim.openstreetmap.org/

// Option 3: Goong Maps (Vietnam optimized)
// 3,000 requests/day free
// https://docs.goong.io/
```

### Cache GPS để tránh duplicate calls

```java
@Service
public class GeocodingService {
    
    private final Map<String, GeoPoint> cache = new ConcurrentHashMap<>();
    
    public GeoPoint geocode(String address) {
        return cache.computeIfAbsent(address, this::callGeocodingAPI);
    }
    
    private GeoPoint callGeocodingAPI(String address) {
        // Call Google/Goong API here
    }
}
```

## 🎯 Summary

| Thành phần | Trước | Sau |
|-----------|-------|-----|
| Backend Model | Không có GPS fields | Có `restaurant_lat/lng`, `delivery_lat/lng` |
| Database | Không có GPS columns | Có 4 cột GPS mới |
| GPS Parsing | Không có | Hash-based simulation |
| Frontend Map | Hardcoded GPS | Dynamic từ backend |
| Route Display | Sai (HCM → HN) | Đúng (local HCM) |

## 🔄 Next Steps (Optional)

1. ✅ Thêm geocoding API thực cho production
2. ✅ Cache GPS để giảm API calls
3. ✅ Validate GPS coordinates trước khi save
4. ✅ Add logging cho GPS parsing errors
5. ✅ Test với địa chỉ thật ở các thành phố khác

---

**Updated**: 2025-12-02  
**Status**: ✅ Fixed and Deployed
