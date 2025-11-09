import React, { useState, useEffect } from 'react';
import {
  Users, 
  ShoppingBag, 
  Plane, 
  Package, 
  UtensilsCrossed, 
  BarChart3, 
  Settings,
  ChevronDown,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

// Import services
import adminService from '../services/adminService';
import userService from '../services/userService';
import orderService from '../services/orderService';
import productService from '../services/productService';
import restaurantService from '../services/restaurantService';

// Mock Data
const monthlyData = [
  { month: 'Jan', revenue: 45000, expenses: 28000 },
  { month: 'Feb', revenue: 52000, expenses: 32000 },
  { month: 'Mar', revenue: 48000, expenses: 30000 },
  { month: 'Apr', revenue: 61000, expenses: 35000 },
  { month: 'May', revenue: 55000, expenses: 33000 },
  { month: 'Jun', revenue: 67000, expenses: 38000 },
  { month: 'Jul', revenue: 72000, expenses: 42000 },
  { month: 'Aug', revenue: 68000, expenses: 40000 },
  { month: 'Sep', revenue: 74000, expenses: 43000 },
  { month: 'Oct', revenue: 79000, expenses: 45000 },
  { month: 'Nov', revenue: 85000, expenses: 48000 },
  { month: 'Dec', revenue: 91000, expenses: 52000 },
];

const users = [
  { id: 1, username: 'john_doe', password: '********', state: 'Active' },
  { id: 2, username: 'jane_smith', password: '********', state: 'Active' },
  { id: 3, username: 'mike_wilson', password: '********', state: 'Inactive' },
  { id: 4, username: 'sarah_jones', password: '********', state: 'Active' },
  { id: 5, username: 'david_brown', password: '********', state: 'Active' },
  { id: 6, username: 'emily_davis', password: '********', state: 'Inactive' },
  { id: 7, username: 'chris_miller', password: '********', state: 'Active' },
  { id: 8, username: 'amanda_taylor', password: '********', state: 'Active' },
];

const orders = [
  { 
    id: 'ORD-001', 
    customer: 'John Smith', 
    time: '10:30 AM', 
    date: '2025-11-03', 
    amount: '$45.50', 
    status: 'Completed',
    restaurant: 'Burger Palace'
  },
  { 
    id: 'ORD-002', 
    customer: 'Emma Wilson', 
    time: '11:15 AM', 
    date: '2025-11-03', 
    amount: '$32.00', 
    status: 'Pending',
    restaurant: 'Pizza Corner'
  },
  { 
    id: 'ORD-003', 
    customer: 'Michael Brown', 
    time: '09:45 AM', 
    date: '2025-11-03', 
    amount: '$58.75', 
    status: 'In Progress',
    restaurant: 'Sushi Bar'
  },
  { 
    id: 'ORD-004', 
    customer: 'Sarah Davis', 
    time: '12:00 PM', 
    date: '2025-11-03', 
    amount: '$28.50', 
    status: 'Completed',
    restaurant: 'Taco Haven'
  },
  { 
    id: 'ORD-005', 
    customer: 'James Johnson', 
    time: '01:20 PM', 
    date: '2025-11-03', 
    amount: '$42.00', 
    status: 'Cancelled',
    restaurant: 'Noodle House'
  },
];

const products = [
  { 
    name: 'Classic Burger', 
    price: '$8.99', 
    catalog: 'Burgers', 
    restaurant: 'Burger Palace'
  },
  { 
    name: 'Pepperoni Pizza', 
    price: '$12.50', 
    catalog: 'Pizza', 
    restaurant: 'Pizza Corner'
  },
  { 
    name: 'California Roll', 
    price: '$15.00', 
    catalog: 'Sushi', 
    restaurant: 'Sushi Bar'
  },
  { 
    name: 'Chicken Tacos', 
    price: '$9.99', 
    catalog: 'Mexican', 
    restaurant: 'Taco Haven'
  },
  { 
    name: 'Pad Thai', 
    price: '$11.50', 
    catalog: 'Asian', 
    restaurant: 'Noodle House'
  },
];

const restaurants = [
  { 
    id: 'RES-001', 
    name: 'Burger Palace', 
    address: '123 Main St, New York, NY', 
    contact: '+1 234-567-8901',
    state: 'Active'
  },
  { 
    id: 'RES-002', 
    name: 'Pizza Corner', 
    address: '456 Oak Ave, Los Angeles, CA', 
    contact: '+1 234-567-8902',
    state: 'Active'
  },
  { 
    id: 'RES-003', 
    name: 'Sushi Bar', 
    address: '789 Pine Rd, Chicago, IL', 
    contact: '+1 234-567-8903',
    state: 'Inactive'
  },
  { 
    id: 'RES-004', 
    name: 'Taco Haven', 
    address: '321 Elm St, Houston, TX', 
    contact: '+1 234-567-8904',
    state: 'Active'
  },
];

// Sidebar Component
function Sidebar({ activeScreen, onNavigate }) {
  const [restaurantOpen, setRestaurantOpen] = useState(
    activeScreen === 'restaurant-list' || activeScreen === 'restaurant-register'
  );

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'user', label: 'User', icon: Users },
    { id: 'order', label: 'Order', icon: ShoppingBag },
    { id: 'drone', label: 'Drone', icon: Plane },
    { id: 'product', label: 'Product', icon: Package },
    { 
      id: 'restaurant', 
      label: 'Restaurant', 
      icon: UtensilsCrossed,
      subItems: [
        { id: 'restaurant-list', label: 'List Restaurant' },
        { id: 'restaurant-register', label: 'Register Restaurant' }
      ]
    },
    { id: 'setting', label: 'Setting', icon: Settings },
  ];

  const handleMenuClick = (id) => {
    if (id === 'restaurant') {
      setRestaurantOpen(!restaurantOpen);
    } else {
      onNavigate(id);
    }
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">Fast Delivery Admin</h1>
      </div>
      
      <nav className="flex-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id || 
                          (item.subItems && item.subItems.some(sub => sub.id === activeScreen));
          
          return (
            <div key={item.id}>
              <button
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive && !item.subItems
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.subItems && (
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${
                      restaurantOpen ? 'rotate-180' : ''
                    }`} 
                  />
                )}
              </button>
              
              {item.subItems && restaurantOpen && (
                <div className="ml-4 mb-1">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => onNavigate(subItem.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg mb-1 transition-colors text-sm ${
                        activeScreen === subItem.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

// Dashboard Screen
function ReportScreen() {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard statistics
      const stats = await adminService.getDashboardStats();
      setDashboardStats(stats);

      // Fetch monthly revenue data
      const revenueData = await adminService.getMonthlyRevenue(new Date().getFullYear());
      setMonthlyData(revenueData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');

      // Fallback to mock data if API fails
      setDashboardStats({
        totalOrders: 12345,
        ordersToday: 234,
        totalRevenue: 789456,
        totalUsers: 8492
      });

      setMonthlyData([
        { month: 'Jan', revenue: 45000, expenses: 28000 },
        { month: 'Feb', revenue: 52000, expenses: 32000 },
        { month: 'Mar', revenue: 48000, expenses: 30000 },
        { month: 'Apr', revenue: 61000, expenses: 35000 },
        { month: 'May', revenue: 55000, expenses: 33000 },
        { month: 'Jun', revenue: 67000, expenses: 38000 },
        { month: 'Jul', revenue: 72000, expenses: 42000 },
        { month: 'Aug', revenue: 68000, expenses: 40000 },
        { month: 'Sep', revenue: 74000, expenses: 43000 },
        { month: 'Oct', revenue: 79000, expenses: 45000 },
        { month: 'Nov', revenue: 85000, expenses: 48000 },
        { month: 'Dec', revenue: 91000, expenses: 52000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const kpiData = dashboardStats ? [
    {
      title: 'Total Orders',
      value: dashboardStats.totalOrders?.toLocaleString() || '0',
      icon: ShoppingBag,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Order today',
      value: dashboardStats.ordersToday?.toLocaleString() || '0',
      icon: TrendingUp,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Revenue',
      value: `$${dashboardStats.totalRevenue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Total User',
      value: dashboardStats.totalUsers?.toLocaleString() || '0',
      icon: Users,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ] : [];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{kpi.title}</p>
                    <h2 className="text-2xl font-bold text-gray-900">{kpi.value}</h2>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${kpi.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${kpi.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="#9CA3AF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// User Screen
function UserScreen() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await adminService.toggleUserStatus(userId, newStatus);
      toast.success('User status updated successfully');
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search users..." 
              className="pl-9 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add user
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Edit</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.status === 'Active'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                        }
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        style={{ cursor: 'pointer' }}
                      >
                        {user.status || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// Order Screen
function OrderScreen() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const orderDetails = await adminService.getOrderDetails(orderId);
      // You can show a modal or navigate to details page
      console.log('Order details:', orderDetails);
      toast.success('Order details loaded');
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'Pending':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      case 'In Progress':
      case 'IN_PROGRESS':
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'Cancelled':
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New orders
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customerName || order.userId}</TableCell>
                    <TableCell>{formatTime(order.createdAt)}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="font-semibold">${order.totalAmount?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.restaurantName || 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// Product Screen
function ProductScreen() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProduct = async (productId) => {
    try {
      await adminService.approveProduct(productId);
      toast.success('Product approved successfully');
      fetchProducts(); // Refresh list
    } catch (error) {
      console.error('Error approving product:', error);
      toast.error('Failed to approve product');
    }
  };

  const handleRejectProduct = async (productId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await adminService.rejectProduct(productId, reason);
      toast.success('Product rejected');
      fetchProducts(); // Refresh list
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast.error('Failed to reject product');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Product</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search products..." 
              className="pl-9 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add product
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-semibold">${product.price?.toFixed(2)}</TableCell>
                    <TableCell>{product.category || product.catalog}</TableCell>
                    <TableCell>{product.restaurantName || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="link" size="sm" className="text-blue-600 p-0 h-auto">
                          <Eye className="w-4 h-4 mr-1" />
                          Detail
                        </Button>
                        <span className="text-gray-300">|</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-red-600 p-0 h-auto"
                          onClick={() => handleRejectProduct(product.id)}
                        >
                          Cancel
                        </Button>
                        <span className="text-gray-300">|</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-green-600 p-0 h-auto"
                          onClick={() => handleApproveProduct(product.id)}
                        >
                          Approve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// Restaurant List Screen
function RestaurantListScreen() {
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) {
      return;
    }

    try {
      await adminService.deleteRestaurant(restaurantId);
      toast.success('Restaurant deleted successfully');
      fetchRestaurants(); // Refresh list
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Failed to delete restaurant');
    }
  };

  const handleToggleStatus = async (restaurantId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await adminService.toggleRestaurantStatus(restaurantId, newStatus);
      toast.success('Restaurant status updated successfully');
      fetchRestaurants(); // Refresh list
    } catch (error) {
      console.error('Error updating restaurant status:', error);
      toast.error('Failed to update restaurant status');
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Restaurant</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search restaurants..." 
              className="pl-9 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Restaurant
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Res_id</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Main_address</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell className="font-medium">{restaurant.id}</TableCell>
                    <TableCell>{restaurant.name}</TableCell>
                    <TableCell>{restaurant.address}</TableCell>
                    <TableCell>{restaurant.contact || restaurant.phone}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          restaurant.status === 'Active' || restaurant.state === 'Active'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                        }
                        onClick={() => handleToggleStatus(restaurant.id, restaurant.status || restaurant.state)}
                        style={{ cursor: 'pointer' }}
                      >
                        {restaurant.status || restaurant.state || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="link" size="sm" className="text-blue-600 p-0 h-auto">
                          <Eye className="w-4 h-4 mr-1" />
                          Detail
                        </Button>
                        <span className="text-gray-300">|</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-red-600 p-0 h-auto"
                          onClick={() => handleDeleteRestaurant(restaurant.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No restaurants found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// Restaurant Register Screen
function RestaurantRegisterScreen() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Register Restaurant</h1>
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name
              </label>
              <Input placeholder="Enter restaurant name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <Input placeholder="Enter contact number" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <Input placeholder="Enter full address" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine Type
              </label>
              <Input placeholder="e.g., Italian, Chinese, etc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input type="email" placeholder="restaurant@example.com" />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Register Restaurant
            </Button>
            <Button variant="outline">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Admin Page Component
export default function AdminPage() {
  const [activeScreen, setActiveScreen] = useState('dashboard');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <ReportScreen />;
      case 'user':
        return <UserScreen />;
      case 'order':
        return <OrderScreen />;
      case 'product':
        return <ProductScreen />;
      case 'restaurant-list':
        return <RestaurantListScreen />;
      case 'restaurant-register':
        return <RestaurantRegisterScreen />;
      case 'drone':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900">Drone Management</h1>
            <p className="text-gray-500 mt-4">Drone management screen coming soon...</p>
          </div>
        );
      case 'setting':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-4">Settings screen coming soon...</p>
          </div>
        );
      default:
        return <ReportScreen />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeScreen={activeScreen} onNavigate={setActiveScreen} />
      <main className="flex-1 overflow-auto">
        {renderScreen()}
      </main>
    </div>
  );
}
