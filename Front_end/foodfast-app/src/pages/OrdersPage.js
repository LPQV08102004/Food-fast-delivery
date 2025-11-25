import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChefHat,
  ShoppingBag,
  ArrowLeft,
  User,
  LogOut,
  Settings,
  UtensilsCrossed,
  MapPin,
  Phone,
  Calendar,
  X,
  Plane
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { toast, Toaster } from 'sonner';
import authService from '../services/authService';
import orderService from '../services/orderService';
import deliveryService from '../services/deliveryService';


const getStatusColor = (status) => {
  const colors = {
    NEW: 'bg-blue-100 text-blue-800',
    CONFIRMED: 'bg-yellow-100 text-yellow-800',
    PREPARING: 'bg-purple-100 text-purple-800',
    DELIVERING: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getStatusIcon = (status) => {
  const icons = {
    NEW: <ShoppingBag className="w-4 h-4" />,
    CONFIRMED: <CheckCircle className="w-4 h-4" />,
    PREPARING: <ChefHat className="w-4 h-4" />,
    DELIVERING: <Truck className="w-4 h-4" />,
    DELIVERED: <Package className="w-4 h-4" />,
    CANCELLED: <XCircle className="w-4 h-4" />,
  };
  return icons[status] || <Clock className="w-4 h-4" />;
};

const statusText = {
  NEW: 'New Order',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  DELIVERING: 'On the Way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

function OrderCard({ order, onViewDetails }) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewDetails(order)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-500">Order #{order.id}</p>
            <p className="text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
            {getStatusIcon(order.status)}
            {statusText[order.status]}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          {order.orderItems?.slice(0, 2).map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.quantity}x {item.productName || `Product #${item.productId}`}
              </span>
              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          {order.orderItems?.length > 2 && (
            <p className="text-xs text-gray-500">
              +{order.orderItems.length - 2} more items
            </p>
          )}
        </div>

        <Separator className="my-3" />

        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-orange-600">
            ${order.totalPrice?.toFixed(2) || '0.00'}
          </span>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loadingDelivery, setLoadingDelivery] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get only current user's orders
      const data = await orderService.getMyOrders();

      // Sort by newest first
      const sortedOrders = data.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sortedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);

      // Xử lý lỗi cụ thể hơn
      let errorMessage = 'Failed to load orders. Please try again.';

      if (err.response) {
        // Server trả về response với error
        if (err.response.status === 400) {
          errorMessage = 'Invalid request. Please try logging in again.';
        } else if (err.response.status === 401) {
          errorMessage = 'Your session has expired. Please login again.';
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response.status === 404) {
          errorMessage = 'Orders service is not available.';
        } else if (err.response.status >= 500) {
          errorMessage = 'Server error. Our team has been notified.';
        }
      } else if (err.request) {
        // Request được gửi nhưng không nhận được response
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toast.error('Please login to view orders');
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchOrders();
  }, [navigate, fetchOrders]);

  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    
    // Fetch delivery info if order is PREPARING, DELIVERING, or DELIVERED
    if (['PREPARING', 'DELIVERING', 'DELIVERED'].includes(order.status)) {
      setLoadingDelivery(true);
      try {
        const delivery = await deliveryService.getDeliveryByOrderId(order.id);
        setDeliveryInfo(delivery);
      } catch (error) {
        console.error('Error fetching delivery info:', error);
        // Không hiển thị error nếu chưa có delivery info
        setDeliveryInfo(null);
      } finally {
        setLoadingDelivery(false);
      }
    } else {
      setDeliveryInfo(null);
    }
  };

  const handleCloseDialog = () => {
    setSelectedOrder(null);
    setDeliveryInfo(null);
  };

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.fullName) {
      const names = user.fullName.split(' ');
      return names.length >= 2
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return user.username ? user.username[0].toUpperCase() : 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-orange-600 p-1.5 rounded-lg">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-orange-600">FoodFast</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/products" className="text-gray-700 hover:text-orange-600 transition-colors">
                Menu
              </Link>
              <Link to="/orders" className="text-orange-600 font-medium">
                My Orders
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.fullName || user.username} />
                        <AvatarFallback className="bg-orange-600 text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.fullName || user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">Track and manage your food orders</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/products')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-600"></div>
            <p className="text-gray-600 text-lg mt-4">Loading your orders...</p>
          </div>
        ) : error ? (
          <Card className="p-12 text-center">
            <XCircle className="w-20 h-20 mx-auto text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
            <Button
              onClick={fetchOrders}
              className="mt-4 bg-orange-600 hover:bg-orange-700"
            >
              Try Again
            </Button>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingBag className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start ordering delicious food!</p>
            <Button
              onClick={() => navigate('/products')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Browse Menu
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Order Details Dialog */}
        {selectedOrder && (
          <Dialog open={Boolean(selectedOrder)} onOpenChange={handleCloseDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 mx-auto rounded-lg shadow-lg bg-white">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg font-bold text-gray-900">
                    Order Details
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    onClick={handleCloseDialog}
                    className="rounded-full p-2 hover:bg-gray-100"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </Button>
                </div>
              </DialogHeader>
              <DialogDescription className="mt-4 text-sm text-gray-700">
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-semibold text-gray-500">
                      Order ID
                    </span>
                    <span className="block text-sm font-medium text-gray-900">
                      {selectedOrder.id}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500">
                      Order Date
                    </span>
                    <span className="block text-sm font-medium text-gray-900">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500">
                      Status
                    </span>
                    <Badge className={`${getStatusColor(selectedOrder.status)} inline-flex items-center gap-1`}>
                      {getStatusIcon(selectedOrder.status)}
                      {statusText[selectedOrder.status]}
                    </Badge>
                  </div>

                  {/* Thêm thông tin Payment */}
                  {selectedOrder.paymentMethod && (
                    <div>
                      <span className="block text-xs font-semibold text-gray-500">
                        Payment Method
                      </span>
                      <span className="block text-sm font-medium text-gray-900 capitalize">
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>
                  )}

                  {selectedOrder.paymentStatus && (
                    <div>
                      <span className="block text-xs font-semibold text-gray-500">
                        Payment Status
                      </span>
                      <Badge className={
                        selectedOrder.paymentStatus === 'SUCCESS'
                          ? 'bg-green-100 text-green-800'
                          : selectedOrder.paymentStatus === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {selectedOrder.paymentStatus}
                      </Badge>
                    </div>
                  )}

                  {/* Thông tin Delivery & Drone */}
                  {['PREPARING', 'DELIVERING', 'DELIVERED'].includes(selectedOrder.status) && (
                    <>
                      <Separator className="my-4" />
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Plane className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-blue-900">Delivery Information</span>
                        </div>
                        
                        {loadingDelivery ? (
                          <div className="text-center py-4">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                            <p className="text-gray-600 text-sm mt-2">Loading delivery info...</p>
                          </div>
                        ) : deliveryInfo ? (
                          <div className="space-y-3">
                            <div>
                              <span className="block text-xs font-semibold text-gray-600">
                                Drone ID
                              </span>
                              <span className="block text-sm font-medium text-gray-900">
                                {deliveryInfo.droneId}
                              </span>
                            </div>
                            <div>
                              <span className="block text-xs font-semibold text-gray-600">
                                Delivery Status
                              </span>
                              <Badge className={deliveryService.getDeliveryStatusColor(deliveryInfo.status)}>
                                {deliveryService.formatDeliveryStatus(deliveryInfo.status)}
                              </Badge>
                            </div>
                            {deliveryInfo.assignedAt && (
                              <div>
                                <span className="block text-xs font-semibold text-gray-600">
                                  Assigned At
                                </span>
                                <span className="block text-sm text-gray-900">
                                  {new Date(deliveryInfo.assignedAt).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {deliveryInfo.pickedUpAt && (
                              <div>
                                <span className="block text-xs font-semibold text-gray-600">
                                  Picked Up At
                                </span>
                                <span className="block text-sm text-gray-900">
                                  {new Date(deliveryInfo.pickedUpAt).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {deliveryInfo.completedAt && (
                              <div>
                                <span className="block text-xs font-semibold text-gray-600">
                                  Delivered At
                                </span>
                                <span className="block text-sm text-gray-900">
                                  {new Date(deliveryInfo.completedAt).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {deliveryInfo.deliveryAddress && (
                              <div>
                                <span className="block text-xs font-semibold text-gray-600">
                                  Delivery Address
                                </span>
                                <span className="block text-sm text-gray-900">
                                  {deliveryInfo.deliveryAddress}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">
                            Delivery information will be available once the restaurant prepares your order.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <Separator className="my-4" />

                <div>
                  <span className="block text-xs font-semibold text-gray-500">
                    Items
                  </span>
                  <div className="space-y-2">
                    {selectedOrder.orderItems?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {item.productName || `Product #${item.productId}`}
                        </span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-orange-600">
                    Total: ${selectedOrder.totalPrice?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
