// src/main/java/com/zusa/backend/service/mapper/TagMapper.java
package com.zusa.backend.service.mapper;

import com.zusa.backend.dto.post.TagDto;
import com.zusa.backend.entity.post.Tag;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TagMapper {
    TagDto toDto(Tag tag);
}
