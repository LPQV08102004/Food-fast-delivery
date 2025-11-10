# RabbitMQ Integration Guide - Food Fast Delivery

## Tổng quan

Hệ thống đã được tích hợp RabbitMQ để xử lý các tác vụ bất đồng bộ (async) giữa các microservices:

- **Order Service**: Publisher cho các order events
- **Payment Service**: Consumer xử lý payment requests và publisher payment results
- **Product Service**: Consumer để cập nhật inventory (sẵn sàng cho tương lai)

## Kiến trúc Message Flow

```
┌─────────────────┐
│   User places   │
│     order       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   Order Service         │
│  - Create Order (DB)    │
│  - Publish Event        │
└────────┬────────────────┘
         │
         │ order.created event
         ▼
    ┌────────────────────────────┐
    │      RabbitMQ Exchange     │
    │    order.exchange          │
    └─────┬──────────────┬───────┘
          │              │
          │              │
    ┌─────▼──────┐  ┌────▼──────────┐
    │ Payment    │  │ Product       │
    │ Service    │  │ Service       │
    │ (Process)  │  │ (Inventory)   │
    └─────┬──────┘  └───────────────┘
          │
          │ payment.processed event
          ▼
    ┌────────────────────┐
    │  Order Service     │
    │ (Update Status)    │
    └────────────────────┘
```

## Cài đặt RabbitMQ

### Windows (sử dụng Docker - Khuyến nghị)

1. **Cài đặt Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop/

2. **Chạy RabbitMQ Container**
   ```cmd
   docker run -d --name rabbitmq ^
     -p 5672:5672 ^
     -p 15672:15672 ^
     -e RABBITMQ_DEFAULT_USER=guest ^
     -e RABBITMQ_DEFAULT_PASS=guest ^
     rabbitmq:3-management
   ```

3. **Truy cập RabbitMQ Management Console**
   - URL: http://localhost:15672
   - Username: guest
   - Password: guest

### Windows (Native Installation)

1. **Cài đặt Erlang**
   - Download: https://www.erlang.org/downloads
   - Chọn version phù hợp với RabbitMQ

2. **Cài đặt RabbitMQ**
   - Download: https://www.rabbitmq.com/install-windows.html
   - Run installer

3. **Enable Management Plugin**
   ```cmd
   cd "C:\Program Files\RabbitMQ Server\rabbitmq_server-x.x.x\sbin"
   rabbitmq-plugins enable rabbitmq_management
   ```

4. **Start RabbitMQ Service**
   ```cmd
   net start RabbitMQ
   ```

## Events và Queues

### 1. Order Created Event

**Publisher**: Order Service  
**Consumers**: Payment Service, Product Service

**Exchange**: `order.exchange` (Topic)  
**Queue**: `order.created.queue`  
**Routing Key**: `order.created`

**Event Structure**:
```json
{
  "orderId": 1,
  "userId": 123,
  "totalPrice": 250.00,
  "paymentMethod": "card",
  "deliveryFullName": "Nguyen Van A",
  "deliveryPhone": "0123456789",
  "deliveryAddress": "123 ABC Street",
  "deliveryCity": "Ho Chi Minh",
  "items": [
    {
      "productId": 5,
      "productName": "Pho Bo",
      "quantity": 2,
      "price": 50.00
    }
  ]
}
```

### 2. Payment Request Event

**Publisher**: Order Service  
**Consumer**: Payment Service

**Exchange**: `payment.exchange` (Topic)  
**Queue**: `payment.request.queue`  
**Routing Key**: `payment.request`

### 3. Payment Processed Event

**Publisher**: Payment Service  
**Consumer**: Order Service

**Exchange**: `payment.exchange` (Topic)  
**Queue**: `payment.processed.queue`  
**Routing Key**: `payment.processed`

**Event Structure**:
```json
{
  "orderId": 1,
  "paymentId": 456,
  "status": "SUCCESS",
  "message": "Payment processed successfully"
}
```

### 4. Order Status Updated Event

**Publisher**: Order Service  
**Consumers**: Notification Service (future)

**Exchange**: `order.exchange` (Topic)  
**Queue**: `order.status.updated.queue`  
**Routing Key**: `order.status.updated`

**Event Structure**:
```json
{
  "orderId": 1,
  "userId": 123,
  "oldStatus": "NEW",
  "newStatus": "CONFIRMED",
  "paymentStatus": "SUCCESS"
}
```

## Quy trình xử lý Order

### Trước khi có RabbitMQ (Synchronous)
```
User → Order Service → Payment Service (REST) → Order Service
                ↓ (blocking)
            Wait for payment
                ↓
            Return result
```

**Vấn đề**:
- ❌ Blocking - User phải đợi payment xử lý xong
- ❌ Tight coupling - Services phụ thuộc lẫn nhau
- ❌ Single point of failure - Payment down → Order fail
- ❌ No retry mechanism

### Sau khi có RabbitMQ (Asynchronous)
```
User → Order Service → RabbitMQ → Payment Service
         ↓                           ↓
    Save to DB                  Process payment
         ↓                           ↓
    Return immediately          Publish result
                                     ↓
                              Order Service updates
```

**Ưu điểm**:
- ✅ Non-blocking - User nhận response ngay lập tức
- ✅ Loose coupling - Services độc lập
- ✅ Resilient - Payment down không ảnh hưởng Order creation
- ✅ Auto retry - RabbitMQ tự động retry khi fail
- ✅ Scalable - Có thể scale từng service độc lập

## Configuration Details

### Retry Mechanism

Tất cả các services đều có retry configuration:

```yaml
spring:
  rabbitmq:
    listener:
      simple:
        retry:
          enabled: true
          initial-interval: 3000  # Retry sau 3 giây
          max-attempts: 3         # Tối đa 3 lần
          multiplier: 2.0         # Tăng gấp đôi mỗi lần
```

**Ví dụ**: 
- Attempt 1: Fail → Wait 3s
- Attempt 2: Fail → Wait 6s (3s × 2)
- Attempt 3: Fail → Wait 12s (6s × 2)
- After 3 attempts → Message moved to Dead Letter Queue

### Dead Letter Queue (DLQ)

Messages failed sau max attempts sẽ được chuyển vào DLQ để xử lý manual:

```java
QueueBuilder.durable(ORDER_CREATED_QUEUE)
    .withArgument("x-dead-letter-exchange", ORDER_EXCHANGE + ".dlx")
    .build();
```

## Testing

### 1. Kiểm tra RabbitMQ đang chạy

```cmd
# Check Docker container
docker ps | findstr rabbitmq

# Or check Windows service
sc query RabbitMQ
```

### 2. Truy cập Management Console

- URL: http://localhost:15672
- Login: guest/guest
- Kiểm tra Exchanges, Queues, Connections

### 3. Test tạo Order

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "paymentMethod": "card",
    "items": [
      {
        "productId": 1,
        "quantity": 2
      }
    ],
    "deliveryInfo": {
      "fullName": "Test User",
      "phone": "0123456789",
      "address": "123 Test St",
      "city": "HCMC"
    }
  }'
```

### 4. Xem Logs

**Order Service**:
```
INFO: Creating order for user: 1
INFO: Order created with ID: 1
INFO: Publishing order created event for order: 1
INFO: Order created event published successfully
```

**Payment Service**:
```
INFO: Received order created event for payment processing: Order ID 1
INFO: Payment processed successfully for order: 1
INFO: Payment processed event published for order: 1
```

**Order Service (Update)**:
```
INFO: Received payment processed event for order: 1
INFO: Payment successful, order confirmed: 1
INFO: Order status updated successfully for order: 1
```

## Monitoring

### RabbitMQ Management Console

1. **Exchanges** - Xem message routing
2. **Queues** - Xem message waiting, consumers
3. **Connections** - Xem services connected
4. **Channels** - Xem communication channels

### Key Metrics to Monitor

- **Ready**: Messages waiting to be consumed
- **Unacked**: Messages being processed
- **Total**: Total messages in queue
- **Publish Rate**: Messages/second being published
- **Deliver Rate**: Messages/second being consumed

## Troubleshooting

### Problem: RabbitMQ connection refused

**Solution**:
```cmd
# Check if RabbitMQ is running
docker ps | findstr rabbitmq

# Restart if needed
docker restart rabbitmq

# Check logs
docker logs rabbitmq
```

### Problem: Messages not being consumed

**Check**:
1. Consumer service đang chạy?
2. Queue có messages không? (Check Management Console)
3. Consumer có errors không? (Check service logs)

### Problem: Payment always fails

**Note**: Payment Service có 80% success rate để simulate real world:

```java
boolean success = random.nextInt(100) < 80; // 80% success
```

Để test 100% success, sửa trong `PaymentEventListener.java`:
```java
boolean success = true; // Always success for testing
```

## Best Practices

### 1. Idempotency

Payment Service đã implement idempotency key để tránh duplicate payments:

```java
if (paymentRepository.findByOrderId(event.getOrderId()).isPresent()) {
    log.warn("Payment already exists for order: {}", event.getOrderId());
    return; // Skip processing
}
```

### 2. Error Handling

Always catch exceptions trong listeners:

```java
try {
    // Process message
} catch (Exception e) {
    log.error("Failed to process: {}", e.getMessage());
    throw e; // Re-throw to trigger retry
}
```

### 3. Logging

Log tất cả các events để dễ debug:

```java
log.info("Received event: {}", event);
log.info("Processing...");
log.info("Completed successfully");
```

## Future Enhancements

### 1. Notification Service

Thêm service mới để gửi notifications:

```
Order Status Updated → Notification Service → Email/SMS/Push
```

### 2. Inventory Management

Product Service có thể update stock realtime:

```java
product.setStock(product.getStock() - item.getQuantity());
productRepository.save(product);
```

### 3. Order Saga Pattern

Implement distributed transaction với compensation:

```
Order Created → Payment → Inventory → Delivery
     ↓ (rollback if any step fails)
Cancel Order → Refund → Restore Stock → Cancel Delivery
```

### 4. Event Sourcing

Lưu trữ tất cả events để có thể replay:

```
EventStore: All order events → Rebuild order state
```

## Dependencies Added

### All Services (pom.xml)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

## Files Created

### Order Service
- `event/OrderCreatedEvent.java`
- `event/PaymentProcessedEvent.java`
- `event/OrderStatusUpdatedEvent.java`
- `config/RabbitMQConfig.java`
- `messaging/OrderEventPublisher.java`
- `messaging/PaymentEventListener.java`

### Payment Service
- `event/OrderCreatedEvent.java`
- `event/PaymentProcessedEvent.java`
- `config/RabbitMQConfig.java`
- `messaging/PaymentEventListener.java`
- `messaging/PaymentEventPublisher.java`

### Product Service
- `event/OrderCreatedEvent.java`
- `config/RabbitMQConfig.java`
- `messaging/OrderEventListener.java`

## Support

Nếu gặp vấn đề:
1. Check RabbitMQ logs: `docker logs rabbitmq`
2. Check service logs trong console
3. Check RabbitMQ Management Console: http://localhost:15672
4. Verify configuration trong application.yml

## Kết luận

Hệ thống giờ đã sử dụng event-driven architecture với RabbitMQ, giúp:
- ✅ Decoupling services
- ✅ Async processing
- ✅ Better scalability
- ✅ Improved reliability
- ✅ Auto retry mechanism

Ready for production! 🚀

