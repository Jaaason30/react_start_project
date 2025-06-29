// src/main/java/com/zusa/backend/dto/post/ReactionDto.java
package com.zusa.backend.dto.post;

import lombok.Data;
import java.time.LocalDateTime;

import java.util.UUID;

@Data
public class ReactionDto {
    private UUID postUuid;
    private UUID userUuid;
    private String type; // LIKE or COLLECT
    private LocalDateTime createdAt;
}
