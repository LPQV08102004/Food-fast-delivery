import api from './api';

// Admin Service - Dành cho các chức năng admin
const adminService = {
  // ============ Dashboard Statistics ============

  // Lấy thống kê dashboard
  getDashboardStats: async () => {
    try {
      // Tạm thời tính toán từ các API có sẵn
      const [users, orders, products] = await Promise.all([
        api.get('/users'),
        api.get('/orders'),
        api.get('/products')
      ]);

      // Tính toán stats
      const today = new Date().toDateString();
      const ordersToday = orders.data.filter(order =>
        new Date(order.createdAt).toDateString() === today
      ).length;

      const totalRevenue = orders.data.reduce((sum, order) => {
        // Try totalPrice first (from backend), then fallback to totalAmount
        const amount = order.totalPrice || order.totalAmount || 0;
        return sum + amount;
      }, 0);

      return {
        totalOrders: orders.data.length,
        ordersToday: ordersToday,
        totalRevenue: totalRevenue,
        totalUsers: users.data.length
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error.response?.data || error.message;
    }
  },

  // Lấy dữ liệu doanh thu theo tháng
  getMonthlyRevenue: async (year) => {
    try {
      const response = await api.get('/orders');
      const orders = response.data;

      // Group orders by month
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        revenue: 0,
        expenses: 0
      }));

      orders.forEach(order => {
        if (order.createdAt) {
          const date = new Date(order.createdAt);
          if (date.getFullYear() === (year || new Date().getFullYear())) {
            const month = date.getMonth();
            // Try totalPrice first (from backend), then fallback to totalAmount
            const amount = order.totalPrice || order.totalAmount || 0;
            monthlyData[month].revenue += amount;
            monthlyData[month].expenses += amount * 0.6; // Giả sử 60% là chi phí
          }
        }
      });

      return monthlyData;
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      throw error.response?.data || error.message;
    }
  },

  // ============ User Management ============

  // Lấy tất cả users
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo user mới (Admin only - uses POST /api/users)
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật user
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Thay đổi trạng thái user (active/inactive)
  toggleUserStatus: async (userId, status) => {
    try {
      const response = await api.put(`/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ============ Order Management ============

  // Lấy tất cả orders
  getAllOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật trạng thái order
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xem chi tiết order
  getOrderDetails: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ============ Product Management ============

  // Lấy tất cả products
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo product mới
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật product
  updateProduct: async (productId, productData) => {
    try {
      const response = await api.put(`/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa product
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Approve product
  approveProduct: async (productId) => {
    try {
      const response = await api.put(`/products/${productId}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reject product
  rejectProduct: async (productId, reason) => {
    try {
      const response = await api.put(`/products/${productId}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ============ Restaurant Management ============

  // Lấy tất cả restaurants
  getAllRestaurants: async (params = {}) => {
    try {
      const response = await api.get('/restaurants', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng ký restaurant kèm tài khoản user
  registerRestaurantWithUser: async (userData, restaurantData) => {
    try {
      // Step 1: Create user account using admin endpoint
      const userResponse = await api.post('/users', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        role: 'RESTAURANT',
        status: userData.status || 'Active'
      });

      // Step 2: Create restaurant linked to user
      const restaurantResponse = await api.post('/restaurants', {
        ...restaurantData,
        userId: userResponse.data.id || userResponse.data.userId
      });

      return {
        user: userResponse.data,
        restaurant: restaurantResponse.data
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo restaurant mới
  createRestaurant: async (restaurantData) => {
    try {
      const response = await api.post('/restaurants', restaurantData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật restaurant
  updateRestaurant: async (restaurantId, restaurantData) => {
    try {
      const response = await api.put(`/restaurants/${restaurantId}`, restaurantData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa restaurant
  deleteRestaurant: async (restaurantId) => {
    try {
      const response = await api.delete(`/restaurants/${restaurantId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Thay đổi trạng thái restaurant
  toggleRestaurantStatus: async (restaurantId, status) => {
    try {
      const response = await api.put(`/restaurants/${restaurantId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ============ Drone Management ============

  // Lấy tất cả drones
  getAllDrones: async (params = {}) => {
    try {
      const response = await api.get('/drones', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo drone mới
  createDrone: async (droneData) => {
    try {
      const response = await api.post('/drones', droneData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật drone
  updateDrone: async (droneId, droneData) => {
    try {
      const response = await api.put(`/drones/${droneId}`, droneData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa drone
  deleteDrone: async (droneId) => {
    try {
      const response = await api.delete(`/drones/${droneId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default adminService;
