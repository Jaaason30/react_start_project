// src/main/java/com/zusa/backend/service/BannerService.java
package com.zusa.backend.service;

import com.zusa.backend.dto.post.BannerDto;

import java.util.List;

public interface BannerService {

    /** 发现页需要的“正在生效”的横幅 */
    List<BannerDto> listActive();
}
