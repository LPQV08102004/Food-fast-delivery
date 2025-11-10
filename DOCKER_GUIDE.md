# HƯỚNG DẪN DOCKER - FOOD FAST DELIVERY

## Yêu cầu hệ thống
- Docker Desktop đã cài đặt (https://www.docker.com/products/docker-desktop)
- Docker Compose (đi kèm với Docker Desktop)
- **MySQL Server đang chạy trên máy local (Port 3306)**
- Tối thiểu 4GB RAM (giảm từ 8GB vì không chạy MySQL trong Docker)
- Tối thiểu 10GB dung lượng đĩa trống

## ⚠️ LƯU Ý QUAN TRỌNG VỀ DATABASE

Hệ thống này **SỬ DỤNG MYSQL LOCAL** trên máy của bạn, KHÔNG chạy MySQL trong Docker.

### Yêu cầu:
1. **MySQL Server phải đang chạy** trên máy local (Port 3306)
2. Các databases sau phải tồn tại:
   - `user_service`
   - `product_service`
   - `payment_service`
3. Username/Password: `root/08102004`

### Kiểm tra MySQL đang chạy:
```cmd
mysql -u root -p08102004 -e "SHOW DATABASES;"
```

### Tạo databases nếu chưa có:
```sql
CREATE DATABASE IF NOT EXISTS user_service;
CREATE DATABASE IF NOT EXISTS product_service;
CREATE DATABASE IF NOT EXISTS payment_service;
```

## Cấu trúc hệ thống

### Backend Services (Java/Spring Boot) - **TRONG DOCKER**:
- **Eureka Service** (Port 8761): Service Discovery
- **API Gateway** (Port 8080): API Gateway chính
- **User Service** (Port 8081): Quản lý người dùng → Kết nối MySQL local
- **Product Service** (Port 8082): Quản lý sản phẩm/nhà hàng → Kết nối MySQL local
- **Order Service** (Port 8083): Quản lý đơn hàng (H2 in-memory)
- **Payment Service** (Port 8084): Quản lý thanh toán → Kết nối MySQL local

### Frontend Service (React/Vue) - **TRONG DOCKER**:
- **Food Fast App** (Port 3000): Ứng dụng chính (khách hàng, admin, nhà hàng)

### Database - **TRÊN MÁY LOCAL (KHÔNG TRONG DOCKER)**:
- **MySQL Server** (Port 3306): Chạy trên máy Windows của bạn
  - Database: user_service, product_service, payment_service
  - Username: root
  - Password: 08102004

### Message Broker - **TRONG DOCKER**:
- **RabbitMQ** (Port 5672, 15672): Message broker

## CÁCH SỬ DỤNG

### 0. QUAN TRỌNG: Kiểm tra MySQL trước khi bắt đầu

**Bước 1: Kiểm tra MySQL đang chạy**
```cmd
mysql -u root -p08102004 -e "SELECT VERSION();"
```

**Bước 2: Đảm bảo các databases tồn tại**
```cmd
mysql -u root -p08102004 -e "CREATE DATABASE IF NOT EXISTS user_service; CREATE DATABASE IF NOT EXISTS product_service; CREATE DATABASE IF NOT EXISTS payment_service;"
```

**Bước 3: Kiểm tra kết nối**
```cmd
mysql -u root -p08102004 -e "SHOW DATABASES LIKE '%service%';"
```

### 1. Build và khởi động toàn bộ hệ thống

Mở Command Prompt tại thư mục gốc của project và chạy:

```cmd
docker-compose up -d --build
```

Lệnh này sẽ:
- Build tất cả các Docker images
- Khởi động tất cả các containers
- Các backend services sẽ tự động kết nối đến MySQL trên máy local
- Chạy ở chế độ background (-d)

### 2. Xem logs của các services

Xem logs tất cả services:
```cmd
docker-compose logs -f
```

Xem logs của một service cụ thể:
```cmd
docker-compose logs -f user-service
docker-compose logs -f api-gateway
docker-compose logs -f foodfast-app
```

### 3. Kiểm tra trạng thái các containers

```cmd
docker-compose ps
```

### 4. Dừng hệ thống

Dừng nhưng giữ lại data:
```cmd
docker-compose stop
```

Dừng và xóa containers (DATA TRONG MYSQL VẪN GIỮ NGUYÊN):
```cmd
docker-compose down
```

### 5. Khởi động lại hệ thống

```cmd
docker-compose start
```

### 6. Rebuild một service cụ thể

```cmd
docker-compose up -d --build user-service
```

### 7. Truy cập các ứng dụng

Sau khi hệ thống khởi động thành công (khoảng 2-3 phút):

- **Ứng dụng chính**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Eureka Dashboard**: http://localhost:8761
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## TROUBLESHOOTING

### 1. Lỗi "Communications link failure" hoặc không kết nối được MySQL

**Nguyên nhân**: MySQL trên máy local không chạy hoặc containers không thể kết nối.

**Giải pháp**:
```cmd
# Kiểm tra MySQL đang chạy
net start | findstr MySQL

# Khởi động MySQL nếu chưa chạy
net start MySQL80

# Kiểm tra kết nối
mysql -u root -p08102004 -e "SELECT 1;"
```

### 2. Lỗi "Access denied for user 'root'@'...'

**Nguyên nhân**: Password MySQL không đúng hoặc user không có quyền.

**Giải pháp**: 
- Kiểm tra password trong file `docker-compose.yml` có khớp với MySQL của bạn không
- Nếu password khác `08102004`, sửa trong file docker-compose.yml

### 3. Lỗi "Unknown database 'user_service'"

**Nguyên nhân**: Database chưa được tạo.

**Giải pháp**:
```cmd
mysql -u root -p08102004 -e "CREATE DATABASE user_service; CREATE DATABASE product_service; CREATE DATABASE payment_service;"
```

### 4. Port đã được sử dụng

Nếu gặp lỗi port đã được sử dụng, bạn có thể:
- Tắt ứng dụng đang dùng port đó
- Hoặc sửa port trong file `docker-compose.yml`

### 5. Service không khởi động

Kiểm tra logs:
```cmd
docker-compose logs service-name
```

Restart service:
```cmd
docker-compose restart service-name
```

### 6. Xóa và build lại từ đầu

```cmd
docker-compose down
docker-compose up -d --build
```

**LƯU Ý**: Data trong MySQL local không bị ảnh hưởng!

### 7. Kiểm tra health của services

```cmd
docker ps
```

Cột STATUS sẽ hiển thị health status của mỗi container.

## THÔNG TIN DATABASE

### Kết nối MySQL từ máy local:
- **Host**: localhost:3306
- **Username**: root
- **Password**: 08102004
- **Databases**: 
  - user_service
  - product_service
  - payment_service

### Kết nối từ Docker containers:
- **Host**: host.docker.internal:3306
- (Các thông tin khác giống trên)

**Lưu ý**: Containers Docker sử dụng `host.docker.internal` để kết nối đến services trên máy host.

## LƯU Ý QUAN TRỌNG

1. **MySQL phải chạy trước**: Đảm bảo MySQL Server đang chạy trên máy trước khi start Docker containers.

2. **Thứ tự khởi động**: Docker Compose sẽ tự động đảm bảo thứ tự khởi động đúng:
   - RabbitMQ → Eureka → Backend Services → API Gateway → Frontend

3. **Thời gian khởi động**: Lần đầu build sẽ mất 10-15 phút. Những lần sau nhanh hơn (2-3 phút).

4. **RAM**: Hệ thống cần tối thiểu 4GB RAM (giảm nhiều so với việc chạy MySQL trong Docker).

5. **Data persistence**: 
   - Data MySQL: Lưu trên máy local, an toàn tuyệt đối
   - RabbitMQ data: Lưu trong Docker volume

6. **Backup dễ dàng**: Vì dùng MySQL local, bạn có thể backup bằng các công cụ quen thuộc.

## CẬP NHẬT CODE

Sau khi thay đổi code:

1. Backend service:
```cmd
docker-compose up -d --build user-service
```

2. Frontend:
```cmd
docker-compose up -d --build foodfast-app
```

3. Tất cả services:
```cmd
docker-compose up -d --build
```

## BACKUP VÀ RESTORE DATABASE

Vì sử dụng MySQL local, bạn có thể backup như bình thường:

### Backup:
```cmd
mysqldump -u root -p08102004 user_service > backup_user_service.sql
mysqldump -u root -p08102004 product_service > backup_product_service.sql
mysqldump -u root -p08102004 payment_service > backup_payment_service.sql
```

### Restore:
```cmd
mysql -u root -p08102004 user_service < backup_user_service.sql
mysql -u root -p08102004 product_service < backup_product_service.sql
mysql -u root -p08102004 payment_service < backup_payment_service.sql
```

## CHUYỂN ĐỔI SANG MYSQL TRONG DOCKER (TÙY CHỌN)

Nếu sau này bạn muốn chuyển MySQL vào Docker, tôi có thể cung cấp file docker-compose.yml khác.

**Ưu điểm MySQL trong Docker**:
- Độc lập hoàn toàn, dễ deploy
- Không phụ thuộc vào MySQL local
- Dễ dàng scale và replicate

**Nhược điểm**:
- Cần nhiều RAM hơn
- Phải migrate data hiện tại

## HỖ TRỢ

Nếu gặp vấn đề, kiểm tra:
1. **MySQL Server đang chạy** (Quan trọng nhất!)
2. Docker Desktop đang chạy
3. Đủ dung lượng đĩa
4. Đủ RAM
5. Không có conflict về port
6. Databases đã được tạo
7. Xem logs để biết lỗi cụ thể: `docker-compose logs -f`
