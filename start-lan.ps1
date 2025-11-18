# Script để chạy Docker với cấu hình mạng LAN
# Cách sử dụng: .\start-lan.ps1 -ServerIP <IP-cua-may-server>
# Ví dụ: .\start-lan.ps1 -ServerIP 192.168.1.100

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP
)

$API_BASE_URL = "http://${ServerIP}:8080/api"

Write-Host "========================================" -ForegroundColor Green
Write-Host "Starting Docker with LAN configuration" -ForegroundColor Green
Write-Host "Server IP: $ServerIP" -ForegroundColor Yellow
Write-Host "API URL: $API_BASE_URL" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Stop và remove các container cũ
Write-Host "Stopping old containers..." -ForegroundColor Cyan
docker-compose -f docker-compose-full.yml down

Write-Host ""
Write-Host "Building and starting services with LAN configuration..." -ForegroundColor Cyan
$env:API_BASE_URL = $API_BASE_URL
docker-compose -f docker-compose-full.yml up -d --build

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Services started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Truy cap tu may nay: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Truy cap tu may khac trong LAN: http://${ServerIP}:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "API Gateway: http://${ServerIP}:8080" -ForegroundColor Cyan
Write-Host "Grafana: http://${ServerIP}:3001" -ForegroundColor Cyan
Write-Host "Eureka: http://${ServerIP}:8761" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green

