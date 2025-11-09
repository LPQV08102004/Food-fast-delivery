package vn.cnpm.user_service.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.cnpm.user_service.DTO.UserDTO;
import vn.cnpm.user_service.Service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    // Lấy tất cả users (Admin only)
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Lấy user theo ID
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // Lấy profile của user hiện tại
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getCurrentUserProfile(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(userService.getCurrentUserProfile(token));
    }

    // Cập nhật profile
    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(
            @RequestHeader("Authorization") String token,
            @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateProfile(token, userDTO));
    }

    // Admin: Cập nhật user
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateUser(id, userDTO));
    }

    // Admin: Xóa user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    // Admin: Toggle user status
    @PutMapping("/{id}/status")
    public ResponseEntity<UserDTO> toggleUserStatus(
            @PathVariable Long id,
            @RequestBody StatusRequest statusRequest) {
        return ResponseEntity.ok(userService.toggleUserStatus(id, statusRequest.getStatus()));
    }

    // DTO cho status request
    @lombok.Data
    public static class StatusRequest {
        private String status;
    }
}
