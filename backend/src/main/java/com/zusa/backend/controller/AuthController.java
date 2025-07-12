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

        return ResponseEntity.ok(response);
    }

    /* ---------- 登录 ---------- */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody @Validated LoginReq req) {
        // 通过 AuthenticationManager 处理 email 或 nickname
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );

        // authentication.getName() 始终是用户的 email
        String principalEmail = authentication.getName();
        UserDto dto = userService.getUserByEmail(principalEmail);

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

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).build();
    }
}