// src/main/java/com/zusa/backend/dto/user/UserProfilePictureDto.java
package com.zusa.backend.dto.user;

import lombok.Data;

import java.util.UUID;

@Data
public class UserProfilePictureDto {
    private UUID uuid;
    private String mime;
    // 前端通常通过一个专门的 media endpoint 来获取二进制内容
}
