package com.zusa.backend.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private UUID userUuid;
    private String email;
    private String nickname;
}