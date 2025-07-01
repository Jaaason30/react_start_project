// src/main/java/com/zusa/backend/dto/post/AuthorSummaryDto.java
package com.zusa.backend.dto.post;

import lombok.Data;

import java.util.UUID;

@Data
public class AuthorSummaryDto {
    private UUID uuid;
    private String nickname;
    private String profilePictureUrl;
}
