// API Configuration
// Sử dụng biến môi trường hoặc tự động detect dựa trên hostname

// Get current hostname
const hostname = window.location.hostname;

// Determine API base URLs based on environment
let API_GATEWAY_URL;
let PAYMENT_SERVICE_URL;

if (process.env.REACT_APP_API_GATEWAY_URL) {
  // Use environment variable if provided
  API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL;
} else if (hostname === 'localhost' || hostname === '127.0.0.1') {
  // Local development
  API_GATEWAY_URL = 'http://localhost:8080/api';
} else {
  // LAN or production - use same hostname
  API_GATEWAY_URL = `http://${hostname}:8080/api`;
}

if (process.env.REACT_APP_PAYMENT_SERVICE_URL) {
  PAYMENT_SERVICE_URL = process.env.REACT_APP_PAYMENT_SERVICE_URL;
} else if (hostname === 'localhost' || hostname === '127.0.0.1') {
  PAYMENT_SERVICE_URL = 'http://localhost:8084/api';
} else {
  // LAN or production - use same hostname
  PAYMENT_SERVICE_URL = `http://${hostname}:8084/api`;
}

const config = {
  API_GATEWAY_URL,
  PAYMENT_SERVICE_URL,
  
  // Helper function to get payment service URL
  getPaymentServiceUrl: (path = '') => {
    return `${PAYMENT_SERVICE_URL}${path}`;
  },
  
  // Helper function to get API gateway URL
  getApiGatewayUrl: (path = '') => {
    return `${API_GATEWAY_URL}${path}`;
  },
};

export default config;
