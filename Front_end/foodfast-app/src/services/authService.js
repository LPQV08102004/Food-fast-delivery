import api from './api';

// Authentication Service
const authService = {
  // Đăng ký user mới
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Nếu là restaurant owner, lấy restaurantId từ backend
          if (response.data.user.role === 'RESTAURANT' || response.data.user.role === 'RESTAURANT_OWNER') {
            try {
              const restaurantResponse = await api.get(`/restaurants/user/${response.data.user.id}`);
              if (restaurantResponse.data && restaurantResponse.data.id) {
                localStorage.setItem('restaurantId', restaurantResponse.data.id.toString());
                // Cập nhật user object với restaurantId
                const updatedUser = { ...response.data.user, restaurantId: restaurantResponse.data.id };
                localStorage.setItem('user', JSON.stringify(updatedUser));
              }
            } catch (restaurantError) {
              console.error('Error fetching restaurant:', restaurantError);
            }
          }
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng nhập
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Nếu là restaurant owner, lấy restaurantId từ backend
          if (response.data.user.role === 'RESTAURANT' || response.data.user.role === 'RESTAURANT_OWNER') {
            try {
              const restaurantResponse = await api.get(`/restaurants/user/${response.data.user.id}`);
              if (restaurantResponse.data && restaurantResponse.data.id) {
                localStorage.setItem('restaurantId', restaurantResponse.data.id.toString());
                // Cập nhật user object với restaurantId
                const updatedUser = { ...response.data.user, restaurantId: restaurantResponse.data.id };
                localStorage.setItem('user', JSON.stringify(updatedUser));
              }
            } catch (restaurantError) {
              console.error('Error fetching restaurant:', restaurantError);
            }
          }
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('restaurantId');
  },

  // Lấy user hiện tại
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  },

  // Kiểm tra user đã đăng nhập
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Lấy token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Kiểm tra user có phải admin không
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'ADMIN';
  },

  // Kiểm tra user có phải restaurant owner không
  isRestaurant: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'RESTAURANT' || user?.role === 'RESTAURANT_OWNER';
  },

  // Lấy restaurantId từ user hiện tại hoặc localStorage
  getRestaurantId: () => {
    const user = authService.getCurrentUser();
    if (user?.restaurantId) {
      return user.restaurantId;
    }
    // Fallback: lấy từ localStorage
    const restaurantId = localStorage.getItem('restaurantId');
    return restaurantId ? parseInt(restaurantId) : null;
  },

  // Kiểm tra role của user
  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user?.role || null;
  },
};

export default authService;
