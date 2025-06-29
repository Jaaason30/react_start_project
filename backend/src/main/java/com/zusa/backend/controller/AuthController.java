// src/main/java/com/zusa/backend/controller/AuthController.java
package com.zusa.backend.controller;

import com.zusa.backend.dto.user.UserDto;
import com.zusa.backend.service.UserService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final UserService userService;

    /* ---------- 入参 ---------- */
    @Value
    public static class RegisterReq {
        @Email      @NotBlank String email;
        @NotBlank              String password;
        @NotBlank              String nickname;
    }

    @Value public static class LoginReq {
        @NotBlank String username;
        @NotBlank String password;
    }


    /* ---------- 注册 ---------- */
    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@RequestBody @Validated RegisterReq req) {
        UserDto dto = userService.register(req.getEmail(), req.getPassword(), req.getNickname());
        return ResponseEntity.ok(dto);
    }

    /* ---------- 登录 ---------- */
    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@RequestBody @Validated LoginReq req) {
        UserDto dto = userService.login(req.getUsername(), req.getPassword());
        return ResponseEntity.ok(dto);
    }

}
