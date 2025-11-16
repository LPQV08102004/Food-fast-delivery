package vn.cnpm.order_service.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class UserClientFallback implements UserClient {
    
    @Override
    public Map<String, Object> getUserById(Long id) {
        log.error("User service is unavailable. Returning fallback response for user: {}", id);
        
        Map<String, Object> fallbackUser = new HashMap<>();
        fallbackUser.put("id", id);
        fallbackUser.put("name", "User Unavailable");
        fallbackUser.put("email", "unavailable@example.com");
        fallbackUser.put("status", "SERVICE_DOWN");
        
        return fallbackUser;
    }
}
