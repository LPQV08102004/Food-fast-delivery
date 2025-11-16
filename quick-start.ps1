# Food Fast Delivery - Quick Start Script
# This script helps you build and run the microservices system

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Food Fast Delivery - Quick Start" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if Docker is running
function Test-Docker {
    try {
        docker ps | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
if (-not (Test-Docker)) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}
Write-Host "Docker is running!" -ForegroundColor Green
Write-Host ""

# Menu
Write-Host "Select an option:" -ForegroundColor Cyan
Write-Host "1. Build all services"
Write-Host "2. Start infrastructure only (MySQL, RabbitMQ, Eureka, Config)"
Write-Host "3. Start monitoring stack (Prometheus, Grafana, Zipkin, ELK)"
Write-Host "4. Start all services"
Write-Host "5. Stop all services"
Write-Host "6. View logs"
Write-Host "7. Clean and rebuild"
Write-Host "0. Exit"
Write-Host ""

$choice = Read-Host "Enter your choice"

switch ($choice) {
    "1" {
        Write-Host "Building all services..." -ForegroundColor Yellow
        
        # User Service
        Write-Host "Building User Service..." -ForegroundColor Cyan
        Set-Location user-service
        mvn clean package -DskipTests
        Set-Location ..
        
        # Product Service
        Write-Host "Building Product Service..." -ForegroundColor Cyan
        Set-Location product-service
        mvn clean package -DskipTests
        Set-Location ..
        
        # Order Service
        Write-Host "Building Order Service..." -ForegroundColor Cyan
        Set-Location order-service
        .\gradlew.bat clean build -x test
        Set-Location ..
        
        # Payment Service
        Write-Host "Building Payment Service..." -ForegroundColor Cyan
        Set-Location payment-service
        .\gradlew.bat clean build -x test
        Set-Location ..
        
        # Config Service
        Write-Host "Building Config Service..." -ForegroundColor Cyan
        Set-Location config-service
        mvn clean package -DskipTests
        Set-Location ..
        
        Write-Host "Build completed!" -ForegroundColor Green
    }
    
    "2" {
        Write-Host "Starting infrastructure services..." -ForegroundColor Yellow
        docker-compose -f docker-compose-full.yml up -d mysql rabbitmq eureka-service config-service
        Write-Host "Infrastructure services started!" -ForegroundColor Green
        Write-Host "Eureka Dashboard: http://localhost:8761" -ForegroundColor Cyan
        Write-Host "Config Server: http://localhost:8888" -ForegroundColor Cyan
    }
    
    "3" {
        Write-Host "Starting monitoring stack..." -ForegroundColor Yellow
        docker-compose -f docker-compose-full.yml up -d prometheus grafana zipkin elasticsearch logstash kibana
        Write-Host "Monitoring stack started!" -ForegroundColor Green
        Write-Host "Prometheus: http://localhost:9090" -ForegroundColor Cyan
        Write-Host "Grafana: http://localhost:3001 (admin/admin123)" -ForegroundColor Cyan
        Write-Host "Zipkin: http://localhost:9411" -ForegroundColor Cyan
        Write-Host "Kibana: http://localhost:5601" -ForegroundColor Cyan
    }
    
    "4" {
        Write-Host "Starting all services..." -ForegroundColor Yellow
        docker-compose -f docker-compose-full.yml up -d
        Write-Host "All services started!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Access URLs:" -ForegroundColor Cyan
        Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
        Write-Host "  API Gateway: http://localhost:8080" -ForegroundColor White
        Write-Host "  Eureka: http://localhost:8761" -ForegroundColor White
        Write-Host "  Grafana: http://localhost:3001" -ForegroundColor White
        Write-Host "  Prometheus: http://localhost:9090" -ForegroundColor White
        Write-Host "  Zipkin: http://localhost:9411" -ForegroundColor White
        Write-Host "  Kibana: http://localhost:5601" -ForegroundColor White
    }
    
    "5" {
        Write-Host "Stopping all services..." -ForegroundColor Yellow
        docker-compose -f docker-compose-full.yml down
        Write-Host "All services stopped!" -ForegroundColor Green
    }
    
    "6" {
        $service = Read-Host "Enter service name (or 'all' for all services)"
        if ($service -eq "all") {
            docker-compose -f docker-compose-full.yml logs -f
        } else {
            docker-compose -f docker-compose-full.yml logs -f $service
        }
    }
    
    "7" {
        Write-Host "Cleaning and rebuilding..." -ForegroundColor Yellow
        docker-compose -f docker-compose-full.yml down -v
        Write-Host "Cleaned! Now run option 1 to rebuild." -ForegroundColor Green
    }
    
    "0" {
        Write-Host "Goodbye!" -ForegroundColor Cyan
        exit 0
    }
    
    default {
        Write-Host "Invalid choice!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done! Press any key to exit..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
