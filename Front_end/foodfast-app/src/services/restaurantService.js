import api from './api';

// Restaurant Service
const restaurantService = {
  // Lấy tất cả restaurants
  getAllRestaurants: async () => {
    try {
      const response = await api.get('/restaurants');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy restaurant theo ID
  getRestaurantById: async (restaurantId) => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tìm kiếm restaurants
  searchRestaurants: async (searchParams) => {
    try {
      const response = await api.get('/restaurants/search', { params: searchParams });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng ký restaurant mới
  registerRestaurant: async (restaurantData) => {
    try {
      const response = await api.post('/restaurants', restaurantData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật restaurant (Admin/Owner only)
  updateRestaurant: async (restaurantId, restaurantData) => {
    try {
      const response = await api.put(`/restaurants/${restaurantId}`, restaurantData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa restaurant (Admin only)
  deleteRestaurant: async (restaurantId) => {
    try {
      const response = await api.delete(`/restaurants/${restaurantId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Approve restaurant (Admin only)
  approveRestaurant: async (restaurantId) => {
    try {
      const response = await api.put(`/restaurants/${restaurantId}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Activate/Deactivate restaurant (Admin only)
  updateRestaurantStatus: async (restaurantId, status) => {
    try {
      const response = await api.put(`/restaurants/${restaurantId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy menu của restaurant
  getRestaurantMenu: async (restaurantId) => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}/menu`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy restaurant reviews
  getRestaurantReviews: async (restaurantId) => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}/reviews`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default restaurantService;
