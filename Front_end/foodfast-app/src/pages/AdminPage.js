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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

// Import services
import adminService from '../services/adminService';
import restaurantService from '../services/restaurantService';
import categoryService from '../services/categoryService';
import deliveryService from '../services/deliveryService';


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
  const [editUserId, setEditUserId] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('USER');
  const [editStatus, setEditStatus] = useState('Active');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Add user form states
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('USER');
  const [newStatus, setNewStatus] = useState('Active');

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

  const handleEditUser = (user) => {
    setEditUserId(user.id);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditPhone(user.phone || '');
    setEditRole(user.role || 'USER');
    setEditStatus(user.status);
    setDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editUsername || !editEmail) {
      toast.error('Username and email are required');
      return;
    }

    try {
      await adminService.updateUser(editUserId, {
        username: editUsername,
        email: editEmail,
        phone: editPhone,
        role: editRole,
        status: editStatus,
      });
      toast.success('User updated successfully');
      setDialogOpen(false);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleAddUser = () => {
    // Reset form
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    setNewPhone('');
    setNewRole('USER');
    setNewStatus('Active');
    setAddDialogOpen(true);
  };

  const handleCreateUser = async () => {
    if (!newUsername || !newEmail || !newPassword) {
      toast.error('Username, email and password are required');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await adminService.createUser({
        username: newUsername,
        email: newEmail,
        password: newPassword,
        phone: newPhone,
        role: newRole,
        status: newStatus,
      });
      toast.success('User created successfully');
      setAddDialogOpen(false);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
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
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddUser}>
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
                <TableHead>Role</TableHead>
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
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-100'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                        }
                      >
                        {user.role || 'USER'}
                      </Badge>
                    </TableCell>
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
                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
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
                )))
              : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    
      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <Input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="RESTAURANT">RESTAURANT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateUser}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create User
            </Button>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <Input
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="RESTAURANT">RESTAURANT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleUpdateUser}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update User
            </Button>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Order Screen
function OrderScreen() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  // Edit Order Status Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editOrder, setEditOrder] = useState({
    id: null,
    status: ''
  });

  // Order Detail Dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loadingDelivery, setLoadingDelivery] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Fetch all data in parallel
      const [ordersData, usersData, restaurantsData] = await Promise.all([
        adminService.getAllOrders(),
        adminService.getAllUsers().catch(() => []),
        restaurantService.getAllRestaurants().catch(() => [])
      ]);



      setOrders(ordersData);
      setUsers(usersData);
      setRestaurants(restaurantsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStatus = (order) => {
    setEditOrder({
      id: order.id,
      status: order.status || 'PENDING'
    });
    setEditDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!editOrder.status) {
      toast.error('Please select a status');
      return;
    }

    try {
      await adminService.updateOrderStatus(editOrder.id, editOrder.status);
      toast.success('Order status updated successfully');
      setEditDialogOpen(false);
      fetchAllData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const handleViewOrder = async (order) => {
    try {
      const orderDetails = await adminService.getOrderDetails(order.id);
      setSelectedOrder(orderDetails);
      setDetailDialogOpen(true);
      
      // Fetch delivery info if order is PREPARING, DELIVERING, or DELIVERED
      if (['PREPARING', 'DELIVERING', 'DELIVERED'].includes(orderDetails.status || order.status)) {
        setLoadingDelivery(true);
        try {
          const delivery = await deliveryService.getDeliveryByOrderId(order.id);
          setDeliveryInfo(delivery);
        } catch (error) {
          console.error('Error fetching delivery info:', error);
          setDeliveryInfo(null);
        } finally {
          setLoadingDelivery(false);
        }
      } else {
        setDeliveryInfo(null);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      // Fallback to showing the order data we already have
      setSelectedOrder(order);
      setDetailDialogOpen(true);
      setDeliveryInfo(null);
    }
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedOrder(null);
    setDeliveryInfo(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'DELIVERED':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'PENDING':
      case 'CREATED':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      case 'CONFIRMED':
        return 'bg-cyan-100 text-cyan-700 hover:bg-cyan-100';
      case 'IN PROGRESS':
      case 'IN_PROGRESS':
      case 'PROCESSING':
      case 'PREPARING':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'DELIVERING':
      case 'SHIPPING':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-100';
      case 'CANCELLED':
      case 'CANCELED':
        return 'bg-red-100 text-red-700 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  const getRestaurantName = (order) => {
    if (order.restaurantName) return order.restaurantName;
    if (order.restaurant?.name) return order.restaurant.name;
    if (order.restaurantId) {
      const restaurant = restaurants.find(r => r.id === order.restaurantId);
      return restaurant?.name || `Restaurant #${order.restaurantId}`;
    }
    return 'N/A';
  };

  const getTotalAmount = (order) => {
    // Try different field names - ADD totalPrice first (from backend)
    if (order.totalPrice != null && order.totalPrice !== undefined) {
      return Number(order.totalPrice);
    }
    if (order.totalAmount != null && order.totalAmount !== undefined) {
      return Number(order.totalAmount);
    }
    if (order.total != null && order.total !== undefined) {
      return Number(order.total);
    }
    if (order.amount != null && order.amount !== undefined) {
      return Number(order.amount);
    }

    // Calculate from items if available
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      return order.items.reduce((sum, item) => {
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 0);
        return sum + (price * quantity);
      }, 0);
    }

    // Calculate from orderItems if available
    if (order.orderItems && Array.isArray(order.orderItems) && order.orderItems.length > 0) {
      return order.orderItems.reduce((sum, item) => {
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 0);
        return sum + (price * quantity);
      }, 0);
    }

    return 0;
  };

  const getCustomerName = (order) => {
    if (order.customerName) return order.customerName;
    if (order.userName) return order.userName;
    if (order.user?.username) return order.user.username;
    if (order.user?.name) return order.user.name;

    if (order.userId) {
      const user = users.find(u => u.id === order.userId);
      if (user) return user.username || user.name || user.email || `User #${order.userId}`;
      return `User #${order.userId}`;
    }

    return 'Guest';
  };

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const orderId = order.id?.toString() || '';
    const customerName = getCustomerName(order).toLowerCase();
    const restaurantName = getRestaurantName(order).toLowerCase();
    const status = (order.status || '').toLowerCase();

    return orderId.includes(searchLower) ||
           customerName.includes(searchLower) ||
           restaurantName.includes(searchLower) ||
           status.includes(searchLower);
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              className="pl-9 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const totalAmount = getTotalAmount(order);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{getCustomerName(order)}</TableCell>
                      <TableCell>{formatTime(order.createdAt || order.orderDate || order.orderTime)}</TableCell>
                      <TableCell>{formatDate(order.createdAt || order.orderDate)}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ${totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status || 'PENDING'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getRestaurantName(order)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="link"
                            size="sm"
                            className="text-blue-600 p-0 h-auto"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </Button>
                          <span className="text-gray-300">|</span>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-green-600 p-0 h-auto"
                            onClick={() => handleEditStatus(order)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Status
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    {orders.length === 0 ? 'No orders found' : 'No matching orders'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Order Status Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID
              </label>
              <Input value={`#${editOrder.id}`} disabled className="bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editOrder.status}
                onChange={(e) => setEditOrder({...editOrder, status: e.target.value})}
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PREPARING">Preparing</option>
                <option value="READY">Ready for Pickup</option>
                <option value="DELIVERING">Delivering</option>
                <option value="DELIVERED">Delivered</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Status Guide:</strong>
              </p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1">
                <li>• <strong>Pending:</strong> Order received, awaiting confirmation</li>
                <li>• <strong>Confirmed:</strong> Order confirmed by restaurant</li>
                <li>• <strong>Preparing:</strong> Restaurant is preparing the order</li>
                <li>• <strong>Delivering:</strong> Order is on the way</li>
                <li>• <strong>Completed:</strong> Order successfully delivered</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={(open) => !open && handleCloseDetailDialog()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Information */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Order ID</label>
                  <p className="text-base font-semibold">#{selectedOrder.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status || 'PENDING'}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Order Date</label>
                  <p className="text-base">{formatDate(selectedOrder.createdAt || selectedOrder.orderDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Order Time</label>
                  <p className="text-base">{formatTime(selectedOrder.createdAt || selectedOrder.orderDate)}</p>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                    <p className="text-base">{getCustomerName(selectedOrder)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-base">{selectedOrder.phone || selectedOrder.user?.phone || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Delivery Address</label>
                    <p className="text-base">{selectedOrder.deliveryAddress || selectedOrder.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Restaurant Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Restaurant</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-base font-medium">{getRestaurantName(selectedOrder)}</p>
                  {selectedOrder.restaurant?.address && (
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.restaurant.address}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              {((selectedOrder.items && selectedOrder.items.length > 0) ||
                (selectedOrder.orderItems && selectedOrder.orderItems.length > 0)) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Item</th>
                          <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Qty</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Price</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {(selectedOrder.items || selectedOrder.orderItems || []).map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm">{item.productName || item.name || 'Product'}</td>
                            <td className="px-4 py-3 text-sm text-center">{item.quantity || 0}</td>
                            <td className="px-4 py-3 text-sm text-right">${Number(item.price || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium">
                              ${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>${getTotalAmount(selectedOrder).toFixed(2)}</span>
                  </div>
                  {selectedOrder.deliveryFee !== undefined && selectedOrder.deliveryFee !== null && (
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Delivery Fee:</span>
                      <span>${Number(selectedOrder.deliveryFee || 0).toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.tax !== undefined && selectedOrder.tax !== null && (
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Tax:</span>
                      <span>${Number(selectedOrder.tax || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total Amount:</span>
                    <span className="text-green-600">${getTotalAmount(selectedOrder).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              {selectedOrder.paymentMethod && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Payment Method</label>
                  <p className="text-base">{selectedOrder.paymentMethod}</p>
                </div>
              )}

              {/* Delivery Information */}
              {['PREPARING', 'DELIVERING', 'DELIVERED'].includes(selectedOrder.status) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-blue-600" />
                    Delivery Information
                  </h3>
                  {loadingDelivery ? (
                    <div className="text-center py-4 bg-blue-50 rounded-lg">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                      <p className="text-gray-600 text-sm mt-2">Loading delivery info...</p>
                    </div>
                  ) : deliveryInfo ? (
                    <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Drone ID</label>
                          <p className="text-base font-semibold text-blue-900">{deliveryInfo.droneId}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Delivery Status</label>
                          <Badge className={deliveryService.getDeliveryStatusColor(deliveryInfo.status)}>
                            {deliveryService.formatDeliveryStatus(deliveryInfo.status)}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {deliveryInfo.assignedAt && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Assigned At</label>
                            <p className="text-sm text-gray-900">
                              {new Date(deliveryInfo.assignedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {deliveryInfo.pickedUpAt && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Picked Up At</label>
                            <p className="text-sm text-gray-900">
                              {new Date(deliveryInfo.pickedUpAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {deliveryInfo.deliveringAt && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Started Delivery At</label>
                            <p className="text-sm text-gray-900">
                              {new Date(deliveryInfo.deliveringAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {deliveryInfo.completedAt && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Delivered At</label>
                            <p className="text-sm text-gray-900">
                              {new Date(deliveryInfo.completedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      {deliveryInfo.currentLat && deliveryInfo.currentLng && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Current Location</label>
                          <p className="text-sm text-gray-900">
                            Lat: {deliveryInfo.currentLat.toFixed(6)}, Lng: {deliveryInfo.currentLng.toFixed(6)}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Delivery information will be available once a drone is assigned.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
                  <p className="text-base text-gray-700">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleCloseDetailDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Product Screen
function ProductScreen() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');

  // Add Product Dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: 0,
    categoryId: '',
    restaurantId: '',
    isActive: true
  });

  // Edit Product Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    stock: 0,
    categoryId: '',
    restaurantId: '',
    isActive: true
  });

  // Product Detail Dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchRestaurants();
    fetchCategories();
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

  const fetchRestaurants = async () => {
    try {
      const data = await restaurantService.getAllRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleAddProduct = () => {
    setNewProduct({
      name: '',
      description: '',
      price: '',
      stock: 0,
      categoryId: '',
      restaurantId: '',
      isActive: true
    });
    setAddDialogOpen(true);
  };

  const handleCreateProduct = async () => {
    // Validation
    if (!newProduct.name || !newProduct.price || !newProduct.categoryId || !newProduct.restaurantId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isNaN(parseFloat(newProduct.price)) || parseFloat(newProduct.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock) || 0,
        categoryId: parseInt(newProduct.categoryId),
        restaurantId: parseInt(newProduct.restaurantId),
        isActive: newProduct.isActive
      };

      await adminService.createProduct(productData);
      toast.success('Product created successfully');
      setAddDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Failed to create product');
    }
  };

  const handleEditProduct = (product) => {
    setEditProduct({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock?.toString() || '0',
      categoryId: product.categoryId.toString(),
      restaurantId: product.restaurantId.toString(),
      isActive: product.isActive
    });
    setEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    // Validation
    if (!editProduct.name || !editProduct.price || !editProduct.categoryId || !editProduct.restaurantId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isNaN(parseFloat(editProduct.price)) || parseFloat(editProduct.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      const productData = {
        name: editProduct.name,
        description: editProduct.description,
        price: parseFloat(editProduct.price),
        stock: parseInt(editProduct.stock) || 0,
        categoryId: parseInt(editProduct.categoryId),
        restaurantId: parseInt(editProduct.restaurantId),
        isActive: editProduct.isActive
      };

      await adminService.updateProduct(editProduct.id, productData);
      toast.success('Product updated successfully');
      setEditDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Failed to update product');
    }
  };

  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setDetailDialogOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await adminService.deleteProduct(productId);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRestaurant = !selectedRestaurant || product.restaurantId?.toString() === selectedRestaurant;
    return matchesSearch && matchesRestaurant;
  });

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'N/A';
  };

  const getRestaurantName = (restaurantId) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    return restaurant ? restaurant.name : 'N/A';
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        <div className="flex items-center gap-3">
          {/* Restaurant Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
          >
            <option value="">All Restaurants</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search products..." 
              className="pl-9 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddProduct}>
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
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img
                        src={product.imageUrl || 'https://via.placeholder.com/50'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-semibold">${product.price?.toFixed(2)}</TableCell>
                    <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                    <TableCell>{getRestaurantName(product.restaurantId)}</TableCell>
                    <TableCell>
                      <Badge className={product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {product.isActive ? 'Available' : 'Unavailable'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-blue-600 p-0 h-auto"
                          onClick={() => handleViewDetail(product)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detail
                        </Button>
                        <span className="text-gray-300">|</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-green-600 p-0 h-auto"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <span className="text-gray-300">|</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-red-600 p-0 h-auto"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Product Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProduct.isActive}
                  onChange={(e) => setNewProduct({...newProduct, isActive: e.target.value === 'true'})}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newProduct.categoryId}
                onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newProduct.restaurantId}
                onChange={(e) => setNewProduct({...newProduct, restaurantId: e.target.value})}
              >
                <option value="">Select restaurant</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateProduct}>
              Create Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={editProduct.name}
                onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={editProduct.description}
                onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({...editProduct, price: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editProduct.isActive}
                  onChange={(e) => setEditProduct({...editProduct, isActive: e.target.value === 'true'})}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editProduct.categoryId}
                onChange={(e) => setEditProduct({...editProduct, categoryId: e.target.value})}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editProduct.restaurantId}
                onChange={(e) => setEditProduct({...editProduct, restaurantId: e.target.value})}
              >
                <option value="">Select restaurant</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleUpdateProduct}>
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={selectedProduct.imageUrl || 'https://via.placeholder.com/300'}
                  alt={selectedProduct.name}
                  className="w-64 h-64 object-cover rounded-lg"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300'; }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Product Name</label>
                  <p className="text-base font-semibold">{selectedProduct.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Price</label>
                  <p className="text-base font-semibold text-green-600">${selectedProduct.price?.toFixed(2)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                  <p className="text-base">{getCategoryName(selectedProduct.categoryId)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Restaurant</label>
                  <p className="text-base">{getRestaurantName(selectedProduct.restaurantId)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <Badge className={selectedProduct.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {selectedProduct.isActive ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Product ID</label>
                  <p className="text-base">{selectedProduct.id}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                <p className="text-base">{selectedProduct.description || 'No description available'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Restaurant List Screen
function RestaurantListScreen({ autoOpenRegister = false }) {
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Restaurant Dialog (Register with User Account)
  const [addDialogOpen, setAddDialogOpen] = useState(autoOpenRegister);
  const [newRestaurant, setNewRestaurant] = useState({
    // User information
    username: '',
    email: '',
    password: '',
    phone: '',
    role: 'RESTAURANT',
    status: 'Active',
    // Restaurant information
    restaurantName: '',
    address: '',
    contact: '',
    description: '',
    cuisineType: ''
  });

  // Edit Restaurant Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editRestaurant, setEditRestaurant] = useState({
    id: null,
    name: '',
    address: '',
    contact: '',
    description: '',
    cuisineType: ''
  });

  // Restaurant Detail Dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

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

  const handleEditRestaurant = (restaurant) => {
    setEditRestaurant({
      id: restaurant.id,
      name: restaurant.name,
      address: restaurant.address || '',
      contact: restaurant.contact || restaurant.phone || '',
      description: restaurant.description || '',
      cuisineType: restaurant.cuisineType || ''
    });
    setEditDialogOpen(true);
  };

  const handleUpdateRestaurant = async () => {
    // Validation
    if (!editRestaurant.name || !editRestaurant.address) {
      toast.error('Name and address are required');
      return;
    }

    try {
      const restaurantData = {
        name: editRestaurant.name,
        address: editRestaurant.address,
        contact: editRestaurant.contact,
        phone: editRestaurant.contact,
        description: editRestaurant.description,
        cuisineType: editRestaurant.cuisineType
      };

      await adminService.updateRestaurant(editRestaurant.id, restaurantData);
      toast.success('Restaurant updated successfully');
      setEditDialogOpen(false);
      fetchRestaurants();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast.error(error.message || 'Failed to update restaurant');
    }
  };

  const handleViewDetail = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setDetailDialogOpen(true);
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

  const handleAddRestaurant = () => {
    setNewRestaurant({
      username: '',
      email: '',
      password: '',
      phone: '',
      role: 'RESTAURANT',
      status: 'Active',
      restaurantName: '',
      address: '',
      contact: '',
      description: '',
      cuisineType: ''
    });
    setAddDialogOpen(true);
  };

  const handleRegisterRestaurant = async () => {
    // Validate required fields
    if (!newRestaurant.username || !newRestaurant.email || !newRestaurant.password) {
      toast.error('Please fill in all user account fields (username, email, password)');
      return;
    }

    if (!newRestaurant.restaurantName || !newRestaurant.address) {
      toast.error('Please fill in required restaurant fields (name, address)');
      return;
    }

    if (newRestaurant.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      // Step 1: Create user account with RESTAURANT role
      const userResponse = await adminService.createUser({
        username: newRestaurant.username,
        email: newRestaurant.email,
        password: newRestaurant.password,
        phone: newRestaurant.phone,
        role: 'RESTAURANT',
        status: newRestaurant.status
      });

      console.log('User created:', userResponse);

      // Step 2: Create restaurant with userId mapping
      const restaurantResponse = await adminService.createRestaurant({
        name: newRestaurant.restaurantName,
        address: newRestaurant.address,
        contact: newRestaurant.contact || newRestaurant.phone,
        description: newRestaurant.description,
        cuisineType: newRestaurant.cuisineType,
        userId: userResponse.id || userResponse.userId, // Map to user account
        status: 'Active'
      });

      console.log('Restaurant created:', restaurantResponse);

      toast.success('Restaurant and user account registered successfully!');
      setAddDialogOpen(false);
      fetchRestaurants();
    } catch (error) {
      console.error('Error registering restaurant:', error);
      toast.error(error.message || 'Failed to register restaurant. Please try again.');
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
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddRestaurant}>
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
                        <Button
                          variant="link"
                          size="sm"
                          className="text-blue-600 p-0 h-auto"
                          onClick={() => handleViewDetail(restaurant)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detail
                        </Button>
                        <span className="text-gray-300">|</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-green-600 p-0 h-auto"
                          onClick={() => handleEditRestaurant(restaurant)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
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

      {/* Add Restaurant Dialog - Register with User Account */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Restaurant</DialogTitle>
            <p className="text-sm text-gray-500 mt-2">
              Create a user account and restaurant profile. The restaurant will be linked to this user account.
            </p>
          </DialogHeader>
          <div className="space-y-6">
            {/* User Account Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newRestaurant.username}
                    onChange={(e) => setNewRestaurant({...newRestaurant, username: e.target.value})}
                    placeholder="Enter username for restaurant owner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={newRestaurant.email}
                    onChange={(e) => setNewRestaurant({...newRestaurant, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    value={newRestaurant.password}
                    onChange={(e) => setNewRestaurant({...newRestaurant, password: e.target.value})}
                    placeholder="Enter password (min 6 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={newRestaurant.phone}
                    onChange={(e) => setNewRestaurant({...newRestaurant, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newRestaurant.status}
                    onChange={(e) => setNewRestaurant({...newRestaurant, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <Input
                    value="RESTAURANT"
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Restaurant Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newRestaurant.restaurantName}
                    onChange={(e) => setNewRestaurant({...newRestaurant, restaurantName: e.target.value})}
                    placeholder="Enter restaurant name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newRestaurant.address}
                    onChange={(e) => setNewRestaurant({...newRestaurant, address: e.target.value})}
                    placeholder="Enter full restaurant address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <Input
                      value={newRestaurant.contact}
                      onChange={(e) => setNewRestaurant({...newRestaurant, contact: e.target.value})}
                      placeholder="Restaurant contact (optional)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to use user phone number</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cuisine Type
                    </label>
                    <Input
                      value={newRestaurant.cuisineType}
                      onChange={(e) => setNewRestaurant({...newRestaurant, cuisineType: e.target.value})}
                      placeholder="e.g., Italian, Vietnamese, Chinese"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    value={newRestaurant.description}
                    onChange={(e) => setNewRestaurant({...newRestaurant, description: e.target.value})}
                    placeholder="Enter restaurant description"
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This will create both a user account with RESTAURANT role and a restaurant profile. 
                The restaurant will be linked to the user account via userId for authentication and management.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleRegisterRestaurant}>
              Register Restaurant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Restaurant Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Restaurant</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={editRestaurant.name}
                onChange={(e) => setEditRestaurant({...editRestaurant, name: e.target.value})}
                placeholder="Enter restaurant name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <Input
                value={editRestaurant.address}
                onChange={(e) => setEditRestaurant({...editRestaurant, address: e.target.value})}
                placeholder="Enter full address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <Input
                value={editRestaurant.contact}
                onChange={(e) => setEditRestaurant({...editRestaurant, contact: e.target.value})}
                placeholder="Enter contact number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine Type
              </label>
              <Input
                value={editRestaurant.cuisineType}
                onChange={(e) => setEditRestaurant({...editRestaurant, cuisineType: e.target.value})}
                placeholder="e.g., Italian, Chinese, Vietnamese"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={editRestaurant.description}
                onChange={(e) => setEditRestaurant({...editRestaurant, description: e.target.value})}
                placeholder="Enter restaurant description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleUpdateRestaurant}>
              Update Restaurant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restaurant Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Restaurant Details</DialogTitle>
          </DialogHeader>
          {selectedRestaurant && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Restaurant ID</label>
                  <p className="text-base font-semibold">{selectedRestaurant.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <Badge className={
                    selectedRestaurant.status === 'Active' || selectedRestaurant.state === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }>
                    {selectedRestaurant.status || selectedRestaurant.state || 'Active'}
                  </Badge>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Restaurant Name</label>
                  <p className="text-base font-semibold">{selectedRestaurant.name}</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                  <p className="text-base">{selectedRestaurant.address}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Contact</label>
                  <p className="text-base">{selectedRestaurant.contact || selectedRestaurant.phone || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Cuisine Type</label>
                  <p className="text-base">{selectedRestaurant.cuisineType || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                <p className="text-base">{selectedRestaurant.description || 'No description available'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
        return <RestaurantListScreen autoOpenRegister={true} />;
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
