# 🍔 Food Fast Delivery - Microservices Architecture

## Giới thiệu
Hệ thống đặt đồ ăn trực tuyến được xây dựng với kiến trúc Microservices hiện đại, bao gồm đầy đủ các thành phần Production-Ready.

## ⚡ Quick Start

### Khởi động nhanh với script
```powershell
.\quick-start.ps1
```

### Hoặc sử dụng Docker Compose
```powershell
# Build services
.\quick-start.ps1  # Option 1

# Khởi động toàn bộ hệ thống
docker-compose -f docker-compose-full.yml up -d
```

## Kiến trúc

### Business Services
- **User Service** (8081) - Quản lý người dùng & Xác thực
- **Product Service** (8082) - Quản lý sản phẩm & Nhà hàng
- **Order Service** (8083) - Quản lý đơn hàng
- **Payment Service** (8084) - Xử lý thanh toán
- **API Gateway** (8080) - Cổng vào hệ thống
- **Frontend** (3000) - Giao diện React

### Infrastructure
- **Eureka** (8761) - Service Discovery
- **Config Server** (8888) - Configuration Management
- **MySQL** (3306) - Database
- **RabbitMQ** (5672, 15672) - Message Broker ✨ **NEW: Async Messaging!**

### Monitoring Stack
- **Prometheus** (9090) - Metrics Collection
- **Grafana** (3001) - Visualization & Dashboards
- **Zipkin** (9411) - Distributed Tracing
- **Elasticsearch** (9200) - Log Storage
- **Logstash** (5000) - Log Aggregation
- **Kibana** (5601) - Log Visualization

## Tính năng nổi bật

### 🔄 Message-Driven Architecture (NEW!)
- **Async Order Processing** - Xử lý đơn hàng bất đồng bộ
- **Event-Driven Communication** - Services giao tiếp qua events
- **Auto Retry** - Tự động thử lại khi thất bại
- **Decoupling** - Services hoàn toàn độc lập
- **Scalability** - Dễ dàng scale theo nhu cầu

### 🛡️ Resilience & Fault Tolerance
- **Circuit Breaker** - Tự động ngắt mạch khi service lỗi
- **Retry Mechanism** - Tự động thử lại requests
- **Timeout Configuration** - Giới hạn thời gian chờ
- **Fallback Methods** - Phương án dự phòng
- **Rate Limiting** - Giới hạn requests/giây

### 📊 Observability
- **Distributed Tracing** - Theo dõi request flow
- **Metrics Collection** - Thu thập metrics realtime
- **Centralized Logging** - Log tập trung
- **Health Checks** - Kiểm tra sức khỏe services
- **Beautiful Dashboards** - Grafana visualizations

### ⚙️ Configuration Management
- **Config Server** - Quản lý cấu hình tập trung
- **Environment-specific** - Dev/Staging/Production
- **Dynamic Refresh** - Không cần restart

## Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| API Gateway | http://localhost:8080 | - |
| Eureka Dashboard | http://localhost:8761 | - |
| RabbitMQ Management | http://localhost:15672 | admin/admin123 |
| Grafana | http://localhost:3001 | admin/admin123 |
| Prometheus | http://localhost:9090 | - |
| Zipkin | http://localhost:9411 | - |
| Kibana | http://localhost:5601 | - |

## Tài liệu

Để hiểu chi tiết về hệ thống, vui lòng đọc:

1. **[START_HERE.md](START_HERE.md)** - Bắt đầu từ đây! 🎯
2. **[RABBITMQ_IMPLEMENTATION.md](RABBITMQ_IMPLEMENTATION.md)** - RabbitMQ Integration Guide ✨ **NEW!**
3. **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Checklist triển khai
4. **[IMPROVEMENTS_SUMMARY.md](IMPROVEMENTS_SUMMARY.md)** - Tổng quan cải tiến
5. **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Hướng dẫn chi tiết
6. **[FILES_CHANGED.md](FILES_CHANGED.md)** - Danh sách files thay đổi

## Testing

### Test Async Messaging (NEW!)
```powershell
# Start RabbitMQ
docker-compose -f docker-compose-full.yml up -d rabbitmq

# Create an order - returns immediately!
curl -X POST http://localhost:8080/api/orders ...

# Check RabbitMQ Management Console
# http://localhost:15672 (admin/admin123)

# Check logs to see async processing
docker logs -f order-service
docker logs -f payment-service
```

### Test Circuit Breaker
```powershell
docker stop payment-service
curl -X POST http://localhost:8080/api/orders ...
curl http://localhost:8083/actuator/circuitbreakers
docker start payment-service
```

### Test Distributed Tracing
1. Tạo order qua API
2. Mở Zipkin: http://localhost:9411
3. Xem trace flow qua các services

### Test Monitoring
1. Mở Grafana: http://localhost:3001
2. Login: admin/admin123
3. Import dashboard ID: 10280
4. Xem metrics realtime

## Technology Stack

### Backend
- **Java 17**
- **Spring Boot 3.5.6**
- **Spring Cloud 2025.0.0**
- **Spring Cloud Gateway**
- **Spring Security + JWT**
- **Spring AMQP** - RabbitMQ Integration ✨ **NEW!**
- **Resilience4j 2.1.0**
- **MySQL 8.0**

### Messaging & Events
- **RabbitMQ 3** - Message Broker ✨ **NEW!**
- **Event-Driven Architecture** ✨ **NEW!**

### Monitoring & Observability
- **Prometheus** - Metrics
- **Grafana** - Visualization
- **Zipkin** - Distributed Tracing
- **ELK Stack** - Centralized Logging
- **Micrometer** - Metrics abstraction

### Frontend
- **React**
- **Tailwind CSS**

## System Requirements

- **Docker** & **Docker Compose**
- **Java 17**
- **Maven** & **Gradle**
- **RAM**: 8GB minimum (16GB recommended)
- **Disk**: 10GB free space

## Development

### Build services
```powershell
# User Service
cd user-service && mvn clean package -DskipTests

# Product Service
cd product-service && mvn clean package -DskipTests

# Order Service
cd order-service && .\gradlew.bat clean build -x test

# Payment Service
cd payment-service && .\gradlew.bat clean build -x test

# Config Service
cd config-service && mvn clean package -DskipTests
```

### Run locally
```powershell
# Start infrastructure
docker-compose -f docker-compose-full.yml up -d mysql rabbitmq eureka-service

# Run services with IDE or command line
java -jar order-service/build/libs/order-service-*.jar
```

## Troubleshooting

### View logs
```powershell
docker-compose -f docker-compose-full.yml logs -f service-name
```

### Check health
```powershell
curl http://localhost:8081/actuator/health
```

### Restart service
```powershell
docker-compose -f docker-compose-full.yml restart service-name
```

## Monitoring Dashboards

### Grafana Dashboards (Import IDs)
- **10280** - Spring Boot Statistics
- **4701** - JVM Micrometer
- **11378** - Resilience4j

### Prometheus Queries
```promql
# Request rate
rate(http_server_requests_seconds_count[5m])

# Response time P95
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))

# Circuit breaker state
resilience4j_circuitbreaker_state
```

##  Learning Resources

- Spring Cloud Documentation: https://spring.io/projects/spring-cloud
- Resilience4j Guide: https://resilience4j.readme.io
- Prometheus Documentation: https://prometheus.io/docs
- Grafana Tutorials: https://grafana.com/tutorials

## 👥 Team

Đồ án môn học Công nghệ phần mềm

##  License

MIT License

---

** Production-Ready Microservices Architecture!**
