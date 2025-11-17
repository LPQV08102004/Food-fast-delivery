package vn.cnpm.user_service.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.cnpm.user_service.models.Role;

import java.util.Optional;

public interface roleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);

}
