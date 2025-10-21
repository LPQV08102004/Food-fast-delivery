package vn.cnpm.order_service.DTO;

import lombok.Data;

@Data
public class PaymentDTO {
    private Long orderId;
    private Double amount;
    private String status;
}
