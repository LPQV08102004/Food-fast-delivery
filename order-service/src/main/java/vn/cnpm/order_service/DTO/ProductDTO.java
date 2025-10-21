package vn.cnpm.order_service.DTO;

import lombok.Data;

@Data
public class ProductDTO {
    private long id;
    private String name;
    private double price;
    private int stock;
}
