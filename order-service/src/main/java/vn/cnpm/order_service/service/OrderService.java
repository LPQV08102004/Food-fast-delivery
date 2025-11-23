package vn.cnpm.order_service.service;

import vn.cnpm.order_service.DTO.OrderRequest;
import vn.cnpm.order_service.DTO.OrderResponse;
import vn.cnpm.order_service.model.OrderStatus;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(OrderRequest request);
    List<OrderResponse> getAllOrders();
    OrderResponse getOrder(Long id);
    List<OrderResponse> getOrdersByUserId(Long userId);
    OrderResponse updateOrderStatus(Long orderId, OrderStatus status);
    OrderResponse cancelOrder(Long orderId);
    List<OrderResponse> getOrdersByRestaurantId(Long restaurantId);
}
