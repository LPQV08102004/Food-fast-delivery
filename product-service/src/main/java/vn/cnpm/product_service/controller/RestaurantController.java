package vn.cnpm.product_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.cnpm.product_service.dto.RestaurantResponse;
import vn.cnpm.product_service.dto.RestaurantResquest;
import vn.cnpm.product_service.service.RestaurantService;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {
    private final RestaurantService restaurantService;

    @GetMapping
    public List<RestaurantResponse> getAllRestaurants() {
        return restaurantService.getAllRestaurants();
    }

    @GetMapping("/{id}")
    public RestaurantResponse getRestaurantById(@PathVariable Long id) {
        return restaurantService.getRestaurantById(id);
    }

    // Endpoint mới: Lấy restaurant theo userId
    @GetMapping("/user/{userId}")
    public ResponseEntity<RestaurantResponse> getRestaurantByUserId(@PathVariable Long userId) {
        return restaurantService.getRestaurantByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoint mới: Lấy danh sách restaurant đang hoạt động
    @GetMapping("/active")
    public List<RestaurantResponse> getActiveRestaurants() {
        return restaurantService.getActiveRestaurants();
    }

    @PostMapping
    public RestaurantResponse createRestaurant(@RequestBody RestaurantResquest request) {
        return restaurantService.createRestaurant(request);
    }

    @PutMapping("/{id}")
    public RestaurantResponse updateRestaurant(@PathVariable Long id, @RequestBody RestaurantResquest request) {
        return restaurantService.updateRestaurant(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteRestaurant(@PathVariable Long id) {
        restaurantService.deleteRestaurant(id);
    }
}
