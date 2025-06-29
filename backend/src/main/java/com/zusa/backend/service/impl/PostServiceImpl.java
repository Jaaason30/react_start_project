package com.zusa.backend.service.impl;

import com.zusa.backend.dto.post.*;
import com.zusa.backend.entity.User;
import com.zusa.backend.entity.post.*;
import com.zusa.backend.repository.*;
import com.zusa.backend.service.MediaService;
import com.zusa.backend.service.PostService;
import com.zusa.backend.service.mapper.PostMapper;
import com.zusa.backend.service.model.*;
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

    private final PostRepository      postRepo;
    private final UserRepository      userRepo;
    private final TagRepository       tagRepo;
    private final ReactionRepository  reactionRepo;
    private final PostMapper          mapper;
    private final MediaService mediaService;

    @Value("${app.post.official-emails}") private List<String> officialEmails;
    @Value("${app.post.max-images:9}")    private int   maxImages;

    @Override
    @Transactional(readOnly = true)
    public Page<PostSummaryDto> listFeed(FeedType type,
                                         UUID me,
                                         Pageable pageable) {

        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.Direction.DESC,
                    "createdAt");
        }

        Page<Post> entityPage = switch (type) {
            case OFFICIAL -> postRepo.findByAuthor_EmailInOrderByCreatedAtDesc(officialEmails, pageable);
            case FOLLOWED -> throw new UnsupportedOperationException("FOLLOWED feed 尚未实现");
            case USER     -> postRepo.findAllByOrderByCreatedAtDesc(pageable);
        };

        List<PostSummaryDto> dtoList = entityPage.getContent()
                .stream()
                .map(mapper::toSummary)
                .toList();

        if (me != null) markReactions(dtoList, me);

        return new PageImpl<>(dtoList, pageable, entityPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PostDetailDto getDetail(UUID postUuid, UUID me) {
        Post post = postRepo.findDetailByUuid(postUuid)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));

        System.out.println("[✅ Post Images]: " + post.getImages().size());

        PostDetailDto dto = mapper.toDetail(post);

        dto.setImages(
                post.getImages().stream()
                        .map(img -> {
                            PostImageDto d = new PostImageDto();
                            d.setUrl(img.getUrl());
                            d.setIdx(img.getIdx());
                            return d;
                        })
                        .collect(Collectors.toList())
        );

        dto.setTags(
                post.getTags().stream()
                        .map(t -> {
                            TagDto d = new TagDto();
                            d.setId(t.getId());
                            d.setName(t.getName());
                            return d;
                        })
                        .collect(Collectors.toSet())
        );

        if (me != null) {
            System.out.println("[🪐 DEBUG] Getting reactions for postUuid=" + postUuid + " userUuid=" + me);
            List<Reaction.Type> types = reactionRepo.findTypesByPostAndUser(postUuid, me);
            System.out.println("[🪐 DEBUG] Reaction types found: " + types);

            dto.setLikedByMe(types.contains(Reaction.Type.LIKE));
            dto.setCollectedByMe(types.contains(Reaction.Type.COLLECT));

            System.out.println("[🪐 DEBUG] dto.setLikedByMe: " + dto.isLikedByMe());
            System.out.println("[🪐 DEBUG] dto.setCollectedByMe: " + dto.isCollectedByMe());
        } else {
            System.out.println("[🪐 DEBUG] getDetail called with null userUuid");
        }

        return dto;
    }

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

        List<PostImage> images = new ArrayList<>(urls.size());
        for (int i = 0; i < urls.size(); i++) {
            images.add(PostImage.builder()
                    .idx(i)
                    .url(urls.get(i))
                    .build());
        }

        Set<Tag> tags = Optional.ofNullable(cmd.tagNames()).orElse(Set.of())
                .stream()
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

    @Override
    @Transactional
    public void editPost(EditPostCmd cmd, UUID operatorUuid) {
        Post post = postRepo.findByUuid(cmd.postUuid())
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));

        if (!post.getAuthor().getUuid().equals(operatorUuid)) {
            throw new SecurityException("No permission to edit this post");
        }

        if (cmd.title() != null) post.setTitle(cmd.title());
        if (cmd.content() != null) post.setContent(cmd.content());

        if (cmd.tagNames() != null) {
            Set<Tag> tags = cmd.tagNames().stream()
                    .map(this::normalizeTag)
                    .filter(s -> !s.isBlank())
                    .map(this::getOrCreateTagWithRetry)
                    .collect(Collectors.toSet());
            post.setTags(tags);
        }
    }

    @Override
    @Transactional
    public void deletePost(UUID postUuid, UUID operatorUuid) {
        Post post = postRepo.findByUuid(postUuid)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));

        if (!post.getAuthor().getUuid().equals(operatorUuid)) {
            throw new SecurityException("No permission to delete this post");
        }
        postRepo.delete(post);
    }

    private void markReactions(List<PostSummaryDto> list, UUID me) {
        if (list.isEmpty()) return;

        List<UUID> postIds = list.stream()
                .map(PostSummaryDto::getUuid)
                .toList();

        var reactions = reactionRepo.findAll(
                (root, q, cb) -> cb.and(
                        root.get("post").get("uuid").in(postIds),
                        cb.equal(root.get("user").get("uuid"), me)
                )
        );

        System.out.println("[🪐 DEBUG] markReactions found reactions: " + reactions);

        Set<UUID> liked = reactions.stream()
                .filter(r -> r.getType() == Reaction.Type.LIKE)
                .map(r -> r.getPost().getUuid())
                .collect(Collectors.toSet());

        Set<UUID> collected = reactions.stream()
                .filter(r -> r.getType() == Reaction.Type.COLLECT)
                .map(r -> r.getPost().getUuid())
                .collect(Collectors.toSet());

        list.forEach(dto -> {
            dto.setLikedByMe(liked.contains(dto.getUuid()));
            dto.setCollectedByMe(collected.contains(dto.getUuid()));
        });
    }

    private String normalizeTag(String raw) {
        return raw == null ? "" : raw.trim().replace("#", "").toLowerCase();
    }

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
