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

                    // Extract userId from token
                    Object userIdObj = claims.get("userId");
                    final String userId; // Make it final

                    if (userIdObj instanceof Integer) {
                        userId = String.valueOf((Integer) userIdObj);
                    } else if (userIdObj instanceof Long) {
                        userId = String.valueOf((Long) userIdObj);
                    } else if (userIdObj != null) {
                        userId = userIdObj.toString();
                    } else {
                        userId = null;
                    }

                    if (userId != null) {
                        // Add X-User-Id header to request
                        ServerWebExchange modifiedExchange = exchange.mutate()
                                .request(r -> r.header("X-User-Id", userId))
                                .build();

                        System.out.println("JWT Filter: Added X-User-Id header: " + userId);
                        return chain.filter(modifiedExchange);
                    } else {
                        System.err.println("JWT Filter: userId not found in token claims");
                    }
                } catch (Exception e) {
                    // Token invalid or expired - log but continue
                    System.err.println("JWT validation failed: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.err.println("JWT Filter: No Authorization header or invalid format");
            }

            // No token or invalid format, continue without adding header
            return chain.filter(exchange);
        };
    }

    public static class Config {
        // Configuration properties if needed
    }
}
