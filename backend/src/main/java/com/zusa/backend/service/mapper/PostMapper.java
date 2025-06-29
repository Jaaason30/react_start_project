// src/main/java/com/zusa/backend/service/mapper/PostMapper.java

package com.zusa.backend.service.mapper;

import com.zusa.backend.dto.post.PostDetailDto;
import com.zusa.backend.dto.post.PostImageDto;
import com.zusa.backend.dto.post.PostSummaryDto;
import com.zusa.backend.dto.user.UserSummaryDto;
import com.zusa.backend.entity.post.Post;
import com.zusa.backend.entity.post.PostImage;
import com.zusa.backend.entity.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PostMapper {

    /* ===== User ===== */
    @Mapping(target = "profilePictureUrl",
            expression = "java(user.getProfilePicture() == null ? null : \"/api/media/profile/\" + user.getProfilePicture().getUuid())")
    UserSummaryDto toUserSummary(User user);

    /* ===== Image ===== */
    PostImageDto toImageDto(PostImage img);

    /* ===== Summary ===== */
    @Mapping(target = "author", source = "author")
    @Mapping(target = "likedByMe", ignore = true)         // ✅ 防止 MapStruct 覆盖 Service 设置的值
    @Mapping(target = "collectedByMe", ignore = true)     // ✅ 防止 MapStruct 覆盖 Service 设置的值
    PostSummaryDto toSummary(Post post);

    /* ===== Detail ===== */
    @Mapping(target = "author",  source = "author")
    @Mapping(target = "images",  source = "images")
    @Mapping(target = "tags",    ignore = true)           // 手动在 Service 中补充
    @Mapping(target = "likedByMe", ignore = true)         // ✅ 防止 MapStruct 覆盖 Service 设置的值
    @Mapping(target = "collectedByMe", ignore = true)     // ✅ 防止 MapStruct 覆盖 Service 设置的值
    PostDetailDto toDetail(Post post);
}
