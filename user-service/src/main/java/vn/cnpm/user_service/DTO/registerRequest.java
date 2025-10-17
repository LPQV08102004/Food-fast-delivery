package vn.cnpm.user_service.DTO;

import lombok.Data;

@Data
public class registerRequest {
    private String username;
    private String password;
    private String email;
    private String fullName;
}
