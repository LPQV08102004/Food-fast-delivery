package vn.cnpm.product_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.cnpm.product_service.dto.RestaurantResponse;
import vn.cnpm.product_service.dto.RestaurantResquest;
import vn.cnpm.product_service.models.Restaurant;
import vn.cnpm.product_service.repository.RestaurantRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService{
    @Autowired
    private final RestaurantRepository restaurantRepository;

    @Override
    public List<RestaurantResponse> getAllRestaurants() {
        List<Restaurant> restaurants=restaurantRepository.findAll();
        return restaurants.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public RestaurantResponse getRestaurantById(Long id) {
        Restaurant restaurant=restaurantRepository.findById(id)
            .orElseThrow(()->new RuntimeException("Restaurant not found with id: "+id));
        return mapToResponse(restaurant);
    }

    @Override
    public RestaurantResponse createRestaurant(RestaurantResquest request) {
        // Kiểm tra xem userId có được cung cấp không
        if (request.getUserId() == null) {
            throw new RuntimeException("User ID is required");
        }

        // Kiểm tra xem userId đã có restaurant chưa (vì unique constraint)
        if (restaurantRepository.existsByUserId(request.getUserId())) {
            throw new RuntimeException("User already has a restaurant");
        }

        // TODO: Có thể thêm validation để kiểm tra user có tồn tại và có role RESTAURANT không
        // bằng cách gọi API sang user-service qua RestTemplate hoặc WebClient

        Restaurant restaurant = Restaurant.builder()
                .name(request.getName())
                .address(request.getAddress())
                .num_phone(request.getPhone())
                .userId(request.getUserId())
                .description(request.getDescription())
                .rating(0.0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return mapToResponse(savedRestaurant);
    }

    @Override
    public RestaurantResponse updateRestaurant(Long id, RestaurantResquest request){
        Restaurant restaurant=restaurantRepository.findById(id)
            .orElseThrow(()->new RuntimeException("Restaurant not found with id: "+id));

        restaurant.setName(request.getName());
        restaurant.setAddress(request.getAddress());
        restaurant.setNum_phone(request.getPhone());

        if (request.getDescription() != null) {
            restaurant.setDescription(request.getDescription());
        }
        if (request.getIsActive() != null) {
            restaurant.setIsActive(request.getIsActive());
        }
        // userId không được phép thay đổi sau khi tạo để đảm bảo tính toàn vẹn dữ liệu

        Restaurant updatedRestaurant=restaurantRepository.save(restaurant);
        return mapToResponse(updatedRestaurant);
    }

    @Override
    public void deleteRestaurant(Long id){
        Restaurant restaurant=restaurantRepository.findById(id)
            .orElseThrow(()->new RuntimeException("Restaurant not found with id: "+id));
        restaurantRepository.delete(restaurant);
    }

    @Override
    public Optional<RestaurantResponse> getRestaurantByUserId(Long userId) {
        return restaurantRepository.findByUserId(userId)
                .map(this::mapToResponse);
    }

    @Override
    public List<RestaurantResponse> getActiveRestaurants() {
        List<Restaurant> restaurants = restaurantRepository.findByIsActiveTrue();
        return restaurants.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private RestaurantResponse mapToResponse(Restaurant restaurant) {
        return RestaurantResponse.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .address(restaurant.getAddress())
                .phoneNumber(restaurant.getNum_phone())
                .userId(restaurant.getUserId())
                .description(restaurant.getDescription())
                .rating(restaurant.getRating())
                .isActive(restaurant.getIsActive())
                .deliveryTime("25-30 min") // Tạm thời hard-code, có thể tính toán sau
                .productCount(restaurant.getProductList() != null ? restaurant.getProductList().size() : 0)
                .build();
    }
}
