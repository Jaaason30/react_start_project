package com.zusa.backend.service.impl;

import com.zusa.backend.dto.post.*;
import com.zusa.backend.entity.User;
import com.zusa.backend.entity.post.Post;
import com.zusa.backend.entity.post.PostImage;
import com.zusa.backend.entity.post.Reaction;
import com.zusa.backend.entity.post.Tag;
import com.zusa.backend.repository.PostRepository;
import com.zusa.backend.repository.ReactionRepository;
import com.zusa.backend.repository.TagRepository;
import com.zusa.backend.repository.UserRepository;
import com.zusa.backend.service.MediaService;
import com.zusa.backend.service.PostService;
import com.zusa.backend.service.mapper.PostMapper;
import com.zusa.backend.service.model.CreatePostCmd;
import com.zusa.backend.service.model.EditPostCmd;
import com.zusa.backend.service.model.FeedType;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository     postRepo;
    private final UserRepository     userRepo;
    private final TagRepository      tagRepo;
    private final ReactionRepository reactionRepo;
    private final PostMapper         mapper;
    private final MediaService       mediaService;

    @Value("${app.post.official-emails}")
    private List<String> officialEmails;

    @Value("${app.post.max-images:9}")
    private int maxImages;

    // ========== 1) Feed ==========
    @Override
    @Transactional(readOnly = true)
    public Page<PostSummaryDto> listFeed(FeedType type, UUID me, Pageable pageable) {
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.Direction.DESC, "createdAt");
        }

        Page<Post> page = switch (type) {
            case OFFICIAL -> postRepo.findByAuthor_EmailInOrderByCreatedAtDesc(officialEmails, pageable);
            case FOLLOWED -> throw new UnsupportedOperationException("FOLLOWED feed 尚未实现");
            case USER     -> postRepo.findAllByOrderByCreatedAtDesc(pageable);
        };

        return toSummaryPage(page, me);
    }

    // ========== 2) Tag 查询 ==========
    @Override
    @Transactional(readOnly = true)
    public Page<PostSummaryDto> listByTag(String tagName, UUID me, Pageable pageable) {
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.Direction.DESC, "createdAt");
        }
        Page<Post> page = postRepo.findByTags_NameOrderByCreatedAtDesc(tagName.toLowerCase(), pageable);
        return toSummaryPage(page, me);
    }

    // ========== 3) 全文搜索 ==========
    @Override
    @Transactional(readOnly = true)
    public Page<PostSummaryDto> search(String keyword, UUID me, Pageable pageable) {
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.Direction.DESC, "createdAt");
        }
        String kw = Optional.ofNullable(keyword).orElse("").trim();
        Page<Post> page = postRepo.searchByKeyword(kw, pageable);
        return toSummaryPage(page, me);
    }

    // Helper: Post → PostSummaryDto（含 reactions + tags）
    private Page<PostSummaryDto> toSummaryPage(Page<Post> page, UUID me) {
        List<PostSummaryDto> dtos = page.getContent().stream()
                .map(mapper::toSummaryDto)
                .collect(Collectors.toList());

        if (me != null) {
            markReactions(dtos, me);
        }

        // 填充 tags 列表
        dtos.forEach(dto -> {
            Post post = postRepo.findByUuid(dto.getUuid())
                    .orElseThrow(() -> new EntityNotFoundException("Post not found"));
            Set<TagDto> tagDtos = post.getTags().stream()
                    .map(t -> {
                        TagDto td = new TagDto();
                        td.setId(t.getId());
                        td.setName(t.getName());
                        return td;
                    })
                    .collect(Collectors.toSet());
            dto.setTags(tagDtos);
        });

        return new PageImpl<>(dtos, page.getPageable(), page.getTotalElements());
    }

    // ========== 4) 详情 ==========
    @Override
    @Transactional(readOnly = true)
    public PostDetailDto getDetail(UUID postUuid, UUID currentUserUuid) {
        // 1) 加载帖子及关联
        Post post = postRepo.findDetailByUuid(postUuid)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));

        // 2) MapStruct 转 DTO
        PostDetailDto dto = mapper.toDetail(post);

        // 2.5) 手动映射 author 到 AuthorSummaryDto
        AuthorSummaryDto authorDto = new AuthorSummaryDto();
        authorDto.setUuid(post.getAuthor().getUuid());
        authorDto.setNickname(post.getAuthor().getNickname());
        authorDto.setShortId(post.getAuthor().getShortId());
        authorDto.setProfilePictureUrl(
                post.getAuthor().getProfilePicture() != null
                        ? "/api/media/profile/" + post.getAuthor().getProfilePicture().getUuid()
                        : null
        );
        dto.setAuthor(authorDto);

        // 3) 填充 images
        List<PostImageDto> imgs = post.getImages().stream()
                .map(mapper::toImageDto)
                .collect(Collectors.toList());
        dto.setImages(imgs);

        // 4) 填充 tags
        Set<TagDto> tagDtos = post.getTags().stream()
                .map(t -> {
                    TagDto td = new TagDto();
                    td.setId(t.getId());
                    td.setName(t.getName());
                    return td;
                })
                .collect(Collectors.toSet());
        dto.setTags(tagDtos);

        // 5) 查询点赞/收藏状态
        if (currentUserUuid != null) {
            List<Reaction.Type> types = reactionRepo.findTypesByPostAndUser(postUuid, currentUserUuid);
            dto.setLikedByCurrentUser(types.contains(Reaction.Type.LIKE));
            dto.setCollectedByCurrentUser(types.contains(Reaction.Type.COLLECT));
        }

        // 6) 查询关注状态
        boolean followed = false;
        if (currentUserUuid != null) {
            User viewer = userRepo.findByUuid(currentUserUuid)
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));
            followed = post.getAuthor().getFollowers().contains(viewer);
        }
        dto.setFollowedByCurrentUser(followed);

        return dto;
    }

    // ========== 5) 创建 ==========
    @Override
    @Transactional
    public UUID createPost(CreatePostCmd cmd, UUID authorUuid) {
        User author = userRepo.findByUuid(authorUuid)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (cmd.images() == null || cmd.images().isEmpty()) {
            throw new IllegalArgumentException("必须上传至少一张图片");
        }
        if (cmd.images().size() > maxImages) {
            throw new IllegalArgumentException("最多只能上传 " + maxImages + " 张");
        }

        List<String> urls = mediaService.uploadImages(cmd.images(), "post");
        List<PostImage> images = new ArrayList<>();
        for (int i = 0; i < urls.size(); i++) {
            images.add(PostImage.builder().idx(i).url(urls.get(i)).build());
        }

        Set<Tag> tags = Optional.ofNullable(cmd.tagNames()).orElse(Set.of()).stream()
                .map(this::normalizeTag)
                .filter(s -> !s.isBlank())
                .map(this::getOrCreateTagWithRetry)
                .collect(Collectors.toSet());

        Post post = Post.builder()
                .author(author)
                .title(cmd.title())
                .content(cmd.content())
                .coverUrl(urls.get(0))
                .images(images)
                .tags(tags)
                .build();
        images.forEach(img -> img.setPost(post));

        postRepo.saveAndFlush(post);
        return post.getUuid();
    }

    // ========== 6) 编辑 ==========
    @Override
    @Transactional
    public void editPost(EditPostCmd cmd, UUID operatorUuid) {
        Post post = postRepo.findByUuid(cmd.postUuid())
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        if (!post.getAuthor().getUuid().equals(operatorUuid)) {
            throw new SecurityException("无权编辑此帖");
        }
        if (cmd.title() != null) post.setTitle(cmd.title());
        if (cmd.content() != null) post.setContent(cmd.content());
        if (cmd.tagNames() != null) {
            Set<Tag> newTags = cmd.tagNames().stream()
                    .map(this::normalizeTag)
                    .filter(s -> !s.isBlank())
                    .map(this::getOrCreateTagWithRetry)
                    .collect(Collectors.toSet());
            post.setTags(newTags);
        }
    }

    // ========== 7) 删除 ==========
    @Override
    @Transactional
    public void deletePost(UUID postUuid, UUID operatorUuid) {
        Post post = postRepo.findByUuid(postUuid)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        if (!post.getAuthor().getUuid().equals(operatorUuid)) {
            throw new SecurityException("无权删除此帖");
        }
        postRepo.delete(post);
    }
    // ========== 8) 按作者UUID查询 ==========
    @Override
    @Transactional(readOnly = true)
    public Page<PostSummaryDto> listByAuthor(UUID authorUuid, UUID me, Pageable pageable) {
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.Direction.DESC, "createdAt");
        }
        Page<Post> page = postRepo.findByAuthor_UuidOrderByCreatedAtDesc(authorUuid, pageable);
        return toSummaryPage(page, me);
    }

    // ========== 9) 按作者shortId查询 ==========
    @Override
    @Transactional(readOnly = true)
    public Page<PostSummaryDto> listByAuthorShortId(Long authorShortId, UUID me, Pageable pageable) {
        //System.out.println("[listByAuthorShortId] shortId = " + authorShortId);
        Optional<User> optional = userRepo.findByShortId(authorShortId);
        //System.out.println("[listByAuthorShortId] result = " + optional);

        User author = optional.orElseThrow(() -> new EntityNotFoundException("User not found with shortId: " + authorShortId));
        return listByAuthor(author.getUuid(), me, pageable);
    }

    // ====== 辅助：标记 reactions ======
    private void markReactions(List<PostSummaryDto> list, UUID me) {
        // unchanged
    }

    // ====== 工具：规范化标签 ======
    private String normalizeTag(String raw) {
        return raw == null ? "" : raw.trim().replace("#", "").toLowerCase();
    }

    // ====== 工具：幂等创建标签 ======
    private Tag getOrCreateTagWithRetry(String name) {
        return tagRepo.findByName(name).orElseGet(() -> {
            try {
                return tagRepo.save(Tag.builder().name(name).build());
            } catch (DataIntegrityViolationException e) {
                return tagRepo.findByName(name).orElseThrow(() -> e);
            }
        });
    }
}
