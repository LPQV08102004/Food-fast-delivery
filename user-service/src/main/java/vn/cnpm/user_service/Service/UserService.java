package vn.cnpm.user_service.Service;

import vn.cnpm.user_service.models.User;
import vn.cnpm.user_service.DTO.UserDTO;
import java.util.List;

public interface UserService {
    List<UserDTO> getAllUsers();
    UserDTO getUserById(Long id);
    UserDTO getCurrentUserProfile(String token);
    UserDTO updateProfile(String token, UserDTO userDTO);
    UserDTO createUser(UserDTO userDTO); // Admin creates user
    UserDTO updateUser(Long id, UserDTO userDTO);
    void deleteUser(Long id);
    UserDTO toggleUserStatus(Long id, String status);
    User getUserByUsername(String username);
}
