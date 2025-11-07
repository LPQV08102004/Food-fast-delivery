package vn.cnpm.product_service.service;

import vn.cnpm.product_service.dto.RestaurantResponse;
import vn.cnpm.product_service.dto.RestaurantResquest;

import java.util.List;

public interface RestaurantService {
    List<RestaurantResponse> getAllRestaurants();
    RestaurantResponse getRestaurantById(Long id);
    RestaurantResponse createRestaurant(RestaurantResquest resquest);
    RestaurantResponse updateRestaurant(Long id,RestaurantResquest resquest);
    void deleteRestaurant(Long id);
}
