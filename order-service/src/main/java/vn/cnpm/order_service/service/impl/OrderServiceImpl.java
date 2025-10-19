package vn.cnpm.order_service.service.impl;

import vn.cnpm.order_service.DTO.OrderRequest;
import vn.cnpm.order_service.DTO.OrderResponse;
import vn.cnpm.order_service.model.Order;
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

    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {

        Order order = Order.builder()
                .userId(request.getUserId())
                .product(request.getProduct())
                .price(request.getPrice())
                .status(OrderStatus.PAYMENT_PENDING)
                .build();
        Order saved = orderRepository.save(order);


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
    public OrderResponse getOrderById(Long id) {
        Order o = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        return mapToDto(o);
    }

    private OrderResponse mapToDto(Order o) {
        return OrderResponse.builder()
                .id(o.getId())
                .userId(o.getUserId())
                .product(o.getProduct())
                .price(o.getPrice())
                .status(o.getStatus())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
