// src/main/java/com/zusa/backend/dto/post/CommentDto.java
package com.zusa.backend.dto.post;

import com.zusa.backend.dto.user.UserSummaryDto;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CommentDto {
    private UUID uuid;
    private String content;
    private UserSummaryDto author;
    private long likeCount;
    private LocalDateTime createdAt;
}
