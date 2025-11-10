package vn.cnpm.product_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantResponse {
    private Long id;
    private String name;
    private String address;
    private String phoneNumber;
    private Long userId; // User ID với role RESTAURANT
    private String description;
    private Double rating;
    private Boolean isActive;
    private String deliveryTime;
    private Integer productCount;
}
