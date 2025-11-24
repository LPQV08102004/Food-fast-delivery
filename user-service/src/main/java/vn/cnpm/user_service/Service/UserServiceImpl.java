package vn.cnpm.user_service.Service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import vn.cnpm.user_service.Repository.UserRepository;
import vn.cnpm.user_service.Repository.roleRepository;
import vn.cnpm.user_service.models.Role;
import vn.cnpm.user_service.models.User;
import vn.cnpm.user_service.DTO.UserDTO;
import vn.cnpm.user_service.config.JwtUtils;

import java.util.List;
import java.util.stream.Collectors;


@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final roleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    @Override
    public UserDTO getCurrentUserProfile(String token) {
        String username = jwtUtils.extractUsername(token.replace("Bearer ", ""));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    @Override
    public UserDTO updateProfile(String token, UserDTO userDTO) {
        String username = jwtUtils.extractUsername(token.replace("Bearer ", ""));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Chỉ cho phép update một số fields
        if (userDTO.getFullName() != null) {
            user.setFullName(userDTO.getFullName());
        }
        if (userDTO.getEmail() != null) {
            user.setEmail(userDTO.getEmail());
        }
        if (userDTO.getPhone() != null) {
            user.setPhone(userDTO.getPhone());
        }

        userRepository.save(user);
        return convertToDTO(user);
    }

    @Override
    public UserDTO createUser(UserDTO userDTO) {
        // Check if username or email already exists
        if (userRepository.findByUsername(userDTO.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword())); // Encode password
        // Set fullName - use username if not provided
        user.setFullName(userDTO.getFullName() != null ? userDTO.getFullName() : userDTO.getUsername());
        user.setPhone(userDTO.getPhone());
        user.setStatus(userDTO.getStatus() != null ? userDTO.getStatus() : "Active");

        // Set role
        String roleName = userDTO.getRole() != null ? userDTO.getRole() : "USER";
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
        user.setRole(role);

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    @Override
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userDTO.getFullName() != null) {
            user.setFullName(userDTO.getFullName());
        }
        if (userDTO.getEmail() != null) {
            user.setEmail(userDTO.getEmail());
        }
        if (userDTO.getPhone() != null) {
            user.setPhone(userDTO.getPhone());
        }
        if (userDTO.getStatus() != null) {
            user.setStatus(userDTO.getStatus());
        }
        if (userDTO.getRole() != null) {
            // Giả sử bạn có một phương thức để lấy Role theo tên

            Role role = roleRepository.findByName(userDTO.getRole())
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRole(role);
        }

        userRepository.save(user);
        return convertToDTO(user);
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    @Override
    public UserDTO toggleUserStatus(Long id, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        userRepository.save(user);
        return convertToDTO(user);
    }

    @Override
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Helper method để convert User to UserDTO
    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().getName() : "USER")
                .status(user.getStatus() != null ? user.getStatus() : "Active")
                .build();
    }
}