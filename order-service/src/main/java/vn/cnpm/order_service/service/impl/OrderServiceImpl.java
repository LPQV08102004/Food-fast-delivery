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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final ProductClient productClient;
    private final OrderRepository orderRepository;
    private final PaymentClient paymentClient;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        double total = 0;
        List<OrderItem> items = request.getItems().stream().map(i -> {
            ProductDTO product = productClient.getProductById(i.getProductId());
            if (product.getStock() < i.getQuantity()) {
                throw new RuntimeException("Product " + product.getName() + " out of stock");
            }

            total += product.getPrice() * i.getQuantity();

            // giảm tồn kho
            productClient.reduceStock(product.getId(), i.getQuantity());

            return OrderItem.builder()
                    .productId(product.getId())
                    .quantity(i.getQuantity())
                    .price(product.getPrice())
                    .build();
        }).toList();
        Order order = Order.builder()
                .userId(request.getUserId())
                .totalPrice(total)
                .status(OrderStatus.PAYMENT_PENDING)
                .orderItems(items)
                .build();
        Order saved = orderRepository.save(order);
        PaymentDTO paymentReq = new PaymentDTO();
        paymentReq.setOrderId(order.getId());
        paymentReq.setAmount(total);

        PaymentDTO paymentRes = paymentClient.createPayment(paymentReq);

        // 4️⃣ Cập nhật trạng thái
        if ("SUCCESS".equalsIgnoreCase(paymentRes.getStatus())) {
            order.setStatus(OrderStatus.PAID);
        } else {
            order.setStatus(OrderStatus.FAILED);
        }
        orderRepository.save(order);

        // 5️⃣ Trả response
        return OrderResponse.builder()
                .id(order.getId())
                .status(order.getStatus())
                .totalPrice(order.getTotalPrice())
                .items(items.stream()
                        .map(it -> OrderResponse.OrderItemResponse.builder()
                                .productId(it.getProductId())
                                .quantity(it.getQuantity())
                                .price(it.getPrice())
                                .build())
                        .toList())
                .build();

//        return mapToDto(saved);
    }

//    @Override
//    public List<OrderResponse> getAllOrders() {
//        return orderRepository.findAll()
//                .stream()
//                .map(this::mapToDto)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public OrderResponse getOrderById(Long id) {
//        Order o = orderRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
//        return mapToDto(o);
//    }

//    private OrderResponse mapToDto(Order o) {
//        return OrderResponse.builder()
//                .id(o.getId())
//                .userId(o.getUserId())
//                .product(o.getProduct())
//                .price(o.getPrice())
//                .status(o.getStatus())
//                .createdAt(o.getCreatedAt())
//                .updatedAt(o.getUpdatedAt())
//                .build();
//    }
@Override
public OrderResponse getOrder(Long id) {
    Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));
    return OrderResponse.builder()
            .id(order.getId())
            .status(order.getStatus())
            .totalPrice(order.getTotalPrice())
            .items(order.getOrderItems().stream()
                    .map(it -> OrderResponse.OrderItemResponse.builder()
                            .productId(it.getProductId())
                            .quantity(it.getQuantity())
                            .price(it.getPrice())
                            .build())
                    .toList())
            .build();
}
public List<OrderResponse> getAllOrders(){
    return orderRepository.findAll()
            .stream()
            .map(order -> OrderResponse.builder()
                    .id(order.getId())
                    .status(order.getStatus())  // nếu bạn dùng Enum
                    .totalPrice(order.getTotalPrice())
                    .items(order.getOrderItems().stream()
                            .map(it -> OrderResponse.OrderItemResponse.builder()
                                    .productId(it.getProductId())
                                    .quantity(it.getQuantity())
                                    .price(it.getPrice())
                                    .build())
                            .toList())
                    .build())
            .toList();
}
}
