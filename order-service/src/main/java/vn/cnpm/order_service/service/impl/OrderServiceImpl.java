package vn.cnpm.order_service.service.impl;

import vn.cnpm.order_service.DTO.*;
import vn.cnpm.order_service.client.ProductClient;
import vn.cnpm.order_service.event.OrderCreatedEvent;
import vn.cnpm.order_service.messaging.OrderEventPublisher;
import vn.cnpm.order_service.model.Order;
import vn.cnpm.order_service.model.OrderItem;
import vn.cnpm.order_service.model.OrderStatus;
import vn.cnpm.order_service.repository.OrderRepository;
import vn.cnpm.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final OrderEventPublisher orderEventPublisher;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        log.info("Creating order for userId: {}", request.getUserId());

        // Tạo order trước (không có items)
        Order order = Order.builder()
                .userId(request.getUserId())
                .restaurantId(request.getRestaurantId())
                .status(OrderStatus.NEW)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus("PENDING")
                .build();

        // Lưu thông tin delivery nếu có
        if (request.getDeliveryInfo() != null) {
            order.setDeliveryFullName(request.getDeliveryInfo().getFullName());
            order.setDeliveryPhone(request.getDeliveryInfo().getPhone());
            order.setDeliveryAddress(request.getDeliveryInfo().getAddress());
            order.setDeliveryCity(request.getDeliveryInfo().getCity());
            order.setDeliveryNotes(request.getDeliveryInfo().getNotes());
        }

        // Tạo order items và fetch thông tin sản phẩm
        double totalPrice = 0.0;
        List<OrderItem> items = new ArrayList<>();

        for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            // Lấy thông tin sản phẩm từ product service
            ProductDTO product = productClient.getProductById(itemRequest.getProductId());

            // Validate product availability
            if (product == null) {
                throw new RuntimeException("Product not found: " + itemRequest.getProductId());
            }

            // Validate stock availability
            if (product.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName() + 
                    ". Available: " + product.getStock() + ", Requested: " + itemRequest.getQuantity());
            }

            // Tính giá cho item này
            double itemPrice = product.getPrice() * itemRequest.getQuantity();
            totalPrice += itemPrice;

            // Tạo order item với đầy đủ thông tin
            OrderItem item = OrderItem.builder()
                    .productId(itemRequest.getProductId())
                    .productName(product.getName())  // Lưu tên sản phẩm
                    .quantity(itemRequest.getQuantity())
                    .price(product.getPrice())  // Lưu giá đơn vị
                    .order(order)
                    .build();
            items.add(item);
        }

        // Set tổng giá và items vào order
        order.setTotalPrice(totalPrice);
        order.setOrderItems(items);

        // Lưu order vào database (cascade sẽ tự động lưu items)
        Order saved = orderRepository.save(order);
        log.info("Order created with id: {}", saved.getId());

        // Reduce stock for all products in the order
        // CRITICAL: This must be inside @Transactional to rollback order if stock reduction fails
        for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            try {
                productClient.reduceStock(itemRequest.getProductId(), itemRequest.getQuantity());
                log.info("Reduced stock for product {} by {}", itemRequest.getProductId(), itemRequest.getQuantity());
            } catch (Exception e) {
                log.error("CRITICAL: Failed to reduce stock for product {} - rolling back entire order {}",
                        itemRequest.getProductId(), saved.getId(), e);
                // Re-throw to trigger @Transactional rollback of the entire order
                throw new RuntimeException("Stock reduction failed for product " + itemRequest.getProductId()
                        + ": " + e.getMessage(), e);
            }
        }

        // Publish OrderCreatedEvent to RabbitMQ for async payment processing
        try {
            OrderCreatedEvent event = OrderCreatedEvent.builder()
                    .orderId(saved.getId())
                    .userId(saved.getUserId())
                    .restaurantId(saved.getRestaurantId())
                    .totalPrice(saved.getTotalPrice())
                    .paymentMethod(saved.getPaymentMethod())
                    .deliveryAddress(saved.getDeliveryAddress())
                    .deliveryPhone(saved.getDeliveryPhone())
                    .deliveryFullName(saved.getDeliveryFullName())
                    .build();

            orderEventPublisher.publishOrderCreatedEvent(event);
            log.info("OrderCreatedEvent published for orderId: {}", saved.getId());

        } catch (Exception e) {
            log.error("Failed to publish OrderCreatedEvent for orderId: {}", saved.getId(), e);
            // Order is still saved, but payment will not be processed
            // You might want to implement a retry mechanism or manual intervention
        }

        // Map sang response
        return mapToDto(saved);
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse getOrder(Long id) {
        Order o = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        return mapToDto(o);
    }

    @Override
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getOrdersByRestaurantId(Long restaurantId) {
        return orderRepository.findByRestaurantId(restaurantId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        
        order.setStatus(status);
        Order updated = orderRepository.save(order);
        
        // Nếu đơn hàng chuyển sang PREPARING, publish OrderReadyEvent cho delivery-service
        if (status == OrderStatus.PREPARING) {
            try {
                // Lấy thông tin nhà hàng để có địa chỉ
                vn.cnpm.order_service.DTO.RestaurantDTO restaurant = productClient.getRestaurantById(order.getRestaurantId());
                
                vn.cnpm.order_service.event.OrderReadyEvent event = vn.cnpm.order_service.event.OrderReadyEvent.builder()
                        .orderId(order.getId())
                        .restaurantId(order.getRestaurantId())
                        .restaurantAddress(restaurant != null ? restaurant.getAddress() : "Unknown Address")
                        .deliveryAddress(order.getDeliveryAddress())
                        .deliveryPhone(order.getDeliveryPhone())
                        .deliveryFullName(order.getDeliveryFullName())
                        .build();
                
                orderEventPublisher.publishOrderReadyEvent(event);
                log.info("OrderReadyEvent published for order {}", orderId);
            } catch (Exception e) {
                log.error("Failed to publish OrderReadyEvent for order {}", orderId, e);
                // Không throw exception để không ảnh hưởng đến việc cập nhật status
            }
        }
        
        log.info("Order {} status updated to {}", orderId, status);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        
        // Only allow cancellation if order is not yet delivered
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot cancel order in status: " + order.getStatus());
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        Order updated = orderRepository.save(order);
        
        // Restore stock for all items
        for (OrderItem item : order.getOrderItems()) {
            try {
                productClient.restoreStock(item.getProductId(), item.getQuantity());
                log.info("Restored stock for product {} by {}", item.getProductId(), item.getQuantity());
            } catch (Exception e) {
                log.error("Failed to restore stock for product {}", item.getProductId(), e);
            }
        }
        
        log.info("Order {} cancelled", orderId);
        return mapToDto(updated);
    }

    private OrderResponse mapToDto(Order o) {
        return OrderResponse.builder()
                .id(o.getId())
                .userId(o.getUserId())
                .status(o.getStatus())
                .totalPrice(o.getTotalPrice())
                .paymentMethod(o.getPaymentMethod())
                .paymentStatus(o.getPaymentStatus())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .orderItems(o.getOrderItems() != null ? o.getOrderItems().stream()
                        .map(it -> OrderResponse.OrderItemResponse.builder()
                                .productId(it.getProductId())
                                .productName(it.getProductName())  // Thêm tên sản phẩm
                                .quantity(it.getQuantity())
                                .price(it.getPrice())
                                .build())
                        .collect(Collectors.toList()) : List.of())
                .build();
    }
}
