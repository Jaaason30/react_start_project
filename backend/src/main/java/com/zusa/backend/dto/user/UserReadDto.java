package com.zusa.backend.dto.user;

import lombok.Data;
import java.util.UUID;

@Data
public class UserReadDto {
    private UUID uuid;
    private Long shortId;
    private String nickname;
    private String avatarUrl;
    private String bio;
}
