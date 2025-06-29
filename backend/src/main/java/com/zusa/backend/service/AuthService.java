// src/main/java/com/zusa/backend/service/AuthService.java
package com.zusa.backend.service;

import com.zusa.backend.entity.User;
import com.zusa.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UserRepository  userRepo;
    private final PasswordEncoder encoder;          // 由 SecurityConfig 注入

    /* -------- 注册 -------- */
    @Transactional
    public UUID register(String email, String rawPwd, String nickname) {

        userRepo.findByEmail(email).ifPresent(u -> {
            throw new IllegalStateException("邮箱已被注册");
        });

        User u = User.builder()
                .email(email)
                .password(encoder.encode(rawPwd))
                .nickname(nickname)
                .build();
        userRepo.save(u);

        return u.getUuid();                         // 返回安全 UUID
    }

    /* -------- 登录验证（给 Controller 手动调） -------- */
    @Transactional(readOnly = true)
    public boolean verify(String email, String rawPwd) {
        return userRepo.findByEmail(email)
                .map(u -> encoder.matches(rawPwd, u.getPassword()))
                .orElse(false);
    }

    /* -------- Spring Security 所需 -------- */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User u = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("邮箱不存在"));

        return org.springframework.security.core.userdetails.User
                .withUsername(u.getEmail())
                .password(u.getPassword())
                .roles("USER")                       // 如有角色表，可改成动态
                .build();
    }
}
