# ==============================================================
# Food Fast Delivery - Start on Localhost
# Script này dùng để chạy project trên localhost
# Mỗi người trong team chạy trên máy riêng của họ
# ==============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting on LOCALHOST Mode" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Docker
Write-Host "🔍 Checking Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running! Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Copy .env.localhost thành .env
Write-Host "📝 Setting up localhost configuration..." -ForegroundColor Yellow
Copy-Item .env.localhost .env -Force
Write-Host "✅ Configuration set to LOCALHOST mode" -ForegroundColor Green
Write-Host ""

# Dừng containers cũ
Write-Host "🛑 Stopping old containers..." -ForegroundColor Yellow
docker-compose -f docker-compose-full.yml down
Write-Host ""

# Build và start
Write-Host "🔨 Building and starting services..." -ForegroundColor Yellow
Write-Host "⏳ This may take a few minutes..." -ForegroundColor Cyan
docker-compose -f docker-compose-full.yml up --build -d

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Started successfully on LOCALHOST!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Access URLs (from this machine only):" -ForegroundColor Cyan
Write-Host "   Frontend:        http://localhost:3000" -ForegroundColor White
Write-Host "   API Gateway:     http://localhost:8080" -ForegroundColor White
Write-Host "   Eureka:          http://localhost:8761" -ForegroundColor White
Write-Host "   RabbitMQ:        http://localhost:15672 (admin/admin123)" -ForegroundColor White
Write-Host "   Grafana:         http://localhost:3001 (admin/admin123)" -ForegroundColor White
Write-Host "   Prometheus:      http://localhost:9090" -ForegroundColor White
Write-Host "   Kibana:          http://localhost:5601" -ForegroundColor White
Write-Host ""
Write-Host "💡 Note: This runs on your local machine only." -ForegroundColor Yellow
Write-Host "   Other team members cannot access from their machines." -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 View logs:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose-full.yml logs -f [service-name]" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Stop all:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose-full.yml down" -ForegroundColor White
Write-Host ""

# Hiển thị trạng thái
Write-Host "📦 Container status:" -ForegroundColor Cyan
Start-Sleep -Seconds 3
docker-compose -f docker-compose-full.yml ps
