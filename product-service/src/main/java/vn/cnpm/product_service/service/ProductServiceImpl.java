package vn.cnpm.product_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.cnpm.product_service.dto.ProductRequest;
import vn.cnpm.product_service.dto.ProductResponse;
import vn.cnpm.product_service.models.Category;
import vn.cnpm.product_service.models.Product;
import vn.cnpm.product_service.models.Product_image;
import vn.cnpm.product_service.models.Restaurant;
import vn.cnpm.product_service.repository.CategoryRepository;
import vn.cnpm.product_service.repository.ProductRepository;
import vn.cnpm.product_service.repository.RestaurantRepository;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Restaurant restaurant = null;
        if (request.getRestaurantId() != null) {
            restaurant = restaurantRepository.findById(request.getRestaurantId())
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .category(category)
                .restaurant(restaurant)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        productRepository.save(product);
        return mapToResponse(product);
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToResponse(product);
    }
    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    public List<ProductResponse> getProductsByCategoryId(Long categoryId) {
        List<Product> products = productRepository.findByCategoryId(categoryId);
        return products.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    public List<ProductResponse> getProductsByCategoryName(String categoryName) {
        List<Product> products = productRepository.findByCategoryName(categoryName);
        return products.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    public List<ProductResponse> getProductsByNameContaining(String name) {
        List<Product> products = productRepository.findByNameContainingIgnoreCase(name);
        return products.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    public List<ProductResponse> getProductsByRestaurantId(Long restaurantId) {
        List<Product> products = productRepository.findByRestaurantId(restaurantId);
        return products.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Restaurant restaurant = null;
        if (request.getRestaurantId() != null) {
            restaurant = restaurantRepository.findById(request.getRestaurantId())
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(category);
        product.setRestaurant(restaurant);
        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }
        productRepository.save(product);
        return mapToResponse(product);
    }
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        productRepository.delete(product);
    }
    public ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .isActive(product.getIsActive())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .restaurantId(product.getRestaurant() != null ? product.getRestaurant().getId() : null)
                .image_urls(product.getImages() != null
                        ? product.getImages().stream().map(Product_image::getImageUrl).toList()
                        : List.of())
                .build();
    }
}
