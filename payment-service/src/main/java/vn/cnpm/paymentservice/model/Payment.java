package vn.cnpm.paymentservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;
    private Double amount;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Column(unique = true)
    private String idempotencyKey;

    private Integer attemptCount;

    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        updatedAt = createdAt;
        if (attemptCount == null) attemptCount = 0;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
