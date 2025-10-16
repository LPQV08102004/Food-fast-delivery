package vn.cnpm.user_service.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.cnpm.user_service.models.User;


import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}