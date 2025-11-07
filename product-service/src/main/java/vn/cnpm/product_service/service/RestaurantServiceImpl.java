package vn.cnpm.product_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.cnpm.product_service.dto.RestaurantResponse;
import vn.cnpm.product_service.dto.RestaurantResquest;
import vn.cnpm.product_service.models.Restaurant;
import vn.cnpm.product_service.repository.RestaurantRepository;

import java.util.List;
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
        Restaurant restaurant=restaurantRepository.findById(id).orElseThrow(()->new RuntimeException("Restaurant not found with id: "+id));
        return mapToResponse(restaurant);
    }
    public RestaurantResponse createRestaurant(RestaurantResquest request) {
        Restaurant restaurant = Restaurant.builder()
                .name(request.getName())
                .address(request.getAddress())
                .num_phone(request.getPhone())
                .build();
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return mapToResponse(savedRestaurant);
    }
    public RestaurantResponse updateRestaurant(Long id, RestaurantResquest request){
        Restaurant restaurant=restaurantRepository.findById(id).orElseThrow(()->new RuntimeException("Restaurant not found with id: "+id));
        restaurant.setName(request.getName());
        restaurant.setAddress(request.getAddress());
        restaurant.setNum_phone(request.getPhone());
        Restaurant updatedRestaurant=restaurantRepository.save(restaurant);
        return mapToResponse(updatedRestaurant);
    }
    public void deleteRestaurant(Long id){
        Restaurant restaurant=restaurantRepository.findById(id).orElseThrow(()->new RuntimeException("Restaurant not found with id: "+id));
        restaurantRepository.delete(restaurant);
    }

    private RestaurantResponse mapToResponse(Restaurant restaurant) {
        return RestaurantResponse.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .address(restaurant.getAddress())
                .phoneNumber(restaurant.getNum_phone())
                .rating(4.5) // Tạm thời hard-code, có thể thêm vào database sau
                .deliveryTime("25-30 min") // Tạm thời hard-code
                .productCount(restaurant.getProductList() != null ? restaurant.getProductList().size() : 0)
                .build();
    }
}
