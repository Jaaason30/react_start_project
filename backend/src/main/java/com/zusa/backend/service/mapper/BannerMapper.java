// src/main/java/com/zusa/backend/service/mapper/BannerMapper.java
package com.zusa.backend.service.mapper;

import com.zusa.backend.dto.post.BannerDto;
import com.zusa.backend.entity.post.Banner;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BannerMapper {
    BannerDto toDto(Banner b);
}
