package com.barber.dto;

import com.barber.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {
    
    @Data
    public static class RegisterRequest {
        @NotBlank(message = "İsim zorunludur")
        private String name;
        
        @NotBlank(message = "E-posta zorunludur")
        @Email(message = "Geçerli bir e-posta adresi giriniz")
        private String email;
        
        @NotBlank(message = "Şifre zorunludur")
        @Size(min = 6, message = "Şifre en az 6 karakter olmalıdır")
        private String password;
        
        private String phone;
        
        @NotNull(message = "Rol seçimi zorunludur")
        private Role role;
    }
    
    @Data
    public static class LoginRequest {
        @NotBlank(message = "E-posta zorunludur")
        @Email(message = "Geçerli bir e-posta adresi giriniz")
        private String email;
        
        @NotBlank(message = "Şifre zorunludur")
        private String password;
    }
    
    @Data
    public static class AuthResponse {
        private String token;
        private String type = "Bearer";
        private Long id;
        private String email;
        private String name;
        private Role role;
        
        public AuthResponse(String token, Long id, String email, String name, Role role) {
            this.token = token;
            this.id = id;
            this.email = email;
            this.name = name;
            this.role = role;
        }
    }
    
    @Data
    public static class UserResponse {
        private Long id;
        private String email;
        private String name;
        private String phone;
        private Role role;
    }
}
