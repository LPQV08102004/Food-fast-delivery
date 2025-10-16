package vn.cnpm.user_service.Controller;

import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import vn.cnpm.user_service.Service.UserService;
import vn.cnpm.user_service.models.User;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

    @GetMapping("/{username}")
    public User getUser(@PathVariable String username) {
        return userService.getUserByUsername(username);
    }
}