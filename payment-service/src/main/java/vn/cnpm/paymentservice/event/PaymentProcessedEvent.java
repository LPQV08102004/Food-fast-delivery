package vn.cnpm.paymentservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentProcessedEvent implements Serializable {
    private Long orderId;
    private Long paymentId;
    private String status; // SUCCESS, FAILED
    private String message;
}
