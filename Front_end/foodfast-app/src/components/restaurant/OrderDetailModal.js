import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Phone, CreditCard, Package, Clock, CheckCircle, XCircle, Map, Plane } from 'lucide-react';
import { toast } from 'sonner';
import orderService from '../../services/orderService';
import deliveryService from '../../services/deliveryService';
import DeliveryInfo from '../DeliveryInfo';
import DroneMap from '../DroneMap';

export function OrderDetailModal({ order, isOpen, onClose, onOrderUpdated }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order?.status || '');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Fetch delivery info when order changes
  useEffect(() => {
    if (order && ['PREPARING', 'READY', 'PICKED_UP', 'DELIVERING', 'DELIVERED'].includes(order.status)) {
      fetchDeliveryInfo();
    } else {
      setDeliveryInfo(null);
    }
  }, [order]);

  const fetchDeliveryInfo = async () => {
    if (!order?.id) return;
    
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
  };

  if (!isOpen || !order) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
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

  const statusOptions = [
    { value: 'NEW', label: 'Đơn hàng mới' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'PREPARING', label: 'Đang chế biến' },
    { value: 'READY', label: 'Sẵn sàng' },
    { value: 'PICKED_UP', label: 'Đã lấy hàng' },
    { value: 'DELIVERING', label: 'Đang giao' },
    { value: 'DELIVERED', label: 'Đã giao' },
  ];

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.status) {
      toast.info('Trạng thái không thay đổi');
      return;
    }

    try {
      setIsUpdating(true);
      await orderService.updateOrderStatus(order.id, selectedStatus);
      toast.success('Cập nhật trạng thái thành công!');
      
      // Fetch delivery info after status update
      if (['PREPARING', 'READY', 'PICKED_UP', 'DELIVERING', 'DELIVERED'].includes(selectedStatus)) {
        setTimeout(() => fetchDeliveryInfo(), 1000);
      }
      
      onOrderUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      setIsUpdating(true);
      await orderService.cancelOrder(order.id);
      toast.success('Đã hủy đơn hàng thành công!');
      onOrderUpdated();
      onClose();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.message || 'Không thể hủy đơn hàng');
    } finally {
      setIsUpdating(false);
    }
  };

  const canCancel = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
  const canUpdateStatus = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng #{order.id}</h2>
            <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
            <div className="text-sm text-gray-500">
              <span className="font-medium">Payment Status: </span>
              <span className={order.paymentStatus === 'SUCCESS' ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>
                {order.paymentStatus || 'PENDING'}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">User ID:</span>
                <span className="ml-2 font-medium">{order.userId}</span>
              </div>
              {order.deliveryFullName && (
                <div>
                  <span className="text-gray-600">Họ tên:</span>
                  <span className="ml-2 font-medium">{order.deliveryFullName}</span>
                </div>
              )}
              {order.deliveryPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{order.deliveryPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          {order.deliveryAddress && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Địa chỉ giao hàng
              </h3>
              <div className="text-sm space-y-2">
                <p className="text-gray-700">{order.deliveryAddress}</p>
                {order.deliveryCity && (
                  <p className="text-gray-600">Thành phố: {order.deliveryCity}</p>
                )}
                {order.deliveryNotes && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      <strong>Ghi chú:</strong> {order.deliveryNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Món ăn ({order.orderItems?.length || 0})
            </h3>
            <div className="space-y-2">
              {order.orderItems?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productName || `Product #${item.productId}`}</p>
                    <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(item.price)}</p>
                    <p className="text-sm text-gray-500">× {item.quantity}</p>
                  </div>
                  <div className="text-right ml-4 min-w-[100px]">
                    <p className="font-semibold text-orange-600">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Thông tin thanh toán
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức thanh toán:</span>
                <span className="font-medium">{order.paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                <span className="text-lg font-bold text-orange-600">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Drone Tracking Info */}
          {['PREPARING', 'READY', 'PICKED_UP', 'DELIVERING', 'DELIVERED'].includes(order.status) && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 space-y-4 border border-blue-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-600" />
                Thông tin giao hàng
              </h3>
              
              {loadingDelivery ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600"></div>
                  <p className="text-gray-600 text-sm mt-3">Đang tải thông tin giao hàng...</p>
                </div>
              ) : deliveryInfo ? (
                <>
                  <DeliveryInfo delivery={deliveryInfo} className="bg-white" />
                  
                  {/* Track on Map Button */}
                  {((deliveryInfo.currentLat && deliveryInfo.currentLng) ||
                    (deliveryInfo.current_lat && deliveryInfo.current_lng)) && (
                    <button
                      onClick={() => setShowMap(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                    >
                      <Map className="w-5 h-5" />
                      Theo dõi drone trên bản đồ
                    </button>
                  )}
                  
                  {/* Refresh Button */}
                  <button
                    onClick={fetchDeliveryInfo}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <Clock className="w-4 h-4" />
                    Làm mới thông tin
                  </button>
                </>
              ) : (
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                    <Plane className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600">
                    {order.status === 'PREPARING' 
                      ? 'Drone sẽ được gán sau khi đơn hàng sẵn sàng'
                      : 'Thông tin giao hàng đang được cập nhật...'}
                  </p>
                  <button
                    onClick={fetchDeliveryInfo}
                    className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Kiểm tra lại
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Update Status Section */}
          {canUpdateStatus && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Cập nhật trạng thái
              </h3>
              <div className="space-y-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isUpdating}
                >
                  <option value="">-- Chọn trạng thái --</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleUpdateStatus}
                  disabled={isUpdating || !selectedStatus || selectedStatus === order.status}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  {isUpdating ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {canCancel && (
              <button
                onClick={handleCancelOrder}
                disabled={isUpdating}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <XCircle className="w-5 h-5" />
                {isUpdating ? 'Đang xử lý...' : 'Hủy đơn hàng'}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Drone Map Modal */}
      {showMap && deliveryInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
            <DroneMap
              delivery={deliveryInfo}
              onClose={() => setShowMap(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
