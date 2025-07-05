// src/main/java/com/zusa/backend/dto/post/AddCommentReq.java
package com.zusa.backend.dto.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.UUID;

@Data
public class AddCommentReq {
    @NotBlank(message = "评论内容不能为空")
    @Size(max = 500, message = "评论内容不能超过500字")
    private String content;

    private UUID authorUuid; // 可选，用于未登录时传递用户身份

    // 新增：父评论UUID（如果是回复某条评论）
    private UUID parentCommentUuid;

    // 新增：被回复用户UUID（如果是回复特定用户）
    private UUID replyToUserUuid;
}