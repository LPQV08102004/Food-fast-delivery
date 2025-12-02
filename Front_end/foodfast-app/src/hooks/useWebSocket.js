import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'sonner';

/**
 * Custom hook for WebSocket connection using STOMP over SockJS
 * 
 * @param {string} url - WebSocket endpoint URL (e.g., 'http://localhost:8080/ws')
 * @param {number} userId - User ID for user-specific subscriptions
 * @param {number} orderId - Order ID for order-specific updates
 * @param {function} onDeliveryUpdate - Callback for delivery status updates
 * @param {function} onLocationUpdate - Callback for drone location updates
 */
export const useWebSocket = (url, userId, orderId, onDeliveryUpdate, onLocationUpdate) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!url || !userId || !orderId) return;

    // Create STOMP client
    const client = new Client({
      webSocketFactory: () => new SockJS(url),
      
      onConnect: () => {
        console.log('✅ WebSocket connected for user:', userId, 'order:', orderId);
        setConnected(true);
        setError(null);

        // Subscribe to delivery updates for this order
        client.subscribe(`/user/${userId}/topic/delivery/${orderId}`, (message) => {
          const data = JSON.parse(message.body);
          console.log('📨 Delivery update received:', data);
          
          // Show toast notification based on event type
          if (data.droneId && data.estimatedMinutes) {
            // OrderDeliveringEvent
            toast.success('🚁 Drone đang trên đường!', {
              description: `Dự kiến ${Math.ceil(data.estimatedMinutes)} phút nữa sẽ đến`,
              duration: 5000
            });
          } else if (data.completedAt) {
            // OrderCompletedEvent
            toast.success('✅ Đơn hàng đã được giao!', {
              description: 'Cảm ơn bạn đã đặt hàng',
              duration: 7000
            });
          }
          
          // Call custom callback
          if (onDeliveryUpdate) {
            onDeliveryUpdate(data);
          }
        });

        // Subscribe to drone location updates
        client.subscribe(`/user/${userId}/topic/drone-location/${orderId}`, (message) => {
          const data = JSON.parse(message.body);
          console.log('📍 Drone location update:', data);
          
          // Check for halfway notification
          if (data.distanceRemaining >= 4 && data.distanceRemaining <= 6) {
            toast.success('🎯 Drone sắp đến rồi!', {
              description: `Còn khoảng ${Math.ceil(data.distanceRemaining)} km nữa`,
              duration: 5000
            });
          }
          
          // Call custom callback
          if (onLocationUpdate) {
            onLocationUpdate(data);
          }
        });
      },

      onDisconnect: () => {
        console.log('❌ WebSocket disconnected');
        setConnected(false);
      },

      onStompError: (frame) => {
        console.error('⚠️ STOMP error:', frame);
        setError(frame.headers['message'] || 'WebSocket connection error');
        setConnected(false);
      },

      // Reconnect configuration
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    clientRef.current = client;
    client.activate();

    // Cleanup on unmount
    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [url, userId, orderId, onDeliveryUpdate, onLocationUpdate]);

  return { connected, error, client: clientRef.current };
};