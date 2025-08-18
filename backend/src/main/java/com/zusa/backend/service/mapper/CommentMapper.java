// src/main/java/com/zusa/backend/service/mapper/CommentMapper.java
package com.zusa.backend.service.mapper;

import com.zusa.backend.dto.post.CommentDto;
import com.zusa.backend.dto.user.UserSummaryDto;
import com.zusa.backend.entity.User;
import com.zusa.backend.entity.post.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommentMapper {

    @Mapping(target = "author", source = "author")
    @Mapping(target = "parentCommentUuid", source = "parentComment.uuid")
    @Mapping(target = "replyToUser", source = "replyToUser")
    @Mapping(target = "likedByCurrentUser", ignore = true)
    @Mapping(target = "replies", ignore = true)
    CommentDto toDto(Comment c);

    @Mapping(target = "profilePictureUrl",
            expression = "java(user.getProfilePicture()==null?null:\"/api/media/profile/\"+user.getProfilePicture().getUuid())")
    UserSummaryDto toUserSummary(User user);
}