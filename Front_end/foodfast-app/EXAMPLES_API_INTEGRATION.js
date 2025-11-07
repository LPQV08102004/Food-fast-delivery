/* eslint-disable */
// ============================================
// ⚠️ FILE VÍ DỤ - KHÔNG SỬ DỤNG TRỰC TIẾP
// ============================================
// File này chỉ để THAM KHẢO cách tích hợp API
// Không phải file thực tế để chạy
// Có thể có lỗi compile - đây là bình thường
// ============================================

// ============================================
// VÍ DỤ: Cập nhật LoginPage.js với API
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import productService from '../services/productService';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import userService from '../services/userService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

function LoginPageWithAPI() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Gọi API login
      const response = await authService.login({
        username: formData.username,
        password: formData.password
      });

      // Token đã tự động lưu vào localStorage trong authService
      toast.success('Login successful!');
      
      // Check role để redirect
      const user = authService.getCurrentUser();
      if (user?.role === 'ADMIN' || user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/products');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <p className="text-center text-gray-500">
            Sign in to your account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Username
              </label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-500">Don't have an account? </span>
              <Link to="/register" className="text-orange-500 hover:text-orange-600 font-medium">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPageWithAPI;

// ============================================
// VÍ DỤ: Cập nhật RegisterPage.js với API
// ============================================

function RegisterPageWithAPI() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Gọi API register
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });

      toast.success('Registration successful! Please login.');
      navigate('/login');
      
    } catch (error) {
      console.error('Register error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
            />
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              required
            />
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// VÍ DỤ: Cập nhật ProductPage.js với API
// ============================================

function ProductPageWithAPI() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
  }, [selectedRestaurant]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      let data;
      
      if (selectedRestaurant === 'all') {
        // Lấy tất cả products
        data = await productService.getAllProducts();
      } else {
        // Lọc theo restaurant
        data = await productService.getProductsByRestaurant(selectedRestaurant);
      }
      
      setProducts(data);
    } catch (error) {
      console.error('Load products error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadProducts();
      return;
    }

    try {
      const results = await productService.searchProducts({
        keyword: searchQuery
      });
      setProducts(results);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const addToCart = (product) => {
    // Lưu vào localStorage hoặc state management
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div>
      {/* Search bar */}
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search products..."
      />

      {/* Products grid */}
      <div className="grid grid-cols-4 gap-4">
        {products.map(product => (
          <Card key={product.id}>
            <CardContent>
              <h3>{product.name}</h3>
              <p>${product.price}</p>
              <Button onClick={() => addToCart(product)}>
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================
// VÍ DỤ: Cập nhật CartPage.js với Checkout
// ============================================

function CartPageWithCheckout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load cart từ localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  }, []);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);

    try {
      // 1. Tạo order
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryAddress: '123 Main St', // Lấy từ form
        notes: 'Please ring doorbell',
        totalAmount: calculateTotal()
      };

      const order = await orderService.createOrder(orderData);
      
      toast.success('Order created successfully!');
      
      // Clear cart
      localStorage.removeItem('cart');
      
      // Chuyển sang payment page
      navigate('/payment', { state: { orderId: order.id } });
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Checkout failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div>
      {cartItems.map(item => (
        <div key={item.id}>
          <p>{item.name} x {item.quantity}</p>
          <p>${(item.price * item.quantity).toFixed(2)}</p>
        </div>
      ))}
      
      <div>
        <p>Total: ${calculateTotal().toFixed(2)}</p>
        <Button onClick={handleCheckout} disabled={loading}>
          {loading ? 'Processing...' : 'Proceed to Checkout'}
        </Button>
      </div>
    </div>
  );
}

// ============================================
// VÍ DỤ: Cập nhật PaymentPage.js với API
// ============================================

function PaymentPageWithAPI() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const handlePayment = async () => {
    if (!orderId) {
      toast.error('No order found');
      return;
    }

    setLoading(true);

    try {
      // 1. Tạo payment
      const payment = await paymentService.createPayment({
        orderId: orderId,
        method: paymentMethod,
        amount: 45.50 // Lấy từ order
      });

      // 2. Xử lý payment
      if (paymentMethod === 'card') {
        await paymentService.processPayment(payment.id, {
          cardNumber: cardDetails.cardNumber,
          expiryDate: cardDetails.expiryDate,
          cvv: cardDetails.cvv
        });
      } else {
        // COD - chỉ cần confirm
        await paymentService.processPayment(payment.id, {
          method: 'cash'
        });
      }

      toast.success('Payment successful!');
      navigate('/orders'); // Chuyển đến order tracking
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
        <option value="card">Credit/Debit Card</option>
        <option value="cash">Cash on Delivery</option>
      </select>

      {paymentMethod === 'card' && (
        <div>
          <Input
            placeholder="Card Number"
            value={cardDetails.cardNumber}
            onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
          />
          <Input
            placeholder="MM/YY"
            value={cardDetails.expiryDate}
            onChange={(e) => setCardDetails({...cardDetails, expiryDate: e.target.value})}
          />
          <Input
            placeholder="CVV"
            value={cardDetails.cvv}
            onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
          />
        </div>
      )}

      <Button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : 'Complete Payment'}
      </Button>
    </div>
  );
}

// ============================================
// VÍ DỤ: AdminPage với API
// ============================================

function AdminPageWithAPI() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [usersData, ordersData, productsData] = await Promise.all([
        userService.getAllUsers(),
        orderService.getAllOrders(),
        productService.getAllProducts()
      ]);

      setUsers(usersData);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await userService.deleteUser(userId);
      toast.success('User deleted');
      loadAdminData(); // Reload
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      toast.success('Status updated');
      loadAdminData();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  // Render admin screens...
}
