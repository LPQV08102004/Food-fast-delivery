package vn.cnpm.user_service.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.cnpm.user_service.DTO.AuthResponse;
import vn.cnpm.user_service.DTO.loginRequest;
import vn.cnpm.user_service.DTO.registerRequest;
import vn.cnpm.user_service.Service.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody registerRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody loginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}

