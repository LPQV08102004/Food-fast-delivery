# 📍 Cách Drone Lấy Tọa Độ GPS - Giải Thích Chi Tiết

## 🔍 Hiện trạng (SIMULATION)

### 1. **Lưu trữ địa chỉ trong Database**

Khi tạo đơn hàng, hệ thống lưu **địa chỉ dạng TEXT**:

```java
// Model: Delivery.java
private String restaurantAddress;    // VD: "123 Nguyễn Huệ, Q1, HCM"
private String deliveryAddress;      // VD: "456 Lê Lợi, Q1, HCM"
```

**Vấn đề:** Không có tọa độ GPS thực (latitude, longitude)!

### 2. **Parse địa chỉ → GPS (Giả lập)**

File: `GpsSimulationService.java`

```java
private GeoPoint parseAddressToGPS(String address) {
    // ❌ GIẢI LẬP: Không gọi API Geocoding thực
    
    // Tọa độ trung tâm HCM (Quận 1)
    double baseLat = 10.7769;
    double baseLng = 106.7009;

    // Hash address để có kết quả CONSISTENT
    int hash = address != null ? address.hashCode() : 0;
    Random r = new Random(hash);

    // Random offset trong phạm vi ±5km
    double lat = baseLat + (r.nextDouble() - 0.5) * 0.1;
    double lng = baseLng + (r.nextDouble() - 0.5) * 0.1;

    return new GeoPoint(lat, lng);
}
```

### 3. **Cách hoạt động hiện tại**

#### Flow:
```
Địa chỉ nhà hàng: "123 Nguyễn Huệ, Q1, HCM"
           ↓
    hashCode() = 123456789
           ↓
    Random(123456789)
           ↓
    Lat: 10.7769 + random(-0.05 to 0.05)
    Lng: 106.7009 + random(-0.05 to 0.05)
           ↓
    Kết quả: (10.8234, 106.7455)
```

**Đặc điểm:**
- ✅ **Consistent**: Cùng địa chỉ → cùng tọa độ (nhờ hash)
- ✅ **Không cần internet**: Chạy offline
- ❌ **Không chính xác**: Chỉ random gần HCM
- ❌ **Không có địa chỉ thực**: Tất cả đều trong bán kính 5km từ trung tâm HCM

### 4. **Ví dụ cụ thể**

```java
// Địa chỉ nhà hàng
String restaurantAddr = "Nhà hàng ABC, 123 Nguyễn Huệ, Q1";
GeoPoint restaurant = parseAddressToGPS(restaurantAddr);
// → (10.8012, 106.7234)  // Random nhưng consistent

// Địa chỉ khách hàng
String customerAddr = "456 Lê Lợi, Q3, HCM";
GeoPoint customer = parseAddressToGPS(customerAddr);
// → (10.7456, 106.6789)  // Random khác

// Tính khoảng cách
double distance = restaurant.distanceTo(customer);
// → 2.35 km (giả lập)
```

---

## 🌐 Giải pháp THỰC TẾ (Production)

Để có tọa độ GPS chính xác, cần dùng **Geocoding API**:

### Option 1: Google Maps Geocoding API ⭐ (Khuyến nghị)

#### Setup:
```java
import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.model.GeocodingResult;
import com.google.maps.model.LatLng;

@Service
public class GeocodingService {
    
    private final GeoApiContext context;
    
    public GeocodingService() {
        context = new GeoApiContext.Builder()
            .apiKey("YOUR_GOOGLE_API_KEY")
            .build();
    }
    
    public GeoPoint parseAddressToGPS(String address) {
        try {
            GeocodingResult[] results = GeocodingApi
                .geocode(context, address)
                .await();
                
            if (results.length > 0) {
                LatLng location = results[0].geometry.location;
                return new GeoPoint(location.lat, location.lng);
            }
        } catch (Exception e) {
            log.error("Geocoding failed for: " + address, e);
        }
        
        // Fallback to default
        return new GeoPoint(10.7769, 106.7009);
    }
}
```

#### Dependencies (pom.xml):
```xml
<dependency>
    <groupId>com.google.maps</groupId>
    <artifactId>google-maps-services</artifactId>
    <version>2.2.0</version>
</dependency>
```

#### Ví dụ:
```java
String address = "123 Nguyễn Huệ, Quận 1, TP.HCM";
GeoPoint point = geocodingService.parseAddressToGPS(address);
// → (10.7758, 106.7011)  // Tọa độ THỰC của 123 Nguyễn Huệ
```

**Chi phí:**
- Free: 40,000 requests/month
- Sau đó: $5/1000 requests

---

### Option 2: OpenStreetMap Nominatim (FREE)

```java
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public GeoPoint parseAddressToGPS(String address) {
    try {
        String url = "https://nominatim.openstreetmap.org/search?q=" 
            + URLEncoder.encode(address, "UTF-8") 
            + "&format=json&limit=1";
        
        Request request = new Request.Builder()
            .url(url)
            .header("User-Agent", "FoodFastApp/1.0")
            .build();
        
        Response response = httpClient.newCall(request).execute();
        String json = response.body().string();
        
        JsonNode[] nodes = objectMapper.readValue(json, JsonNode[].class);
        if (nodes.length > 0) {
            double lat = nodes[0].get("lat").asDouble();
            double lon = nodes[0].get("lon").asDouble();
            return new GeoPoint(lat, lon);
        }
    } catch (Exception e) {
        log.error("OSM Geocoding failed", e);
    }
    
    return new GeoPoint(10.7769, 106.7009); // Fallback
}
```

**Ưu điểm:**
- ✅ Hoàn toàn FREE
- ✅ Không cần API key

**Nhược điểm:**
- ⚠️ Rate limit: 1 request/second
- ⚠️ Độ chính xác thấp hơn Google

---

### Option 3: Goong Maps (Vietnam) 🇻🇳

API Việt Nam, tối ưu cho địa chỉ VN:

```java
// https://docs.goong.io/rest/geocode/

public GeoPoint parseAddressToGPS(String address) {
    String url = "https://rsapi.goong.io/Geocode?address=" 
        + URLEncoder.encode(address, "UTF-8")
        + "&api_key=" + GOONG_API_KEY;
    
    // Parse JSON response
    JsonNode result = restTemplate.getForObject(url, JsonNode.class);
    double lat = result.get("results").get(0)
                   .get("geometry").get("location").get("lat").asDouble();
    double lng = result.get("results").get(0)
                   .get("geometry").get("location").get("lng").asDouble();
    
    return new GeoPoint(lat, lng);
}
```

**Chi phí:**
- Free: 3,000 requests/day
- Sau đó: Liên hệ pricing

---

## 🔄 Cập nhật Database để lưu GPS

### 1. **Thêm cột GPS vào bảng `restaurants`**

```sql
ALTER TABLE restaurants 
ADD COLUMN latitude DOUBLE,
ADD COLUMN longitude DOUBLE;

-- Update tọa độ có sẵn
UPDATE restaurants 
SET latitude = 10.7758, longitude = 106.7011 
WHERE id = 1;
```

### 2. **Thêm cột GPS vào bảng `orders`**

```sql
ALTER TABLE orders 
ADD COLUMN delivery_latitude DOUBLE,
ADD COLUMN delivery_longitude DOUBLE;
```

### 3. **Update Model**

```java
@Entity
@Table(name = "restaurants")
public class Restaurant {
    // ... existing fields
    
    private String address;
    private Double latitude;   // NEW
    private Double longitude;  // NEW
}

@Entity
@Table(name = "orders")
public class Order {
    // ... existing fields
    
    private String deliveryAddress;
    private Double deliveryLatitude;   // NEW
    private Double deliveryLongitude;  // NEW
}
```

### 4. **Khi tạo đơn hàng, geocode ngay**

```java
@Service
public class OrderService {
    
    @Autowired
    private GeocodingService geocodingService;
    
    public Order createOrder(OrderDTO dto) {
        Order order = new Order();
        order.setDeliveryAddress(dto.getDeliveryAddress());
        
        // ✅ Geocode ngay khi tạo đơn
        GeoPoint customerLocation = geocodingService
            .parseAddressToGPS(dto.getDeliveryAddress());
        
        order.setDeliveryLatitude(customerLocation.getLat());
        order.setDeliveryLongitude(customerLocation.getLng());
        
        return orderRepository.save(order);
    }
}
```

---

## 📊 So sánh các phương pháp

| Phương pháp | Độ chính xác | Chi phí | Tốc độ | Offline |
|-------------|--------------|---------|--------|---------|
| **Simulation (hiện tại)** | ❌ 0% | ✅ Free | ✅✅✅ Nhanh | ✅ Có |
| **Google Maps** | ✅✅✅ 99% | 💰 $5/1000 | ✅✅ Nhanh | ❌ Không |
| **OpenStreetMap** | ✅✅ 85% | ✅ Free | ✅ Chậm | ❌ Không |
| **Goong Maps (VN)** | ✅✅✅ 95% (VN) | 💰 Paid | ✅✅ Nhanh | ❌ Không |

---

## 🎯 Khuyến nghị Implementation

### Cho Demo/Development:
✅ **Dùng Simulation (hiện tại)** - Đủ để demo chức năng

### Cho Production:
1. **Google Maps Geocoding API** (nếu có budget)
2. **Goong Maps** (tối ưu Việt Nam)
3. **Cache GPS trong DB** để giảm API calls

### Hybrid Approach (Tối ưu):

```java
public GeoPoint getRestaurantLocation(Long restaurantId) {
    Restaurant restaurant = restaurantRepo.findById(restaurantId);
    
    // 1. Check cache trong DB
    if (restaurant.getLatitude() != null && restaurant.getLongitude() != null) {
        return new GeoPoint(restaurant.getLatitude(), restaurant.getLongitude());
    }
    
    // 2. Nếu chưa có, geocode và cache
    GeoPoint location = geocodingService.parseAddressToGPS(restaurant.getAddress());
    restaurant.setLatitude(location.getLat());
    restaurant.setLongitude(location.getLng());
    restaurantRepo.save(restaurant);
    
    return location;
}
```

**Lợi ích:**
- ✅ Chỉ geocode 1 lần cho mỗi địa chỉ
- ✅ Giảm 99% API calls
- ✅ Tốc độ nhanh (từ DB)

---

## 🛠️ Code mẫu hoàn chỉnh

### GeocodingService với Google Maps:

```java
package vn.cnpm.delivery_service.service;

import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.model.GeocodingResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.cnpm.delivery_service.util.GeoPoint;

@Service
@Slf4j
public class GeocodingService {

    private final GeoApiContext context;
    
    public GeocodingService(@Value("${google.maps.api.key}") String apiKey) {
        this.context = new GeoApiContext.Builder()
            .apiKey(apiKey)
            .build();
    }

    /**
     * Convert địa chỉ text → GPS coordinates
     */
    public GeoPoint geocode(String address) {
        try {
            log.info("Geocoding address: {}", address);
            
            GeocodingResult[] results = GeocodingApi
                .geocode(context, address)
                .await();

            if (results != null && results.length > 0) {
                var location = results[0].geometry.location;
                log.info("Geocoded: {} → ({}, {})", 
                    address, location.lat, location.lng);
                return new GeoPoint(location.lat, location.lng);
            } else {
                log.warn("No geocoding results for: {}", address);
            }
            
        } catch (Exception e) {
            log.error("Geocoding failed for: {}", address, e);
        }
        
        // Fallback: HCM center
        log.warn("Using fallback location for: {}", address);
        return new GeoPoint(10.7769, 106.7009);
    }
    
    /**
     * Reverse geocoding: GPS → địa chỉ
     */
    public String reverseGeocode(double lat, double lng) {
        try {
            var latlng = new com.google.maps.model.LatLng(lat, lng);
            GeocodingResult[] results = GeocodingApi
                .reverseGeocode(context, latlng)
                .await();
                
            if (results != null && results.length > 0) {
                return results[0].formattedAddress;
            }
        } catch (Exception e) {
            log.error("Reverse geocoding failed", e);
        }
        return "Unknown location";
    }
}
```

### application.properties:

```properties
# Google Maps API
google.maps.api.key=YOUR_API_KEY_HERE
```

---

## 📝 Tóm tắt

### Hiện tại (Simulation):
```
Địa chỉ → Hash → Random offset → Tọa độ giả
```

### Production (Real GPS):
```
Địa chỉ → Google/Goong API → Tọa độ thực → Cache DB → Sử dụng
```

### Next Steps:
1. ✅ Chọn Geocoding provider (Google/Goong/OSM)
2. ✅ Đăng ký API key
3. ✅ Thêm cột GPS vào database
4. ✅ Implement GeocodingService
5. ✅ Update OrderService để geocode khi tạo đơn
6. ✅ Update RestaurantService để cache GPS
7. ✅ Test với địa chỉ thực

---

**Kết luận:** Hiện tại dùng **simulation** (đủ cho demo), nhưng production cần **Geocoding API** để có tọa độ GPS chính xác! 🗺️✨
