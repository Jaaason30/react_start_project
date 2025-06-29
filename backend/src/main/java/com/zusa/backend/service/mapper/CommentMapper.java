// src/main/java/com/zusa/backend/service/mapper/CommentMapper.java
package com.zusa.backend.service.mapper;

import com.zusa.backend.dto.post.CommentDto;
import com.zusa.backend.dto.user.UserSummaryDto;
import com.zusa.backend.entity.User;
import com.zusa.backend.entity.post.Comment;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CommentMapper {

    /* ---- User ---- */
    @Mapping(target = "profilePictureUrl",
            expression = "java(user.getProfilePicture()==null?null:\"/api/media/profile/\"+user.getProfilePicture().getUuid())")
    UserSummaryDto toUserSummary(User user);

    /* ---- Comment ---- */
    @Mapping(target = "author", source = "author")
    CommentDto toDto(Comment c);
}
