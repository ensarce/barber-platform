package com.barber.service;

import com.barber.dto.AuthDto;
import com.barber.entity.Role;
import com.barber.entity.User;
import com.barber.exception.BadRequestException;
import com.barber.repository.UserRepository;
import com.barber.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    
    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Bu e-posta adresi zaten kullanımda");
        }
        
        // Admin cannot be self-registered
        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Admin hesabı oluşturulamaz");
        }
        
        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .phone(request.getPhone())
            .role(request.getRole())
            .build();
        
        user = userRepository.save(user);
        
        String token = jwtTokenProvider.generateToken(user.getEmail());
        
        return new AuthDto.AuthResponse(
            token,
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRole()
        );
    }
    
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        String token = jwtTokenProvider.generateToken(authentication);
        
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadRequestException("Kullanıcı bulunamadı"));
        
        return new AuthDto.AuthResponse(
            token,
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRole()
        );
    }
    
    public AuthDto.UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BadRequestException("Kullanıcı bulunamadı"));
        
        AuthDto.UserResponse response = new AuthDto.UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        
        return response;
    }
}
