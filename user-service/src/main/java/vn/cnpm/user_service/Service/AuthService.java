package vn.cnpm.user_service.Service;

import vn.cnpm.user_service.DTO.AuthResponse;
import vn.cnpm.user_service.DTO.loginRequest;
import vn.cnpm.user_service.DTO.registerRequest;

public interface AuthService {
    AuthResponse register(registerRequest request);
    AuthResponse login(loginRequest request);
}
