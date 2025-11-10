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

  // Tạo restaurant mới (Admin only)
  createRestaurant: async (restaurantData) => {
    try {
      const response = await api.post('/restaurants', restaurantData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật restaurant (Admin only)
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

  // ===== PRODUCT MANAGEMENT =====
  
  // Lấy tất cả sản phẩm của restaurant
  getProductsByRestaurantId: async (restaurantId) => {
    try {
      const response = await api.get(`/products/restaurant/${restaurantId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo sản phẩm mới
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật sản phẩm
  updateProduct: async (productId, productData) => {
    try {
      const response = await api.put(`/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa sản phẩm
  deleteProduct: async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      return { success: true };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tìm kiếm sản phẩm theo tên
  searchProducts: async (searchTerm) => {
    try {
      const response = await api.get(`/products/search?name=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy sản phẩm theo ID
  getProductById: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ===== ORDER MANAGEMENT =====
  
  // Lấy tất cả đơn hàng
  getAllOrders: async () => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy đơn hàng theo ID
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ===== CATEGORY MANAGEMENT =====
  
  // Lấy tất cả danh mục
  getAllCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ===== STATISTICS & ANALYTICS =====
  
  // Thống kê doanh thu theo thời gian
  getRevenueStats: async (restaurantId, period = '30') => {
    try {
      // Lấy tất cả đơn hàng
      const orders = await restaurantService.getAllOrders();
      
      // Lọc theo thời gian
      const now = new Date();
      const daysAgo = new Date(now);
      daysAgo.setDate(daysAgo.getDate() - parseInt(period));
      
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= daysAgo && order.status !== 'CANCELLED';
      });
      
      // Tính tổng doanh thu và số đơn
      const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      const totalOrders = filteredOrders.length;
      
      // Nhóm theo tuần để vẽ biểu đồ
      const weeklyData = groupOrdersByWeek(filteredOrders);
      
      return {
        totalRevenue,
        totalOrders,
        chartData: weeklyData,
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Thống kê sản phẩm bán chạy
  getProductStats: async (restaurantId) => {
    try {
      const orders = await restaurantService.getAllOrders();
      const products = await restaurantService.getProductsByRestaurantId(restaurantId);
      
      // Đếm số lượng bán của từng sản phẩm
      const productSales = {};
      orders.forEach(order => {
        if (order.status !== 'CANCELLED' && order.orderItems) {
          order.orderItems.forEach(item => {
            if (!productSales[item.productId]) {
              productSales[item.productId] = {
                productId: item.productId,
                productName: item.productName,
                quantity: 0,
                revenue: 0,
              };
            }
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].revenue += item.price * item.quantity;
          });
        }
      });
      
      // Tìm sản phẩm bán chạy nhất
      const productList = Object.values(productSales);
      const bestSeller = productList.sort((a, b) => b.quantity - a.quantity)[0] || {
        productName: 'N/A',
        quantity: 0,
      };
      
      return {
        bestSeller,
        totalProducts: products.length,
        productSales: productList,
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Helper function: Nhóm đơn hàng theo tuần
const groupOrdersByWeek = (orders) => {
  const weeks = {};
  
  orders.forEach(order => {
    const date = new Date(order.createdAt);
    const weekNumber = getWeekNumber(date);
    const weekKey = `Week ${weekNumber}`;
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = { date: weekKey, revenue: 0, orders: 0 };
    }
    
    weeks[weekKey].revenue += order.totalPrice || 0;
    weeks[weekKey].orders += 1;
  });
  
  return Object.values(weeks);
};

// Helper function: Tính số tuần trong năm
const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export default restaurantService;
