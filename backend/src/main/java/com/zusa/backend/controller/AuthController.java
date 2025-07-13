// src/main/java/com/zusa/backend/controller/AuthController.java
package com.zusa.backend.controller;

import com.zusa.backend.dto.auth.JwtResponse;
import com.zusa.backend.dto.auth.RefreshTokenRequest;
import com.zusa.backend.dto.user.UserDto;
import com.zusa.backend.security.JwtUtils;
import com.zusa.backend.service.UserService;
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

    /* ---------- 入参 ---------- */
    @Value
    public static class RegisterReq {
        @Email      @NotBlank String email;
        @NotBlank              String password;
        @NotBlank              String nickname;
    }

    @Value
    public static class LoginReq {
        @NotBlank String username;  // can be email or nickname
        @NotBlank String password;
    }

    /* ---------- 注册 ---------- */
    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@RequestBody @Validated RegisterReq req) {
        log.info("[📝 /register] 收到注册请求: email={}, nickname={}", req.getEmail(), req.getNickname());

        UserDto dto = userService.register(req.getEmail(), req.getPassword(), req.getNickname());
        String accessToken = jwtUtils.generateAccessToken(dto.getUuid(), dto.getEmail());
        String refreshToken = jwtUtils.generateRefreshToken(dto.getUuid());

        JwtResponse response = JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userUuid(dto.getUuid())
                .email(dto.getEmail())
                .nickname(dto.getNickname())
                .build();

        log.info("[✅ /register] 注册成功，用户UUID: {}", dto.getUuid());
        return ResponseEntity.ok(response);
    }

    /* ---------- 登录 ---------- */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody @Validated LoginReq req) {
        log.info("[🔐 /login] 收到登录请求 username = {}", req.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );

        log.info("[🔐 /login] 认证成功，authentication.getName() = {}", authentication.getName());

        String userUuidStr = authentication.getName();
        UUID userUuid = UUID.fromString(userUuidStr);

        log.info("[🔐 /login] 准备调用 userService.getUserByUuid，UUID = {}", userUuid);
        UserDto dto = userService.getUserByUuid(userUuid);

        log.info("[🔐 /login] 用户信息查询成功，昵称 = {}, email = {}", dto.getNickname(), dto.getEmail());

        String accessToken = jwtUtils.generateAccessToken(dto.getUuid(), dto.getEmail());
        String refreshToken = jwtUtils.generateRefreshToken(dto.getUuid());

        JwtResponse response = JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userUuid(dto.getUuid())
                .email(dto.getEmail())
                .nickname(dto.getNickname())
                .build();

        return ResponseEntity.ok(response);
    }

    /* ---------- 刷新Token ---------- */
    @PostMapping("/refresh")
    public ResponseEntity<JwtResponse> refreshToken(@RequestBody @Validated RefreshTokenRequest req) {
        String refreshToken = req.getRefreshToken();

        log.info("[♻️ /refresh] 收到刷新请求");

        if (jwtUtils.validateToken(refreshToken) && "REFRESH".equals(jwtUtils.getTokenType(refreshToken))) {
            UUID userUuid = jwtUtils.getUserUuidFromToken(refreshToken);
            UserDto dto = userService.getUserByUuid(userUuid);

            String newAccessToken = jwtUtils.generateAccessToken(dto.getUuid(), dto.getEmail());
            String newRefreshToken = jwtUtils.generateRefreshToken(dto.getUuid());

            JwtResponse response = JwtResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .userUuid(dto.getUuid())
                    .email(dto.getEmail())
                    .nickname(dto.getNickname())
                    .build();

            log.info("[♻️ /refresh] 刷新成功，UUID: {}", dto.getUuid());
            return ResponseEntity.ok(response);
        }

        log.warn("[♻️ /refresh] 无效或过期的刷新Token");
        return ResponseEntity.status(401).build();
    }
}