@echo off
REM Script để chạy Docker với cấu hình mạng LAN
REM Cách sử dụng: start-lan.bat <IP-cua-may-server>
REM Ví dụ: start-lan.bat 192.168.1.100

if "%1"=="" (
    echo ERROR: Ban chua nhap dia chi IP!
    echo Cach dung: start-lan.bat ^<IP-cua-may-server^>
    echo Vi du: start-lan.bat 192.168.1.100
    echo.
    echo De xem IP cua may: chay lenh "ipconfig"
    pause
    exit /b 1
)

set SERVER_IP=%1
set API_BASE_URL=http://%SERVER_IP%:8080/api

echo ========================================
echo Starting Docker with LAN configuration
echo Server IP: %SERVER_IP%
echo API URL: %API_BASE_URL%
echo ========================================
echo.

REM Stop và remove các container cũ
echo Stopping old containers...
docker-compose -f docker-compose-full.yml down

echo.
echo Building and starting services with LAN configuration...
set API_BASE_URL=%API_BASE_URL%
docker-compose -f docker-compose-full.yml up -d --build

echo.
echo ========================================
echo Services started successfully!
echo.
echo Truy cap tu may nay: http://localhost:3000
echo Truy cap tu may khac trong LAN: http://%SERVER_IP%:3000
echo.
echo API Gateway: http://%SERVER_IP%:8080
echo Grafana: http://%SERVER_IP%:3001
echo ========================================
pause

