import api from './api';

// Payment Service
const paymentService = {
  // Tạo payment mới
  createPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xử lý thanh toán
  processPayment: async (paymentId, paymentDetails) => {
    try {
      const response = await api.post(`/payments/${paymentId}/process`, paymentDetails);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy payment theo ID
  getPaymentById: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy payment theo order ID
  getPaymentByOrderId: async (orderId) => {
    try {
      const response = await api.get(`/payments/order/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy payment history
  getPaymentHistory: async () => {
    try {
      const response = await api.get('/payments/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy tất cả payments (Admin only)
  getAllPayments: async () => {
    try {
      const response = await api.get('/payments');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Refund payment (Admin only)
  refundPayment: async (paymentId, refundData) => {
    try {
      const response = await api.post(`/payments/${paymentId}/refund`, refundData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify payment
  verifyPayment: async (paymentId, verificationData) => {
    try {
      const response = await api.post(`/payments/${paymentId}/verify`, verificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // MoMo specific APIs
  // Lấy MoMo payment result
  getMoMoPaymentResult: async (orderId, resultCode) => {
    try {
      const response = await api.get(`/payments/momo/result`, {
        params: { orderId, resultCode }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xử lý MoMo callback (internal use)
  handleMoMoCallback: async (callbackData) => {
    try {
      const response = await api.post('/payments/momo/callback', callbackData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default paymentService;
