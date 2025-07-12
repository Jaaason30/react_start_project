package com.zusa.backend.service;

import com.zusa.backend.entity.User;
import com.zusa.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;  // 由 SecurityConfig 注入

    /* -------- 注册 -------- */
    @Transactional
    public UUID register(String email, String rawPwd, String nickname) {
        logger.info("Registering new user with email: {} and nickname: {}", email, nickname);
        userRepo.findByEmail(email).ifPresent(u -> {
            logger.warn("Attempt to register with existing email: {}", email);
            throw new IllegalStateException("邮箱已被注册");
        });

        User u = User.builder()
                .email(email)
                .password(encoder.encode(rawPwd))
                .nickname(nickname)
                .build();
        userRepo.save(u);
        logger.info("User registered successfully: {}", u.getUuid());
        return u.getUuid();  // 返回安全 UUID
    }

    /* -------- 手动登录验证 -------- */
    @Transactional(readOnly = true)
    public boolean verify(String username, String rawPwd) {
        logger.debug("Verifying credentials for: {}", username);
        Optional<User> opt = userRepo.findByEmail(username)
                .or(() -> userRepo.findByNickname(username));
        if (opt.isEmpty()) {
            logger.warn("No user found with email or nickname: {}", username);
            return false;
        }
        User u = opt.get();
        boolean matches = encoder.matches(rawPwd, u.getPassword());
        if (!matches) {
            logger.warn("Invalid password attempt for user: {}", username);
        }
        return matches;
    }

    /* -------- Spring Security 必需 -------- */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {
        logger.debug("Loading user by username for authentication: {}", username);

        // 先按 email 查，查不到再按 nickname
        User u = userRepo.findByEmail(username)
                .or(() -> userRepo.findByNickname(username))
                .orElseThrow(() -> {
                    logger.error("User not found with email or nickname: {}", username);
                    return new UsernameNotFoundException("没有找到用户: " + username);
                });

        logger.info("User found: {} (email: {})", u.getUuid(), u.getEmail());

        // **关键：将 Spring Security 的 username 设置为用户 UUID**
        return org.springframework.security.core.userdetails.User
                .withUsername(u.getUuid().toString())
                .password(u.getPassword())
                .roles("USER")           // 如有角色表，可改成动态
                .build();
    }
}
