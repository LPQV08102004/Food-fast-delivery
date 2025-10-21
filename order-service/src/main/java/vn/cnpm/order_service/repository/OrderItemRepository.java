package vn.cnpm.order_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.cnpm.order_service.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem,Long> {
}
