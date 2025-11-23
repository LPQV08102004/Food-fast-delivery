package vn.cnpm.order_service.controller;

import vn.cnpm.order_service.DTO.OrderRequest;
import vn.cnpm.order_service.DTO.OrderResponse;
import vn.cnpm.order_service.model.OrderStatus;
import vn.cnpm.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrder(id));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(orderService.getOrdersByRestaurantId(restaurantId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            OrderStatus status = OrderStatus.valueOf(request.get("status"));
            return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderService.cancelOrder(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
