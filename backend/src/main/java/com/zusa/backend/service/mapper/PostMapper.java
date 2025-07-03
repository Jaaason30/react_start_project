// src/main/java/com/zusa/backend/service/mapper/PostMapper.java
package com.zusa.backend.service.mapper;

import com.zusa.backend.dto.post.*;
import com.zusa.backend.dto.user.UserSummaryDto;
import com.zusa.backend.entity.post.Post;
import com.zusa.backend.entity.post.PostImage;
import com.zusa.backend.entity.post.Tag;
import org.mapstruct.*;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface PostMapper {

    /** 作者映射：User → UserSummaryDto (用于PostSummaryDto) */
    @Mapping(target = "profilePictureUrl",
            expression = "java(author.getProfilePicture() != null ? \"/api/media/profile/\" + author.getProfilePicture().getUuid() : null)")
    @Named("toUserSummaryForPost")
    UserSummaryDto toAuthorDto(com.zusa.backend.entity.User author);

    /** 作者映射：User → AuthorSummaryDto (用于PostDetailDto) */
    @Mapping(target = "profilePictureUrl",
            expression = "java(author.getProfilePicture() != null ? \"/api/media/profile/\" + author.getProfilePicture().getUuid() : null)")
    AuthorSummaryDto toAuthorSummaryDto(com.zusa.backend.entity.User author);

    /** 帖子图片映射：PostImage → PostImageDto */
    @Mapping(target = "url", source = "img.url")
    @Mapping(target = "idx", source = "img.idx")
    PostImageDto toImageDto(PostImage img);

    /** 帖子摘要映射：Post → PostSummaryDto */
    @Mapping(target = "author", source = "post.author", qualifiedByName = "toUserSummaryForPost")
    @Mapping(target = "tags", ignore = true)    // ServiceImpl 中手动填充
    @Mapping(target = "likedByCurrentUser", ignore = true)
    @Mapping(target = "collectedByCurrentUser", ignore = true)
    @Mapping(target = "followedByCurrentUser", ignore = true)
    PostSummaryDto toSummaryDto(Post post);

    /** 帖子详情映射：Post → PostDetailDto */
    @Mapping(target = "author", source = "post.author")
    @Mapping(target = "images", source = "post.images")
    @Mapping(target = "tags", ignore = true)              // ServiceImpl 中手动填充
    @Mapping(target = "likedByCurrentUser", ignore = true)
    @Mapping(target = "collectedByCurrentUser", ignore = true)
    @Mapping(target = "followedByCurrentUser", ignore = true)
    PostDetailDto toDetail(Post post);

    /** 辅助：将 Tag 实体映射为 TagDto 集合 */
    default Set<TagDto> mapTags(Set<Tag> tags) {
        if (tags == null) return null;
        return tags.stream().map(t -> {
            TagDto dto = new TagDto();
            dto.setId(t.getId());
            dto.setName(t.getName());
            return dto;
        }).collect(Collectors.toSet());
    }
}