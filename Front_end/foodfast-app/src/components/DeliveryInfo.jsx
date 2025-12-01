import React from 'react';
import { Plane, Clock, MapPin, Battery, Package, CheckCircle, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Component hiển thị thông tin delivery và drone tracking
 */
const DeliveryInfo = ({ delivery, className = '' }) => {
  // Helper function to get field value (support both snake_case and camelCase)
  const getField = (field) => {
    if (!delivery) return null;

    // Try camelCase first
    if (delivery[field] !== undefined) return delivery[field];

    // Convert to snake_case and try
    const snakeCase = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    if (delivery[snakeCase] !== undefined) return delivery[snakeCase];

    return null;
  };

  if (!delivery) {
    return (
      <Card className={`border-gray-200 ${className}`}>
        <CardContent className="p-6">
          <p className="text-gray-500 text-center">Chưa có thông tin giao hàng</p>
        </CardContent>
      </Card>
    );
  }

  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-gray-100 text-gray-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      PICKING_UP: 'bg-yellow-100 text-yellow-800',
      PICKED_UP: 'bg-purple-100 text-purple-800',
      DELIVERING: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Status label mapping
  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Chờ xử lý',
      ASSIGNED: 'Đã gán drone',
      PICKING_UP: 'Đang đến nhà hàng',
      PICKED_UP: 'Đã lấy hàng',
      DELIVERING: 'Đang giao hàng',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    };
    return labels[status] || status;
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    try {
      return format(new Date(timestamp), 'HH:mm dd/MM', { locale: vi });
    } catch {
      return '-';
    }
  };

  // Calculate ETA remaining
  const getETAText = () => {
    const estimatedArrival = getField('estimatedArrival');
    if (!estimatedArrival) return null;
    try {
      const eta = new Date(estimatedArrival);
      const now = new Date();
      const diffMinutes = Math.round((eta - now) / 1000 / 60);

      if (diffMinutes <= 0) return 'Đang đến';
      if (diffMinutes < 60) return `${diffMinutes} phút nữa`;
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return `${hours}h ${mins}m nữa`;
    } catch {
      return null;
    }
  };

  const etaText = getETAText();

  return (
    <Card className={`border-blue-200 bg-gradient-to-br from-blue-50 to-white ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Plane className="h-5 w-5 text-blue-600" />
            Thông tin giao hàng
          </CardTitle>
          <Badge className={getStatusColor(delivery.status)}>
            {getStatusLabel(delivery.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Drone Info */}
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-gray-700">Drone ID:</span>
            </div>
            <span className="font-mono text-sm bg-blue-100 px-3 py-1 rounded-full text-blue-800">
              {delivery.droneId}
            </span>
          </div>

          {/* GPS Location */}
          {(getField('currentLat') && getField('currentLng')) && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <MapPin className="h-4 w-4" />
              <span>
                Vị trí: {getField('currentLat').toFixed(6)}, {getField('currentLng').toFixed(6)}
              </span>
            </div>
          )}

          {/* Speed & Distance */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            {getField('currentSpeed') && (
              <div className="flex items-center gap-2 text-sm">
                <Navigation className="h-4 w-4 text-orange-500" />
                <span className="text-gray-700">{getField('currentSpeed').toFixed(0)} km/h</span>
              </div>
            )}
            {getField('distanceRemaining') !== null && getField('distanceRemaining') !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-purple-500" />
                <span className="text-gray-700">
                  {getField('distanceRemaining') > 0
                    ? `${getField('distanceRemaining').toFixed(1)} km`
                    : 'Đã đến'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ETA */}
        {etaText && delivery.status !== 'COMPLETED' && (
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Dự kiến đến:</p>
                <p className="font-semibold text-orange-700">{etaText}</p>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">Lịch sử:</p>
          <div className="space-y-2">
            {delivery.createdAt && (
              <TimelineItem
                icon={Package}
                label="Tạo yêu cầu"
                time={formatTime(delivery.createdAt)}
                completed={true}
              />
            )}
            {delivery.assignedAt && (
              <TimelineItem
                icon={Plane}
                label="Gán drone"
                time={formatTime(delivery.assignedAt)}
                completed={true}
              />
            )}
            {delivery.pickedUpAt && (
              <TimelineItem
                icon={CheckCircle}
                label="Lấy hàng"
                time={formatTime(delivery.pickedUpAt)}
                completed={true}
              />
            )}
            {delivery.deliveringAt && (
              <TimelineItem
                icon={Navigation}
                label="Đang giao"
                time={formatTime(delivery.deliveringAt)}
                completed={true}
                active={delivery.status === 'DELIVERING'}
              />
            )}
            {delivery.completedAt && (
              <TimelineItem
                icon={CheckCircle}
                label="Hoàn thành"
                time={formatTime(delivery.completedAt)}
                completed={true}
              />
            )}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-600">Địa chỉ giao hàng:</p>
              <p className="text-sm font-medium text-gray-800">{delivery.deliveryAddress}</p>
              {delivery.deliveryPhone && (
                <p className="text-xs text-gray-500 mt-1">📱 {delivery.deliveryPhone}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Timeline Item Component
const TimelineItem = ({ icon: Icon, label, time, completed, active = false }) => {
  return (
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-full ${
        active ? 'bg-orange-100' : completed ? 'bg-green-100' : 'bg-gray-100'
      }`}>
        <Icon className={`h-3.5 w-3.5 ${
          active ? 'text-orange-600' : completed ? 'text-green-600' : 'text-gray-400'
        }`} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${
          active ? 'text-orange-700' : completed ? 'text-gray-700' : 'text-gray-400'
        }`}>
          {label}
        </p>
      </div>
      <span className={`text-xs ${
        active ? 'text-orange-600 font-medium' : 'text-gray-500'
      }`}>
        {time}
      </span>
    </div>
  );
};

export default DeliveryInfo;

