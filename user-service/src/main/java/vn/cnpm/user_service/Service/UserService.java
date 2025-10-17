package vn.cnpm.user_service.Service;

import vn.cnpm.user_service.models.User;
import java.util.List;

public interface UserService {
    public List<User> getAllUsers();
    public User getUserByUsername(String username);
}
