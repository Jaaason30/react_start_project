// src/main/java/com/zusa/backend/dto/user/UserDatesDto.java
package com.zusa.backend.dto.user;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDatesDto {
    private LocalDateTime createdAt;
    private LocalDateTime lastActiveAt;
}
