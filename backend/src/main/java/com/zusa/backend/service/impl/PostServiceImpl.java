package com.zusa.backend.service.impl;

import com.zusa.backend.dto.post.*;
import com.zusa.backend.entity.User;
import com.zusa.backend.entity.post.*;
import com.zusa.backend.repository.PostRepository;
import com.zusa.backend.repository.PostVideoRepository;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostServiceImpl implements PostService {

    private final PostRepository     postRepo;
    private final UserRepository     userRepo;
    private final TagRepository      tagRepo;
    private final ReactionRepository reactionRepo;
    private final PostVideoRepository postVideoRepo; // [VIDEO-SAVE] 新增
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
        return listFeed(type, null, me, pageable); // 调用扩展方法，mediaType为null表示所有类型
    }

    // [VIDEO-SAVE] 开始 - 支持媒体类型筛选的Feed
    @Override
    @Transactional(readOnly = true)
    public Page<PostSummaryDto> listFeed(FeedType type, MediaType mediaType, UUID me, Pageable pageable) {
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.Direction.DESC, "createdAt");
        }

        Page<Post> page = switch (type) {
            case OFFICIAL -> {
                if (mediaType == null) {
                    yield postRepo.findByAuthor_EmailInOrderByCreatedAtDesc(officialEmails, pageable);
                } else {
                    yield postRepo.findByMediaTypeAndAuthor_EmailInOrderByCreatedAtDesc(mediaType, officialEmails, pageable);
                }
            }
            case FOLLOWED -> throw new UnsupportedOperationException("FOLLOWED feed 尚未实现");
            case USER -> {
                if (mediaType == null) {
                    yield postRepo.findAllByOrderByCreatedAtDesc(pageable);
                } else {
                    yield postRepo.findByMediaTypeOrderByCreatedAtDesc(mediaType, pageable);
                }
            }
        };

        return toSummaryPage(page, me);
    }
    // [VIDEO-SAVE] 结束

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

        // 4.5) 填充视频URL（如果是视频帖子）
        if (post.getVideo() != null) {
            dto.setVideoUrl(mediaService.getVideoUrl(post.getVideo()));
            dto.setVideoCoverUrl(mediaService.getVideoCoverUrl(post.getVideo()));
        }

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

        // [VIDEO-SAVE] 开始 - 验证媒体内容
        MediaType mediaType = Optional.ofNullable(cmd.mediaType()).orElse(MediaType.IMAGE);
        
        if (mediaType == MediaType.IMAGE) {
            if (cmd.images() == null || cmd.images().isEmpty()) {
                throw new IllegalArgumentException("图片帖子必须上传至少一张图片");
            }
            if (cmd.images().size() > maxImages) {
                throw new IllegalArgumentException("最多只能上传 " + maxImages + " 张图片");
            }
            if (cmd.video() != null || cmd.videoCover() != null) {
                throw new IllegalArgumentException("图片帖子不能包含视频文件");
            }
        } else if (mediaType == MediaType.VIDEO) {
            if (cmd.video() == null || cmd.video().isEmpty()) {
                throw new IllegalArgumentException("视频帖子必须上传视频文件");
            }
            if (cmd.videoCover() == null || cmd.videoCover().isEmpty()) {
                throw new IllegalArgumentException("视频帖子必须上传封面图");
            }
            if (cmd.images() != null && !cmd.images().isEmpty()) {
                throw new IllegalArgumentException("视频帖子不能包含图片文件");
            }
        }

        // 处理标签
        Set<Tag> tags = Optional.ofNullable(cmd.tagNames()).orElse(Set.of()).stream()
                .map(this::normalizeTag)
                .filter(s -> !s.isBlank())
                .map(this::getOrCreateTagWithRetry)
                .collect(Collectors.toSet());

        // 创建帖子实体
        Post post = Post.builder()
                .author(author)
                .title(cmd.title())
                .content(cmd.content())
                .mediaType(mediaType)
                .tags(tags)
                .build();

        if (mediaType == MediaType.IMAGE) {
            // 处理图片
            List<String> urls = mediaService.uploadImages(cmd.images(), "post");
            List<PostImage> images = new ArrayList<>();
            for (int i = 0; i < urls.size(); i++) {
                images.add(PostImage.builder().idx(i).url(urls.get(i)).build());
            }
            post.setCoverUrl(urls.get(0));
            post.setImages(images);
            images.forEach(img -> img.setPost(post));
        } else if (mediaType == MediaType.VIDEO) {
            // 处理视频
            String videoPath = mediaService.uploadVideo(cmd.video(), "video");
            VideoMetadataDto metadata = mediaService.extractVideoMetadata(videoPath);
            
            // 生成真正的视频封面（从视频第一帧提取）
            String coverPath;
            try {
                log.info("开始为视频生成封面: {}", videoPath);
                coverPath = mediaService.generateVideoCover(videoPath, "video");
                log.info("视频封面生成成功: {}", coverPath);
            } catch (Exception e) {
                log.error("视频封面生成失败，使用用户上传的封面: {}", e.getMessage());
                // 如果自动生成失败，使用用户上传的封面作为备用
                coverPath = mediaService.uploadImage(cmd.videoCover(), "video");
            }
            
            PostVideo postVideo = PostVideo.builder()
                    .post(post)
                    .videoPath(videoPath)
                    .coverPath(coverPath)
                    .durationSeconds(metadata.getDurationSeconds())
                    .width(metadata.getWidth())
                    .height(metadata.getHeight())
                    .sizeBytes(metadata.getSizeBytes())
                    .mimeType(metadata.getMimeType())
                    .build();
            
            post.setVideo(postVideo);
            post.setCoverUrl(coverPath); // 视频帖子的封面使用视频封面
        }

        postRepo.saveAndFlush(post);
        return post.getUuid();
    }
    // [VIDEO-SAVE] 结束

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
<<<<<<< HEAD
        Post post = postRepo.findByUuid(postUuid)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        if (!post.getAuthor().getUuid().equals(operatorUuid)) {
            throw new SecurityException("无权删除此帖");
        }
        postRepo.delete(post);
=======
        // 先验证权限
        Long postId = postRepo.findPostIdAndAuthorByUuid(postUuid, operatorUuid)
                .orElseThrow(() -> {
                    // 尝试查找帖子是否存在
                    if (!postRepo.existsByUuid(postUuid)) {
                        return new EntityNotFoundException("Post not found");
                    }
                    return new SecurityException("无权删除此帖");
                });
        
        // 直接使用原生SQL删除，避免JPA乐观锁问题
        // 1. 先删除最底层的关联表
        postRepo.deletePostCommentsByPostId(postId);
        postRepo.deletePostReactionsByPostId(postId);
        postRepo.deletePostTagsByPostId(postId);
        
        // 2. 删除媒体相关的表
        // 先删除 media_file_videos 表中的记录（如果存在）
        postRepo.deleteMediaFileVideosByPostId(postId);
        // 再删除 media_files 表记录（如果存在旧表结构）
        postRepo.deleteMediaFilesByPostId(postId);
        
        // 3. 删除帖子的图片和视频
        postRepo.deletePostImagesByPostId(postId);
        postRepo.deletePostVideosByPostId(postId);
        
        // 4. 最后使用原生SQL删除帖子本身
        postRepo.deletePostByIdNative(postId);
>>>>>>> c99daa6 (Initial commit - Clean project state)
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
