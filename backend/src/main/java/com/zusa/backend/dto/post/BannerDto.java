// src/main/java/com/zusa/backend/dto/post/BannerDto.java
package com.zusa.backend.dto.post;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BannerDto {
    private Long id;
    private String imageUrl;
    private String linkUrl;
    private int sortOrder;
    private boolean enabled;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
}
