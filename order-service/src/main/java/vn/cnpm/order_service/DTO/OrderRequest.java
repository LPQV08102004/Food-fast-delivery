package vn.cnpm.order_service.DTO;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class OrderRequest {
    @NotNull
    private Long userId;

    @NotNull
    private String product;

    @Positive
    private Double price;
}
