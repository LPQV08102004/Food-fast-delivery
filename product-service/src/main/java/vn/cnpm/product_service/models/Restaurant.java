package vn.cnpm.product_service.models;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name="restaurants")
@Builder
public class Restaurant {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(name = "num_phone")
    private String num_phone;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId; // Liên kết với User có role RESTAURANT (mỗi user chỉ có 1 restaurant)

    @Column(length = 1000)
    private String description; // Mô tả về nhà hàng

    @Column
    private Double rating = 0.0; // Đánh giá trung bình

    @Column(name = "is_active")
    private Boolean isActive = true; // Trạng thái hoạt động của nhà hàng

    @OneToMany(mappedBy="restaurant",cascade=CascadeType.ALL,orphanRemoval=true)
    private List<Product> productList=new ArrayList<>();
}
