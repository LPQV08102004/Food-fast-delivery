package vn.cnpm.paymentservice.DTO;

import vn.cnpm.paymentservice.model.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private Double amount;
    private PaymentStatus status;
    private String idempotencyKey;
    private Instant createdAt;
    private Instant updatedAt;

    // MoMo specific fields
    private String momoPayUrl;
    private String momoRequestId;
    private String momoOrderId;
    private Integer momoResultCode;
    private String momoMessage;
}
