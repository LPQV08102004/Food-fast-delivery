package vn.cnpm.apigateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

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
                    // Parse JWT token
                    Claims claims = Jwts.parser()
                            .setSigningKey(jwtSecret)
                            .parseClaimsJws(token)
                            .getBody();

                    // Extract userId from token
                    String userId = claims.get("userId", String.class);

                    if (userId != null) {
                        // Add X-User-Id header to request
                        ServerWebExchange modifiedExchange = exchange.mutate()
                                .request(r -> r.header("X-User-Id", userId))
                                .build();

                        return chain.filter(modifiedExchange);
                    }
                } catch (Exception e) {
                    // Token invalid or expired - log but continue
                    System.err.println("JWT validation failed: " + e.getMessage());
                }
            }

            // No token or invalid format, continue without adding header
            return chain.filter(exchange);
        };
    }

    public static class Config {
        // Configuration properties if needed
    }
}
