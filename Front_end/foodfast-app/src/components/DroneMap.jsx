import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import deliveryService from '../services/deliveryService';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom drone icon
const droneIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="8" fill="#3B82F6" opacity="0.8"/>
      <circle cx="12" cy="12" r="3" fill="#EF4444"/>
      <line x1="12" y1="4" x2="12" y2="8" stroke="white" stroke-width="2"/>
      <line x1="12" y1="16" x2="12" y2="20" stroke="white" stroke-width="2"/>
      <line x1="4" y1="12" x2="8" y2="12" stroke="white" stroke-width="2"/>
      <line x1="16" y1="12" x2="20" y2="12" stroke="white" stroke-width="2"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

// Restaurant icon
const restaurantIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#10B981" stroke="#059669" stroke-width="1"/>
      <circle cx="12" cy="12" r="4" fill="#FFFFFF"/>
      <text x="12" y="15" text-anchor="middle" font-size="12" fill="#10B981" font-weight="bold">R</text>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Customer icon
const customerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EF4444" stroke="#DC2626" stroke-width="1"/>
      <circle cx="12" cy="9" r="3" fill="#FFFFFF"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Component to auto-center map on drone
function MapUpdater({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), {
        animate: true,
        duration: 1
      });
    }
  }, [center, zoom, map]);

  return null;
}

const DroneMap = ({ delivery, onClose }) => {
  const [dronePosition, setDronePosition] = useState(null);
  const [deliveryData, setDeliveryData] = useState(delivery);
  const intervalRef = useRef(null);

  // Helper function to get field value (support both snake_case and camelCase)
  const getField = (obj, field) => {
    if (!obj) return null;

    // Try camelCase first
    if (obj[field] !== undefined) return obj[field];

    // Convert to snake_case and try
    const snakeCase = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    if (obj[snakeCase] !== undefined) return obj[snakeCase];

    return null;
  };

  // Helper to get current speed
  const getCurrentSpeed = (data) => {
    return getField(data, 'currentSpeed') || 0;
  };

  // Helper to get distance remaining
  const getDistanceRemaining = (data) => {
    return getField(data, 'distanceRemaining');
  };

  // Helper to get estimated arrival
  const getEstimatedArrival = (data) => {
    return getField(data, 'estimatedArrival');
  };

  // Helper to get delivery address
  const getDeliveryAddress = (data) => {
    return getField(data, 'deliveryAddress');
  };

  // Parse initial GPS location - support both formats
  useEffect(() => {
    let initialPosition = null;
    
    if (delivery?.current_lat && delivery?.current_lng) {
      // Format từ database: current_lat, current_lng (DOUBLE)
      initialPosition = [delivery.current_lat, delivery.current_lng];
    } else if (delivery?.currentLat && delivery?.currentLng) {
      // Format từ Java camelCase: currentLat, currentLng
      initialPosition = [delivery.currentLat, delivery.currentLng];
    } else if (delivery?.currentLocation) {
      // Legacy format: "lat,lng" string
      try {
        const [lat, lng] = delivery.currentLocation.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          initialPosition = [lat, lng];
        }
      } catch (error) {
        console.error('Error parsing currentLocation:', error);
      }
    }
    
    // Fallback to default HCM location if no GPS available
    if (!initialPosition) {
      console.warn('No GPS data available, using default location');
      initialPosition = [10.7769, 106.7009]; // HCM center
    }
    
    setDronePosition(initialPosition);
  }, [delivery]);

  // Auto-refresh GPS every 5 seconds
  useEffect(() => {
    if (!delivery?.id) return;

    const fetchDroneLocation = async () => {
      try {
        const data = await deliveryService.getDeliveryById(delivery.id);

        if (data) {
          setDeliveryData(data);

          // Support multiple GPS formats
          if (data.current_lat && data.current_lng) {
            // Database format: current_lat, current_lng (DOUBLE)
            setDronePosition([data.current_lat, data.current_lng]);
          } else if (data.currentLat && data.currentLng) {
            // Java camelCase format
            setDronePosition([data.currentLat, data.currentLng]);
          } else if (data.currentLocation) {
            // Legacy string format: "lat,lng"
            try {
              const [lat, lng] = data.currentLocation.split(',').map(Number);
              if (!isNaN(lat) && !isNaN(lng)) {
                setDronePosition([lat, lng]);
              }
            } catch (error) {
              console.error('Error parsing currentLocation:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching drone location:', error);
      }
    };

    // Fetch immediately
    fetchDroneLocation();

    // Then set interval
    intervalRef.current = setInterval(fetchDroneLocation, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [delivery?.id]);

  if (!deliveryData) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600">Không có thông tin giao hàng</p>
        </div>
      </div>
    );
  }

  // Always show map, even if GPS not available yet (will show default location)
  const effectiveDronePosition = dronePosition || [10.7769, 106.7009];

  // Default locations (HCM area)
  const restaurantPosition = [10.7769, 106.7009]; // HCM center - should be from restaurant data
  const customerPosition = [10.7245, 106.7412]; // Should be from delivery address

  // Calculate route polyline positions
  const routePositions = [restaurantPosition, effectiveDronePosition];

  // Only add customer position if drone hasn't delivered yet
  if (deliveryData.status !== 'COMPLETED') {
    routePositions.push(customerPosition);
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

  // Calculate ETA text
  const getETAText = () => {
    const estimatedArrival = getEstimatedArrival(deliveryData);
    if (!estimatedArrival) return null;
    try {
      const eta = new Date(estimatedArrival);
      const now = new Date();
      const diffMinutes = Math.round((eta - now) / 1000 / 60);

      if (diffMinutes <= 0) return 'Đang đến';
      if (diffMinutes < 60) return `${diffMinutes} phút`;
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return `${hours}h ${mins}m`;
    } catch {
      return null;
    }
  };

  return (
    <div className="relative">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[1000] bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        aria-label="Close map"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Info panel */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
          <span className="text-2xl">🚁</span>
          <span className="font-mono text-blue-600">{deliveryData.droneId}</span>
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Tốc độ:</span>
            <span className="font-semibold text-orange-600">
              {getCurrentSpeed(deliveryData).toFixed(0)} km/h
            </span>
          </div>

          {getDistanceRemaining(deliveryData) !== null && getDistanceRemaining(deliveryData) !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Còn lại:</span>
              <span className="font-semibold text-purple-600">
                {getDistanceRemaining(deliveryData) > 0
                  ? `${getDistanceRemaining(deliveryData).toFixed(1)} km`
                  : 'Đã đến'}
              </span>
            </div>
          )}

          {getETAText() && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">ETA:</span>
              <span className="font-semibold text-blue-600">{getETAText()}</span>
            </div>
          )}

          <div className="pt-2">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(deliveryData.status)}`}>
              {getStatusLabel(deliveryData.status)}
            </div>
          </div>
        </div>

        {/* Live indicator */}
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>Cập nhật thời gian thực</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={effectiveDronePosition}
        zoom={14}
        style={{ height: '600px', width: '100%' }}
        className="rounded-lg"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapUpdater center={effectiveDronePosition} />

        {/* Restaurant marker */}
        <Marker position={restaurantPosition} icon={restaurantIcon}>
          <Popup>
            <div className="text-center p-1">
              <p className="font-bold text-green-700">🍽️ Nhà hàng</p>
              <p className="text-xs text-gray-600 mt-1">Điểm lấy hàng</p>
            </div>
          </Popup>
        </Marker>

        {/* Drone marker */}
        <Marker position={effectiveDronePosition} icon={droneIcon}>
          <Popup>
            <div className="text-center p-1">
              <p className="font-bold text-blue-700">🚁 {deliveryData.droneId || getField(deliveryData, 'droneId')}</p>
              <p className="text-xs text-gray-600 mt-1">
                {getCurrentSpeed(deliveryData).toFixed(0)} km/h
              </p>
              {getDistanceRemaining(deliveryData) !== null && (
                <p className="text-xs text-gray-600">
                  Còn {getDistanceRemaining(deliveryData).toFixed(1)} km
                </p>
              )}
            </div>
          </Popup>
        </Marker>

        {/* Customer marker */}
        <Marker position={customerPosition} icon={customerIcon}>
          <Popup>
            <div className="text-center p-1">
              <p className="font-bold text-red-700">📍 Khách hàng</p>
              <p className="text-xs text-gray-600 mt-1">Điểm giao hàng</p>
              {getDeliveryAddress(deliveryData) && (
                <p className="text-xs text-gray-500 mt-1 max-w-[150px]">
                  {getDeliveryAddress(deliveryData)}
                </p>
              )}
            </div>
          </Popup>
        </Marker>

        {/* Route polyline */}
        <Polyline
          positions={routePositions}
          pathOptions={{
            color: '#3B82F6',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10',
            lineCap: 'round',
            lineJoin: 'round'
          }}
        />

        {/* Completed route (from restaurant to drone if picked up) */}
        {['PICKED_UP', 'DELIVERING', 'COMPLETED'].includes(deliveryData.status) && (
          <Polyline
            positions={[restaurantPosition, effectiveDronePosition]}
            pathOptions={{
              color: '#10B981',
              weight: 3,
              opacity: 0.8
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default DroneMap;

