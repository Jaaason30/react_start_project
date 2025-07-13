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
    private final PasswordEncoder encoder;

    /* -------- 注册 -------- */
    @Transactional
    public UUID register(String email, String rawPwd, String nickname) {
        logger.info("[注册] 请求注册新用户 email: {}, nickname: {}", email, nickname);

        userRepo.findByEmail(email).ifPresent(u -> {
            logger.warn("[注册失败] 邮箱已存在: {}", email);
            throw new IllegalStateException("邮箱已被注册");
        });

        User u = User.builder()
                .email(email)
                .password(encoder.encode(rawPwd))
                .nickname(nickname)
                .build();

        userRepo.save(u);
        logger.info("[注册成功] UUID: {}, email: {}, nickname: {}", u.getUuid(), u.getEmail(), u.getNickname());
        return u.getUuid();
    }

    /* -------- 手动登录验证 -------- */
    @Transactional(readOnly = true)
    public boolean verify(String username, String rawPwd) {
        logger.debug("[登录验证] 验证用户名: {}", username);

        Optional<User> opt = userRepo.findByEmail(username)
                .or(() -> userRepo.findByNickname(username));

        if (opt.isEmpty()) {
            logger.warn("[登录失败] 用户不存在: {}", username);
            return false;
        }

        User u = opt.get();
        boolean matches = encoder.matches(rawPwd, u.getPassword());

        if (!matches) {
            logger.warn("[登录失败] 密码错误 - 用户: {}", username);
        } else {
            logger.info("[登录成功] 用户: {}, UUID: {}", username, u.getUuid());
        }

        return matches;
    }

    /* -------- Spring Security 必需 -------- */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.debug("[SpringSecurity] 加载用户: {}", username);
        Optional<User> opt;

        try {
            // 尝试作为 UUID 查找
            UUID uuid = UUID.fromString(username);
            opt = userRepo.findByUuid(uuid);
        } catch (IllegalArgumentException e) {
            // 不是 UUID 再按 email 或 nickname
            opt = userRepo.findByEmail(username).or(() -> userRepo.findByNickname(username));
        }

        User u = opt.orElseThrow(() -> {
            logger.error("[认证失败] 用户不存在: {}", username);
            return new UsernameNotFoundException("没有找到用户: " + username);
        });

        logger.info("[认证成功] UUID: {}, email: {}", u.getUuid(), u.getEmail());

        return org.springframework.security.core.userdetails.User
                .withUsername(u.getUuid().toString()) // username 设置为 UUID
                .password(u.getPassword())
                .roles("USER")
                .build();
    }

}
