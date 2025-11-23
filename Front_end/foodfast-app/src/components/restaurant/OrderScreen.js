import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import restaurantService from '../../services/restaurantService';
import authService from '../../services/authService';
import { toast } from 'sonner';
import { OrderDetailModal } from './OrderDetailModal';

export function OrderScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Lấy thông tin user và restaurantId
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.restaurantId) {
      setRestaurantId(currentUser.restaurantId);
      loadOrders(currentUser.restaurantId);
    } else {
      toast.error('Không tìm thấy thông tin nhà hàng');
      setLoading(false);
    }
  }, []);

  const loadOrders = async (restId) => {
    try {
      setLoading(true);
      const data = await restaurantService.getOrdersByRestaurantId(restId);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'NEW':
      case 'CONFIRMED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'PREPARING':
      case 'READY':
        return 'bg-orange-100 text-orange-800';
      case 'PICKED_UP':
      case 'DELIVERING':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'NEW': return 'Đơn hàng mới';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'PREPARING': return 'Đang chế biến';
      case 'READY': return 'Sẵn sàng';
      case 'PICKED_UP': return 'Đã lấy hàng';
      case 'DELIVERING': return 'Đang giao';
      case 'DELIVERED': return 'Đã giao';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOrderUpdated = () => {
    // Reload orders after update
    if (restaurantId) {
      loadOrders(restaurantId);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center min-h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="ml-3 text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Orders ({orders.length})</h2>
        <button 
          onClick={() => toast.info('Chức năng tạo đơn hàng đang phát triển')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New orders
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">User ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">#{order.id}</td>
                    <td className="py-3 px-4">{order.userId}</td>
                    <td className="py-3 px-4">{formatTime(order.createdAt)}</td>
                    <td className="py-3 px-4">{formatDate(order.createdAt)}</td>
                    <td className="py-3 px-4 font-medium">{formatPrice(order.totalPrice)}</td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {order.paymentMethod || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
}
