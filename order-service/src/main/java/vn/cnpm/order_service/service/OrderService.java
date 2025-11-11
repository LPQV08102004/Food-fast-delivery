package vn.cnpm.order_service.service;

import vn.cnpm.order_service.DTO.OrderRequest;
import vn.cnpm.order_service.DTO.OrderResponse;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(OrderRequest request);
    List<OrderResponse> getAllOrders();
    OrderResponse getOrder(Long id);
    List<OrderResponse> getOrdersByUserId(Long userId);
}
