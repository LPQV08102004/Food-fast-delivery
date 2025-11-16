@echo off
echo ====================================
echo Building API Gateway...
echo ====================================

cd /d C:\Study\CNPM\Food-fast-delivery\api-gateway

echo.
echo [1/3] Cleaning previous build...
call gradlew.bat clean

echo.
echo [2/3] Building project (skipping tests)...
call gradlew.bat build -x test

echo.
echo [3/3] Checking build result...
if exist build\libs\api-gateway-0.0.1-SNAPSHOT.jar (
    echo.
    echo ✅ SUCCESS! JAR file created successfully.
    echo Location: build\libs\api-gateway-0.0.1-SNAPSHOT.jar
    dir build\libs\*.jar
) else (
    echo.
    echo ❌ FAILED! JAR file not found.
    echo Check error messages above.
)

echo.
echo ====================================
echo Build process completed!
echo ====================================
pause

