@echo off
echo ========================================
echo Building MoMo Payment Integration (Gradle)
echo ========================================
echo.

echo [1/2] Building javapayment (MoMo SDK) with Maven...
cd ..\javapayment
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo ERROR: Failed to build javapayment
    exit /b 1
)
echo.

echo [2/2] Building payment-service with Gradle...
cd ..\payment-service
call gradlew clean build -x test
if %errorlevel% neq 0 (
    echo ERROR: Failed to build payment-service
    exit /b 1
)
echo.

echo ========================================
echo Build completed successfully!
echo ========================================
echo JAR file: build\libs\payment-service-0.0.1-SNAPSHOT.jar
echo.
echo To run:
echo   gradlew bootRun
echo   OR
echo   java -jar build\libs\payment-service-0.0.1-SNAPSHOT.jar
pause
