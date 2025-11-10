@echo off
echo ================================
echo XOA TOAN BO VA BUILD LAI
echo ================================
echo.
echo CANH BAO: Lenh nay se xoa tat ca containers, images va DATA!
echo.
set /p confirm="Ban co chac chan muon tiep tuc? (Y/N): "

if /i "%confirm%"=="Y" (
    echo.
    echo Dang xoa tat ca...
    docker-compose down -v
    echo.
    echo Dang xoa images...
    docker-compose down --rmi all
    echo.
    echo Dang build lai...
    docker-compose up -d --build
    echo.
    echo HOAN THANH!
) else (
    echo.
    echo Da huy.
)

echo.
pause
@echo off
echo ================================
echo BUILD VA KHOI DONG HE THONG
echo ================================
echo.
echo Dang build va khoi dong tat ca cac services...
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
echo - Khach hang: http://localhost:3000
echo - Admin: http://localhost:3001
echo - Nha hang: http://localhost:3002
echo - Eureka Dashboard: http://localhost:8761
echo - RabbitMQ: http://localhost:15672
echo.
echo Xem logs: docker-compose logs -f
echo Dung he thong: docker-compose down
echo.
pause

