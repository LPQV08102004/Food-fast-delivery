# ==============================================================
# HƯỚNG DẪN SỬ DỤNG - Food Fast Delivery
# ==============================================================

## 🎯 MỤC ĐÍCH
Project này được cấu hình linh hoạt để hỗ trợ 2 chế độ:
1. **LOCALHOST**: Mỗi người chạy độc lập trên máy của mình
2. **LAN**: Chia sẻ qua mạng LAN để team cùng test

---

## 📋 YÊU CẦU
- Docker Desktop đã cài đặt và đang chạy
- PowerShell (cho Windows)
- Kết nối mạng (cho chế độ LAN)

---

## 🖥️ CHẠY TRÊN LOCALHOST (Độc lập)

### Khi nào dùng?
- Khi bạn muốn code và test riêng trên máy mình
- Không cần chia sẻ với người khác
- Làm việc offline

### Cách chạy:
```powershell
.\start-localhost.ps1
```

### Truy cập:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- Eureka: http://localhost:8761

### Lưu ý:
- Máy khác KHÔNG thể truy cập được
- Mỗi người trong team chạy script này trên máy riêng

---

## 🌐 CHẠY TRÊN MẠNG LAN (Chia sẻ)

### Khi nào dùng?
- Khi muốn chia sẻ cho team cùng test
- Demo cho người khác xem
- Test từ nhiều thiết bị (laptop, điện thoại, máy khác)

### Cách chạy:

#### Cách 1: Tự động (Khuyến nghị)
```powershell
.\start-docker-lan.ps1
```
Script sẽ **tự động phát hiện IP** của máy bạn

#### Cách 2: Thủ công
```powershell
.\start-lan.ps1 -ServerIP 192.168.1.100
```
(Thay 192.168.1.100 bằng IP thật của máy bạn)

### Xem IP của máy:
```powershell
ipconfig
```
Tìm dòng "IPv4 Address" (VD: 192.168.1.100 hoặc 192.168.31.18)

### Truy cập:

**Từ máy server (máy chạy Docker):**
- http://localhost:3000

**Từ máy khác trong mạng LAN:**
- http://192.168.1.100:3000 (thay IP cho đúng)
- http://192.168.1.100:8080

---

## 🔧 CẤU HÌNH CHI TIẾT

### File cấu hình:
1. **`.env.localhost`** - Cấu hình cho localhost
2. **`.env.lan`** - Cấu hình cho LAN (có thể chỉnh IP thủ công)
3. **`.env`** - File hiện tại đang dùng (tự động tạo khi chạy script)

### Cấu trúc:
```
docker-compose-full.yml  - File Docker Compose chính (dùng biến môi trường)
start-localhost.ps1      - Script chạy localhost
start-docker-lan.ps1     - Script chạy LAN (tự động)
start-lan.ps1           - Script chạy LAN (thủ công)
.env.localhost          - Config localhost
.env.lan                - Config LAN
```

---

## 📱 TRUY CẬP TỪ ĐIỆN THOẠI

1. Chạy chế độ LAN trên máy server
2. Điện thoại kết nối cùng WiFi
3. Mở trình duyệt trên điện thoại
4. Truy cập: http://192.168.1.100:3000

---

## 🛠️ LỆNH HỮU ÍCH

### Xem logs:
```powershell
docker-compose -f docker-compose-full.yml logs -f
docker-compose -f docker-compose-full.yml logs -f user-service
```

### Dừng tất cả:
```powershell
docker-compose -f docker-compose-full.yml down
```

### Xóa volumes (reset database):
```powershell
docker-compose -f docker-compose-full.yml down -v
```

### Rebuild service cụ thể:
```powershell
docker-compose -f docker-compose-full.yml build delivery-service
docker-compose -f docker-compose-full.yml up -d delivery-service
```

---

## 🎓 VÍ DỤ SỬ DỤNG TRONG TEAM

### Tình huống 1: Mỗi người code riêng
```
Người A: chạy .\start-localhost.ps1 trên máy A
Người B: chạy .\start-localhost.ps1 trên máy B
Người C: chạy .\start-localhost.ps1 trên máy C
→ Mỗi người có môi trường riêng, không ảnh hưởng nhau
```

### Tình huống 2: Demo chung cho team
```
Người A (máy mạnh): chạy .\start-docker-lan.ps1
                    IP của A: 192.168.1.100
Người B, C, D: mở browser → http://192.168.1.100:3000
→ Cả team cùng xem và test trên 1 server
```

### Tình huống 3: Test từ điện thoại
```
Máy laptop: chạy .\start-docker-lan.ps1
Điện thoại: kết nối WiFi → http://192.168.1.100:3000
→ Test responsive design
```

---

## ❗ XỬ LÝ LỖI

### Lỗi: "Docker is not running"
→ Mở Docker Desktop

### Lỗi: "Port already in use"
→ Dừng container cũ: `docker-compose -f docker-compose-full.yml down`

### Lỗi: "Cannot connect to API"
→ Kiểm tra IP có đúng không (ipconfig)
→ Kiểm tra firewall có chặn port 8080, 3000 không

### Máy khác không truy cập được
→ Tắt Windows Firewall tạm thời
→ Kiểm tra cùng mạng WiFi/LAN

---

## 📞 HỖ TRỢ
Nếu gặp vấn đề, kiểm tra:
1. Docker Desktop có đang chạy không?
2. Đã chạy đúng script chưa?
3. IP có đúng không? (chạy `ipconfig`)
4. Firewall có chặn không?
