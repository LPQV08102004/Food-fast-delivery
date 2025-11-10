@echo off
echo ================================
echo MENU QUAN LY DOCKER
echo ================================
echo.
echo 1. Khoi dong he thong (docker-start.bat)
echo 2. Dung he thong (docker-stop.bat)
echo 3. Khoi dong lai (docker-restart.bat)
echo 4. Xem logs (docker-logs.bat)
echo 5. Kiem tra trang thai (docker-status.bat)
echo 6. Xoa va build lai (docker-clean-rebuild.bat)
echo 7. Thoat
echo.
set /p choice="Chon chuc nang (1-7): "

if "%choice%"=="1" call docker-start.bat
if "%choice%"=="2" call docker-stop.bat
if "%choice%"=="3" call docker-restart.bat
if "%choice%"=="4" call docker-logs.bat
if "%choice%"=="5" call docker-status.bat
if "%choice%"=="6" call docker-clean-rebuild.bat
if "%choice%"=="7" exit

echo.
pause

