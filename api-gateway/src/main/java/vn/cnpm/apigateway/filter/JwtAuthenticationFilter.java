package vn.cnpm.apigateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    @Value("${jwt.secret:mySecretKeyForJWTTokenGenerationAndValidation12345}")
    private String jwtSecret;

    public JwtAuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                try {
                    // Parse JWT token using JJWT 0.11.5 API
                    Claims claims = Jwts.parserBuilder()
                            .setSigningKey(jwtSecret.getBytes())
                            .build()
                            .parseClaimsJws(token)
                            .getBody();

                    // Extract userId from token - try multiple claim names
                    String userId = null;

                    // Try "userId" first
                    Object userIdObj = claims.get("userId");
                    if (userIdObj == null) {
                        // Try "id" as fallback
                        userIdObj = claims.get("id");
                    }
                    if (userIdObj == null) {
                        // Try "sub" (subject) as fallback
                        userIdObj = claims.getSubject();
                    }

                    if (userIdObj instanceof Integer) {
                        userId = String.valueOf(userIdObj);
                    } else if (userIdObj instanceof Long) {
                        userId = String.valueOf(userIdObj);
                    } else if (userIdObj != null) {
                        userId = userIdObj.toString();
                    }

                    if (userId != null) {

                        // FIX: Tạo một biến "effectively final" mới
                        final String finalUserId = userId;

                        // Add X-User-Id header to request
                        ServerWebExchange modifiedExchange = exchange.mutate()
                                .request(r -> r.header("X-User-Id", finalUserId)) // <-- Dùng biến mới
                                .build();

                        // (Khuyên dùng) Cập nhật log để dùng biến mới cho nhất quán
                        System.out.println("[JWT Filter] Added X-User-Id header: " + finalUserId);
                        return chain.filter(modifiedExchange);
                    } else {
                        System.err.println("[JWT Filter ERROR] userId not found in token claims. Available claims: " + claims.keySet());
                    }
                } catch (io.jsonwebtoken.ExpiredJwtException e) {
                    System.err.println("[JWT Filter ERROR] Token expired: " + e.getMessage());
                } catch (io.jsonwebtoken.MalformedJwtException e) {
                    System.err.println("[JWT Filter ERROR] Malformed token: " + e.getMessage());
                } catch (io.jsonwebtoken.security.SignatureException e) {
                    System.err.println("[JWT Filter ERROR] Invalid signature: " + e.getMessage());
                } catch (Exception e) {
                    System.err.println("[JWT Filter ERROR] Token validation failed: " + e.getMessage());
                }
            } else {
                System.err.println("[JWT Filter WARNING] No Authorization header or invalid format");
            }

            // No token or invalid format, continue without adding header
            return chain.filter(exchange);
        };
    }

    public static class Config {
        // Configuration properties if needed
    }
}
