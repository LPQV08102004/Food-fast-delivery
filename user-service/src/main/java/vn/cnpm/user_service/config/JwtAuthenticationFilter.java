package vn.cnpm.user_service.config;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.*;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        System.out.println("JWT Filter processing: " + requestURI);
        
        // Cho phép các request tới /api/auth/** bỏ qua JWT filter (login, register)
        if (requestURI.startsWith("/api/auth/")) {
            System.out.println("Bypassing JWT filter for auth endpoint");
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        System.out.println("Authorization header: " + (header != null ? "Present" : "Missing"));
        
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            String username = jwtUtils.extractUsername(token);
            System.out.println("Extracted username: " + username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                var userDetails = userDetailsService.loadUserByUsername(username);
                if (jwtUtils.validateToken(token)) {
                    System.out.println("Token is valid, setting authentication for user: " + username);
                    System.out.println("User authorities: " + userDetails.getAuthorities());
                    
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    System.out.println("Token validation failed");
                }
            }
        } else {
            System.out.println("No Bearer token found");
        }
        filterChain.doFilter(request, response);
    }
}
