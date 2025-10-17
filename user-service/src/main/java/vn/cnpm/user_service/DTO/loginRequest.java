package vn.cnpm.user_service.DTO;

import lombok.Data;

@Data
public class loginRequest {
    private String username;
    private String password;
}
