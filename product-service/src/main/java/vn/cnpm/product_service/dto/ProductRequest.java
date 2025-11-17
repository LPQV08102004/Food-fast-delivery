package vn.cnpm.product_service.dto;

import lombok.Data;

@Data
public class ProductRequest {
    private String name;
    private String description;
    private Double price;
    private int stock;
    private Long categoryId;
    private Long restaurantId;
    private Boolean isActive;
}
