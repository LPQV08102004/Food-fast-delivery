@echo off
echo ================================
echo BUILD VA KHOI DONG HE THONG
echo ================================
echo.

echo [BUOC 1] Kiem tra MySQL...
echo.
net start | findstr MySQL >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] MySQL dang chay
) else (
    echo [ERROR] MySQL khong chay!
    echo Ban co muon chay check-mysql.bat de kiem tra chi tiet? (Y/N)
    set /p check=
    if /i "%check%"=="Y" (
        call check-mysql.bat
        exit /b
    )
    echo Vui long khoi dong MySQL truoc: net start MySQL80
    pause
    exit /b 1
)

echo.
echo [BUOC 2] Kiem tra databases...
mysql -u root -p08102004 -e "CREATE DATABASE IF NOT EXISTS user_service; CREATE DATABASE IF NOT EXISTS product_service; CREATE DATABASE IF NOT EXISTS payment_service;" 2>nul
if %errorlevel% == 0 (
    echo [OK] Databases da san sang
) else (
    echo [WARNING] Co van de voi MySQL, nhung se thu tiep tuc...
)

echo.
echo [BUOC 3] Dang build va khoi dong tat ca cac services...
echo Qua trinh nay co the mat 10-15 phut lan dau tien.
echo.

docker-compose up -d --build

echo.
echo ================================
echo HOAN THANH!
echo ================================
echo.
echo Cac ung dung dang khoi dong...
echo Vui long doi 2-3 phut de tat ca services khoi dong hoan toan.
echo.
echo Truy cap:
echo - Ung dung chinh: http://localhost:3000
echo - Eureka Dashboard: http://localhost:8761
echo - RabbitMQ: http://localhost:15672
echo.
echo Xem logs: docker-compose logs -f
echo Dung he thong: docker-compose down
echo.
pause
