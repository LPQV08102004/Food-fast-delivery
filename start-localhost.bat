@echo off
REM ==============================================================
REM Food Fast Delivery - Start on Localhost
REM Script này dùng để chạy project trên localhost
REM Mỗi người trong team chạy trên máy riêng của họ
REM ==============================================================

echo ========================================
echo Starting on LOCALHOST Mode
echo ========================================
echo.

REM Kiểm tra Docker
echo Checking Docker...
docker version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running! Please start Docker Desktop.
    pause
    exit /b 1
)
echo Docker is running!
echo.

REM Copy .env.localhost thành .env
echo Setting up localhost configuration...
copy /Y .env.localhost .env >nul
echo Configuration set to LOCALHOST mode
echo.

REM Dừng containers cũ
echo Stopping old containers...
docker-compose -f docker-compose-full.yml down
echo.

REM Build và start
echo Building and starting services...
echo This may take a few minutes...
docker-compose -f docker-compose-full.yml up --build -d

echo.
echo ========================================
echo Started successfully on LOCALHOST!
echo ========================================
echo.
echo Access URLs (from this machine only):
echo   Frontend:        http://localhost:3000
echo   API Gateway:     http://localhost:8080
echo   Eureka:          http://localhost:8761
echo   RabbitMQ:        http://localhost:15672 (admin/admin123)
echo   Grafana:         http://localhost:3001 (admin/admin123)
echo   Prometheus:      http://localhost:9090
echo   Kibana:          http://localhost:5601
echo.
echo Note: This runs on your local machine only.
echo       Other team members cannot access from their machines.
echo.
echo View logs:
echo   docker-compose -f docker-compose-full.yml logs -f [service-name]
echo.
echo Stop all:
echo   docker-compose -f docker-compose-full.yml down
echo.
pause
