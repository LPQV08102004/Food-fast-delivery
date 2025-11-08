package vn.cnpm.order_service.service.impl;

import vn.cnpm.order_service.DTO.*;
import vn.cnpm.order_service.client.PaymentClient;
import vn.cnpm.order_service.client.ProductClient;
import vn.cnpm.order_service.model.Order;
import vn.cnpm.order_service.model.OrderItem;
import vn.cnpm.order_service.model.OrderStatus;
import vn.cnpm.order_service.repository.OrderRepository;
import vn.cnpm.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final PaymentClient paymentClient;
    private final ProductClient productClient;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        // Tạo order trước (không có items)
        Order order = Order.builder()
                .userId(request.getUserId())
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

        // Gọi payment service để xử lý thanh toán
        try {
            PaymentDTO paymentRequest = PaymentDTO.builder()
                    .orderId(saved.getId())
                    .amount(saved.getTotalPrice())
                    .paymentMethod(saved.getPaymentMethod())
                    .build();

            PaymentDTO paymentResponse = paymentClient.createPayment(paymentRequest);

            // Cập nhật payment status
            saved.setPaymentStatus(paymentResponse.getStatus());

            // Nếu thanh toán thành công, cập nhật order status
            if ("SUCCESS".equals(paymentResponse.getStatus())) {
                saved.setStatus(OrderStatus.CONFIRMED);
            } else {
                saved.setStatus(OrderStatus.CANCELLED);
            }

            saved = orderRepository.save(saved);
        } catch (Exception e) {
            // Nếu payment service fail, vẫn giữ order nhưng đánh dấu payment failed
            saved.setPaymentStatus("FAILED");
            saved.setStatus(OrderStatus.CANCELLED);
            saved = orderRepository.save(saved);
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
