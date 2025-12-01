# Script để khởi động project trên LAN với Docker
# Chạy lệnh: .\start-docker-lan.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Food Fast Delivery - Docker LAN Startup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Lấy địa chỉ IP LAN
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet*","Wi-Fi*" | 
    Where-Object { $_.IPAddress -notlike "169.254.*" -and $_.IPAddress -ne "127.0.0.1" } | 
    Select-Object -First 1).IPAddress

if (-not $ipAddress) {
    Write-Host "❌ Không tìm thấy địa chỉ IP LAN!" -ForegroundColor Red
    Write-Host "Vui lòng kiểm tra kết nối mạng của bạn." -ForegroundColor Yellow
    exit 1
}

Write-Host "📡 Địa chỉ IP LAN của bạn: $ipAddress" -ForegroundColor Green
Write-Host ""

# Tạo file .env với IP tự động
Write-Host "📝 Setting up LAN configuration..." -ForegroundColor Yellow
$apiUrl = "http://${ipAddress}:8080/api"
Set-Content -Path .env -Value "API_BASE_URL=$apiUrl"
Write-Host "✅ Configuration set to LAN mode: $apiUrl" -ForegroundColor Green
Write-Host ""

# Kiểm tra Docker đang chạy
Write-Host "🔍 Kiểm tra Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✅ Docker đang chạy" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker chưa chạy! Vui lòng khởi động Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Dừng các container đang chạy (nếu có)
Write-Host "🛑 Dừng các container cũ..." -ForegroundColor Yellow
docker-compose -f docker-compose-full.yml down
Write-Host ""

# Rebuild và khởi động
Write-Host "🔨 Build và khởi động các services..." -ForegroundColor Yellow
Write-Host "⏳ Quá trình này có thể mất vài phút..." -ForegroundColor Cyan
docker-compose -f docker-compose-full.yml up --build -d

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Khởi động thành công!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Truy cập từ máy này:" -ForegroundColor Cyan
Write-Host "   Frontend:        http://localhost:3000" -ForegroundColor White
Write-Host "   API Gateway:     http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Truy cập từ máy khác trong LAN:" -ForegroundColor Cyan
Write-Host "   Frontend:        http://${ipAddress}:3000" -ForegroundColor Yellow
Write-Host "   API Gateway:     http://${ipAddress}:8080" -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 Các công cụ monitoring:" -ForegroundColor Cyan
Write-Host "   Eureka:          http://${ipAddress}:8761" -ForegroundColor White
Write-Host "   RabbitMQ UI:     http://${ipAddress}:15672 (admin/admin123)" -ForegroundColor White
Write-Host "   Grafana:         http://${ipAddress}:3001 (admin/admin123)" -ForegroundColor White
Write-Host "   Prometheus:      http://${ipAddress}:9090" -ForegroundColor White
Write-Host "   Kibana:          http://${ipAddress}:5601" -ForegroundColor White
Write-Host ""
Write-Host "📊 Xem logs:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose-full.yml logs -f [service-name]" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Dừng tất cả:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose-full.yml down" -ForegroundColor White
Write-Host ""

# Hiển thị trạng thái các container
Write-Host "📦 Trạng thái các containers:" -ForegroundColor Cyan
Start-Sleep -Seconds 3
docker-compose -f docker-compose-full.yml ps
