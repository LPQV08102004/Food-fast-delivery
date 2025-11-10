package vn.cnpm.product_service.dto;

import lombok.Data;

@Data
public class RestaurantResquest {
    private String name;
    private String address;
    private String phone;
    private Long userId; // User ID với role RESTAURANT
    private String description;
    private Boolean isActive;
}
