package vn.cnpm.product_service.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name="products")
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;
    
    @Version
    @Column(columnDefinition = "BIGINT DEFAULT 0")
    @Builder.Default
    private Long version = 0L;  // For optimistic locking - initialize to 0
    
    @Column(nullable = false)
    private String name;
    private String description;
    private Double price;
    private int stock;
    @Builder.Default
    private Boolean isActive = true;
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="category_id")
    private Category category;
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Product_image> images;
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="restaurant_id")
    private Restaurant restaurant;
}
