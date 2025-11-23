package vn.cnpm.paymentservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Cho phép frontend từ nhiều origins (localhost + LAN IPs)
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:*",
            "http://127.0.0.1:*",
            "http://26.*.*.*:*",      // LAN IP range
            "http://192.168.*.*:*",   // Private network range
            "http://10.*.*.*:*"       // Private network range
        ));

        // Cho phép tất cả các HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));

        // Cho phép tất cả headers
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Expose headers for frontend to read
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));

        // Cho phép gửi credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // Max age for preflight requests
        configuration.setMaxAge(3600L);

        // Áp dụng cấu hình cho tất cả endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
