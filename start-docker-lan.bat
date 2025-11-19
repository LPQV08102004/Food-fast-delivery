@echo off
REM Script để khởi động project trên LAN với Docker
REM Chạy lệnh: start-docker-lan.bat

echo ================================
echo Food Fast Delivery - Docker LAN Startup
echo ================================
echo.

REM Kiểm tra Docker đang chạy
echo Kiểm tra Docker...
docker version >nul 2>&1
if errorlevel 1 (
    echo Docker chua chay! Vui long khoi dong Docker Desktop.
    pause
    exit /b 1
)
echo Docker dang chay
echo.

REM Dừng các container đang chạy
echo Dung cac container cu...
docker-compose -f docker-compose-full.yml down
echo.

REM Rebuild và khởi động
echo Build va khoi dong cac services...
echo Qua trinh nay co the mat vai phut...
docker-compose -f docker-compose-full.yml up --build -d

echo.
echo ================================
echo Khoi dong thanh cong!
echo ================================
echo.
echo Truy cap ung dung:
echo    Frontend:        http://26.174.141.27:3000
echo    API Gateway:     http://26.174.141.27:8080
echo    Eureka:          http://26.174.141.27:8761
echo    RabbitMQ UI:     http://26.174.141.27:15672 (admin/admin123)
echo    Grafana:         http://26.174.141.27:3001 (admin/admin123)
echo    Prometheus:      http://26.174.141.27:9090
echo    Kibana:          http://26.174.141.27:5601
echo.
echo Xem logs:
echo    docker-compose -f docker-compose-full.yml logs -f [service-name]
echo.
echo Dung tat ca:
echo    docker-compose -f docker-compose-full.yml down
echo.

REM Hiển thị trạng thái
timeout /t 3 >nul
docker-compose -f docker-compose-full.yml ps

pause
