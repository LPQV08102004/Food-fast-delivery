import axios from 'axios';
import config from '../config/apiConfig';

// Create axios instance for delivery service
const deliveryApi = axios.create({
  baseURL: config.getDeliveryServiceUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
deliveryApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const deliveryService = {
  // Lấy delivery info theo orderId
  getDeliveryByOrderId: async (orderId) => {
    try {
      const response = await deliveryApi.get(`/deliveries/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery:', error);
      throw error;
    }
  },

  // Lấy delivery info theo deliveryId
  getDeliveryById: async (deliveryId) => {
    try {
      const response = await deliveryApi.get(`/deliveries/${deliveryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery by ID:', error);
      throw error;
    }
  },

  // Lấy tất cả deliveries đang hoạt động
  getActiveDeliveries: async () => {
    try {
      const response = await deliveryApi.get('/deliveries/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active deliveries:', error);
      throw error;
    }
  },

  // Lấy tất cả deliveries
  getAllDeliveries: async () => {
    try {
      const response = await deliveryApi.get('/deliveries');
      return response.data;
    } catch (error) {
      console.error('Error fetching all deliveries:', error);
      throw error;
    }
  },

  // Lấy deliveries theo droneId
  getDeliveriesByDrone: async (droneId) => {
    try {
      const response = await deliveryApi.get(`/deliveries/drone/${droneId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching deliveries by drone:', error);
      throw error;
    }
  },

  // Cập nhật vị trí drone (for tracking)
  updateDroneLocation: async (deliveryId, lat, lng) => {
    try {
      const response = await deliveryApi.put(`/deliveries/${deliveryId}/location`, null, {
        params: { lat, lng }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating drone location:', error);
      throw error;
    }
  },

  // Thủ công đánh dấu drone đã lấy hàng (for testing)
  markPickedUp: async (deliveryId) => {
    try {
      const response = await deliveryApi.post(`/deliveries/${deliveryId}/pickup`);
      return response.data;
    } catch (error) {
      console.error('Error marking picked up:', error);
      throw error;
    }
  },

  // Thủ công bắt đầu giao hàng (for testing)
  startDelivery: async (deliveryId) => {
    try {
      const response = await deliveryApi.post(`/deliveries/${deliveryId}/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting delivery:', error);
      throw error;
    }
  },

  // Thủ công hoàn thành giao hàng (for testing)
  completeDelivery: async (deliveryId) => {
    try {
      const response = await deliveryApi.post(`/deliveries/${deliveryId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing delivery:', error);
      throw error;
    }
  },

  // Helper function để format delivery status
  formatDeliveryStatus: (status) => {
    const statusMap = {
      PENDING: 'Đang chờ',
      ASSIGNED: 'Đã phân công drone',
      PICKING_UP: 'Drone đang đến nhà hàng',
      PICKED_UP: 'Đã lấy hàng',
      DELIVERING: 'Đang giao hàng',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy'
    };
    return statusMap[status] || status;
  },

  // Helper function để get delivery status color
  getDeliveryStatusColor: (status) => {
    const colorMap = {
      PENDING: 'bg-gray-100 text-gray-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      PICKING_UP: 'bg-yellow-100 text-yellow-800',
      PICKED_UP: 'bg-purple-100 text-purple-800',
      DELIVERING: 'bg-indigo-100 text-indigo-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }
};

export default deliveryService;
