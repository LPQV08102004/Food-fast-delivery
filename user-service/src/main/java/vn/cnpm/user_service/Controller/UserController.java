package vn.cnpm.user_service.Controller;

import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import vn.cnpm.user_service.Service.UserServiceImpl;
import vn.cnpm.user_service.models.User;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserServiceImpl userServiceImpl;

    @GetMapping
    public List<User> getAllUsers() {
        return userServiceImpl.getAllUsers();
    }

    @GetMapping("/{username}")
    public User getUser(@PathVariable String username) {
        return userServiceImpl.getUserByUsername(username);
    }
}