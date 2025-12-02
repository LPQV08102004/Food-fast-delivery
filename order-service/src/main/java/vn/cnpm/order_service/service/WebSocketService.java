package vn.cnpm.order_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Service for sending real-time messages via WebSocket
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Send message to specific user
     * 
     * @param userId User ID
     * @param destination Topic destination (e.g., "/topic/delivery")
     * @param payload Message payload
     */
    public void sendToUser(Long userId, String destination, Object payload) {
        try {
            String userDestination = "/user/" + userId + destination;
            messagingTemplate.convertAndSend(userDestination, payload);
            log.debug("Sent WebSocket message to user {} at {}", userId, userDestination);
        } catch (Exception e) {
            log.error("Failed to send WebSocket message to user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Send message to all subscribers of a topic
     * 
     * @param destination Topic destination
     * @param payload Message payload
     */
    public void sendToTopic(String destination, Object payload) {
        try {
            messagingTemplate.convertAndSend(destination, payload);
            log.debug("Sent WebSocket message to topic {}", destination);
        } catch (Exception e) {
            log.error("Failed to send WebSocket message to topic {}: {}", destination, e.getMessage());
        }
    }

    /**
     * Send delivery status update to customer
     */
    public void sendDeliveryUpdate(Long userId, Long orderId, Object event) {
        sendToUser(userId, "/topic/delivery/" + orderId, event);
    }

    /**
     * Send drone location update to customer
     */
    public void sendDroneLocationUpdate(Long userId, Long orderId, Object locationData) {
        sendToUser(userId, "/topic/drone-location/" + orderId, locationData);
    }
}
