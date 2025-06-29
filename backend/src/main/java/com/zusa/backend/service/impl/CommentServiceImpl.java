package com.zusa.backend.service.impl;

import com.zusa.backend.dto.post.CommentDto;
import com.zusa.backend.entity.User;
import com.zusa.backend.entity.post.Comment;
import com.zusa.backend.entity.post.CommentLike;
import com.zusa.backend.repository.*;
import com.zusa.backend.service.CommentService;
import com.zusa.backend.service.mapper.CommentMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepo;
    private final CommentLikeRepository likeRepo;
    private final PostRepository postRepo;
    private final UserRepository userRepo;
    private final CommentMapper mapper;
    /* ---------------------- 获取单条评论详情 ---------------------- */
    @Override
    @Transactional(readOnly = true)
    public CommentDto get(UUID commentUuid) {
        Comment comment = commentRepo.findByUuid(commentUuid)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
        return mapper.toDto(comment);
    }

    /* ---------------------- 列表 ---------------------- */
    @Override
    @Transactional(readOnly = true)
    public Page<CommentDto> list(UUID postUuid,
                                 SortType sort,
                                 Pageable pageable) {

        Sort s = switch (sort) {
            case HOT -> Sort.by(Sort.Order.desc("likeCount"), Sort.Order.desc("createdAt"));
            case LATEST -> Sort.by(Sort.Order.desc("createdAt"));
        };
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), s);
        }

        Page<Comment> entityPage = commentRepo.findByPost_Uuid(postUuid, pageable);
        return entityPage.map(mapper::toDto);
    }

    /* ---------------------- 新增 ---------------------- */
    @Override
    @Transactional
    public CommentDto add(UUID postUuid,
                          UUID authorUuid,
                          String content) {

        if (content == null || content.isBlank() || content.length() > 500)
            throw new IllegalArgumentException("评论内容不能为空且不超过 500 字");

        var post = postRepo.findByUuid(postUuid)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        var author = userRepo.findByUuid(authorUuid)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Comment c = Comment.builder()
                .post(post)
                .author(author)
                .content(content.trim())
                .build();

        commentRepo.save(c);

        // 更新帖子统计
        post.setCommentCount(post.getCommentCount() + 1);

        return mapper.toDto(c);
    }

    /* ---------------------- 点赞 / 取消点赞 ---------------------- */
    @Override
    @Transactional
    public CommentDto toggleLike(UUID commentUuid,
                                 UUID userUuid) {

        // ✅ 修正查询逻辑，直接按 commentUuid 查询
        Comment comment = commentRepo.findByUuid(commentUuid)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));

        User user = userRepo.findByUuid(userUuid)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        var existed = likeRepo.findByComment_UuidAndUser_Uuid(commentUuid, userUuid);

        if (existed.isPresent()) {
            // 取消
            likeRepo.delete(existed.get());
            comment.setLikeCount(Math.max(0, comment.getLikeCount() - 1));
        } else {
            // 新增
            likeRepo.save(CommentLike.builder().comment(comment).user(user).build());
            comment.setLikeCount(comment.getLikeCount() + 1);
        }

        return mapper.toDto(comment);
    }
}
