package com.zusa.backend.controller;

import com.zusa.backend.dto.auth.JwtResponse;
import com.zusa.backend.dto.auth.RefreshTokenRequest;
import com.zusa.backend.dto.auth.TokenClaims;
import com.zusa.backend.dto.auth.GuestJwtResponse;
import com.zusa.backend.dto.user.UserDto;
import com.zusa.backend.dto.user.UserReadDto;
import com.zusa.backend.security.JwtUtils;
import com.zusa.backend.service.UserService;
import com.zusa.backend.service.mapper.UserMapper;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    private final UserMapper userMapper;
    /**
     * 注册请求参数
     */
    @Value
    public static class RegisterReq {
        @Email @NotBlank String email;
        @NotBlank String password;
        @NotBlank String nickname;
    }

    /**
     * 登录请求参数
     */
    @Value
    public static class LoginReq {
        @NotBlank String username;  // email or nickname
        @NotBlank String password;
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@RequestBody @Validated RegisterReq req) {
        log.info("[📝 /register] 收到注册请求: email={}, nickname={}", req.getEmail(), req.getNickname());

        // 创建用户并返回 UserDto（含 shortId 和 内部 uuid）
        UserDto dto = userService.register(req.getEmail(), req.getPassword(), req.getNickname());

        // 构造 TokenClaims
        TokenClaims claims = new TokenClaims();
        claims.setUserUuid(dto.getUuid());
        claims.setEmail(dto.getEmail());

        // 生成令牌
        String accessToken = jwtUtils.generateAccessToken(claims);
        String refreshToken = jwtUtils.generateRefreshToken(dto.getUuid());

        // 响应仅返回 shortId，不返回 uuid
        JwtResponse response = JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .shortId(dto.getShortId())
                .email(dto.getEmail())
                .nickname(dto.getNickname())
                .build();

        log.info("[✅ /register] 注册成功，shortId: {}", dto.getShortId());
        return ResponseEntity.ok(response);
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody @Validated LoginReq req) {
        log.info("[🔐 /login] 收到登录请求 username = {}", req.getUsername());

        // 执行认证
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );
        log.info("[🔐 /login] 认证成功，authentication.getName() = {}", authentication.getName());

        // 从 Spring Security 中取出用户 UUID
        UUID userUuid = UUID.fromString(authentication.getName());

        // 加载完整用户信息
        UserDto dto = userService.getUserByUuid(userUuid);

        // 构造 TokenClaims 并生成令牌
        TokenClaims claims = new TokenClaims();
        claims.setUserUuid(dto.getUuid());
        claims.setEmail(dto.getEmail());
        String accessToken = jwtUtils.generateAccessToken(claims);
        String refreshToken = jwtUtils.generateRefreshToken(dto.getUuid());

        JwtResponse response = JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .shortId(dto.getShortId())
                .email(dto.getEmail())
                .nickname(dto.getNickname())
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * 游客登录，生成临时账号
     */
    @PostMapping("/guest")
    public ResponseEntity<GuestJwtResponse> guestLogin() {
        log.info("[👤 /guest] 游客登录请求");

        UserDto dto = userService.createGuestUser();

        TokenClaims claims = new TokenClaims();
        claims.setUserUuid(dto.getUuid());
        claims.setEmail(dto.getEmail());
        String accessToken = jwtUtils.generateAccessToken(claims);
        String refreshToken = jwtUtils.generateRefreshToken(dto.getUuid());

        UserReadDto readDto = userMapper.toReadDto(dto);

        GuestJwtResponse resp = GuestJwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(readDto)
                .build();

        return ResponseEntity.ok(resp);
    }

    /**
     * 刷新令牌
     */
    @PostMapping("/refresh")
    public ResponseEntity<JwtResponse> refreshToken(@RequestBody @Validated RefreshTokenRequest req) {
        String refreshToken = req.getRefreshToken();
        log.info("[♻️ /refresh] 收到刷新请求");

        if (jwtUtils.validateToken(refreshToken) && "REFRESH".equals(jwtUtils.getTokenType(refreshToken))) {
            // 验证通过，从 token 中取出 UUID
            UUID userUuid = jwtUtils.getUserUuidFromToken(refreshToken);
            UserDto dto = userService.getUserByUuid(userUuid);

            // 构造新 TokenClaims
            TokenClaims claims = new TokenClaims();
            claims.setUserUuid(dto.getUuid());
            claims.setEmail(dto.getEmail());
            String newAccessToken = jwtUtils.generateAccessToken(claims);
            String newRefreshToken = jwtUtils.generateRefreshToken(dto.getUuid());

            JwtResponse response = JwtResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .shortId(dto.getShortId())
                    .email(dto.getEmail())
                    .nickname(dto.getNickname())
                    .build();

            log.info("[♻️ /refresh] 刷新成功，shortId: {}", dto.getShortId());
            return ResponseEntity.ok(response);
        }

        log.warn("[♻️ /refresh] 无效或过期的刷新Token");
        return ResponseEntity.status(401).build();
    }
}
