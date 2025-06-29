// src/main/java/com/zusa/backend/dto/post/AddCommentReq.java
package com.zusa.backend.dto.post;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Data
public class AddCommentReq {
    @NotBlank
    private String content;

    private UUID authorUuid; // 可选，用于未登录时传递用户身份
}
