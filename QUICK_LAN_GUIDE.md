# Hướng Dẫn Nhanh: Chạy Web qua Mạng LAN

## Vấn đề đã giải quyết
✅ Frontend không thể kết nối database/backend khi truy cập qua LAN
✅ Cấu hình CORS cho phép truy cập từ các IP trong mạng LAN
✅ Environment variables để thay đổi API URL linh hoạt

## Cách sử dụng

### Bước 1: Xác định IP của máy server
```cmd
ipconfig
```
Tìm IPv4 Address (ví dụ: `192.168.1.100`)

### Bước 2: Chạy Docker với cấu hình LAN

**Cách 1: Dùng script tự động (Khuyến nghị)**
```cmd
start-lan.bat 192.168.1.100
```

Hoặc PowerShell:
```powershell
.\start-lan.ps1 -ServerIP 192.168.1.100
```

**Cách 2: Chạy thủ công**
```cmd
set API_BASE_URL=http://192.168.1.100:8080/api
docker-compose -f docker-compose-full.yml down
docker-compose -f docker-compose-full.yml up -d --build
```

### Bước 3: Truy cập từ máy khác trong mạng LAN
```
http://192.168.1.100:3000
```

## Các thay đổi đã thực hiện

1. **Frontend (api.js)**: Sử dụng `process.env.REACT_APP_API_BASE_URL` thay vì hardcode localhost
2. **Dockerfile**: Thêm ARG/ENV để nhận API URL khi build
3. **docker-compose-full.yml**: Thêm environment variable `API_BASE_URL`
4. **API Gateway (CORS)**: Cho phép request từ các IP dải mạng LAN (192.168.x.x, 10.x.x.x, 172.16.x.x)

## Kiểm tra

Test API từ máy khác:
```cmd
curl http://192.168.1.100:8080/api/categories
```

## Lưu ý quan trọng

⚠️ **Windows Firewall**: Nếu không kết nối được, mở PowerShell (Administrator) và chạy:
```powershell
New-NetFirewallRule -DisplayName "Docker API Gateway" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Docker Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

⚠️ **IP động**: Nếu IP thay đổi sau khi restart, cần build lại với IP mới

⚠️ **MySQL từ LAN**: Kết nối MySQL từ máy khác:
- Host: `192.168.1.100`
- Port: `3307`
- User: `root`
- Password: `08102004`

## Troubleshooting

❌ **"Failed to fetch"**: Kiểm tra firewall và ping server
❌ **CORS Error**: Đã fix trong api-gateway, rebuild lại: `docker-compose up -d --build api-gateway`
❌ **Cannot connect to MySQL**: MySQL đã được cấu hình bind 0.0.0.0, kiểm tra port 3307

## Các file đã tạo/sửa

- ✅ `.env` - File cấu hình mặc định
- ✅ `.env.example` - Hướng dẫn cấu hình
- ✅ `start-lan.bat` - Script chạy tự động (Windows CMD)
- ✅ `start-lan.ps1` - Script chạy tự động (PowerShell)
- ✅ `LAN_ACCESS_GUIDE.md` - Hướng dẫn chi tiết
- ✅ `api.js` - Sử dụng environment variable
- ✅ `Dockerfile` - Hỗ trợ build-time arguments
- ✅ `docker-compose-full.yml` - Thêm API_BASE_URL variable
- ✅ `application.yml` (api-gateway) - Fix CORS cho LAN

Thay `192.168.1.100` bằng IP thực tế của máy server của bạn!

