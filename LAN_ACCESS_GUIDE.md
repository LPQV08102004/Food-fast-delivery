# Hướng Dẫn Chạy Web qua Mạng LAN

## Vấn đề
Khi chạy Docker trên một máy và truy cập từ máy khác qua mạng LAN, frontend không thể kết nối đến backend vì đang sử dụng `localhost`.

## Giải pháp

### Bước 1: Xác định địa chỉ IP của máy chạy Docker

**Trên Windows (máy chạy Docker):**
```cmd
ipconfig
```
Tìm địa chỉ IPv4 của card mạng đang kết nối LAN (thường là 192.168.x.x hoặc 10.0.x.x)

Ví dụ: `192.168.1.100`

### Bước 2: Cấu hình Frontend

#### Option 1: Chạy Development Mode (không dùng Docker)

1. Mở file `.env` trong thư mục `Front_end/foodfast-app/`
2. Thay đổi dòng:
   ```
   REACT_APP_API_BASE_URL=http://192.168.1.100:8080/api
   ```
   (Thay `192.168.1.100` bằng IP thực tế của máy server)

3. Chạy frontend:
   ```cmd
   cd Front_end\foodfast-app
   npm install
   npm start
   ```

4. Truy cập từ máy khác: `http://192.168.1.100:3000`

#### Option 2: Chạy với Docker (Production Mode)

1. Build lại image với environment variable:
   ```cmd
   cd Front_end\foodfast-app
   docker build --build-arg REACT_APP_API_BASE_URL=http://192.168.1.100:8080/api -t foodfast-frontend .
   ```

2. Hoặc cập nhật docker-compose-full.yml để thêm environment variable

### Bước 3: Đảm bảo Windows Firewall cho phép kết nối

Mở Windows Firewall và cho phép các cổng:
- 8080 (API Gateway)
- 3000 (Frontend)
- 3306/3307 (MySQL nếu cần truy cập trực tiếp)

**Lệnh PowerShell (Chạy với quyền Administrator):**
```powershell
New-NetFirewallRule -DisplayName "Docker API Gateway" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Docker Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Bước 4: Truy cập từ máy khác trong mạng LAN

Từ máy khác trong mạng LAN, mở trình duyệt và truy cập:
```
http://192.168.1.100:3000
```

## Lưu ý quan trọng

1. **Địa chỉ IP có thể thay đổi**: Nếu máy server sử dụng DHCP, IP có thể thay đổi sau khi khởi động lại. Nên cấu hình IP tĩnh hoặc dùng hostname.

2. **Docker Network**: Các container trong Docker có thể giao tiếp với nhau qua tên service (như `mysql`, `api-gateway`), nhưng từ bên ngoài phải dùng IP của máy host.

3. **MySQL từ LAN**: Nếu muốn kết nối MySQL từ máy khác:
   - Sử dụng cổng 3307 (đã map trong docker-compose)
   - Host: `192.168.1.100`
   - Port: `3307`
   - Username: `root`
   - Password: `08102004`

## Kiểm tra kết nối

Test API từ máy khác:
```cmd
curl http://192.168.1.100:8080/api/health
```

Hoặc mở trình duyệt: `http://192.168.1.100:8080/api/health`

## Troubleshooting

### Vấn đề 1: Không kết nối được
- Kiểm tra firewall
- Ping máy server: `ping 192.168.1.100`
- Kiểm tra Docker container đang chạy: `docker ps`

### Vấn đề 2: CORS Error
API Gateway phải được cấu hình để chấp nhận request từ IP khác. Kiểm tra file cấu hình CORS trong api-gateway.

### Vấn đề 3: MySQL Connection Timeout
- Đảm bảo MySQL container bind đến 0.0.0.0 (đã cấu hình trong docker-compose)
- Kiểm tra MySQL user có quyền kết nối từ host khác

