package com.zusa.backend.dto.auth;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class TokenClaims {
    private UUID userUuid;
    private String email;
}