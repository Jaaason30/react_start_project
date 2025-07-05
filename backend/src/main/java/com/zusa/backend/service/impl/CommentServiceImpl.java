// src/main/java/com/zusa/backend/service/impl/CommentServiceImpl.java
package com.zusa.backend.service.impl;

import com.zusa.backend.dto.post.CommentDto;
import com.zusa.backend.entity.post.Comment;
import com.zusa.backend.entity.post.CommentLike;
import com.zusa.backend.entity.User;
import com.zusa.backend.repository.CommentLikeRepository;
import com.zusa.backend.repository.CommentRepository;
import com.zusa.backend.repository.PostRepository;
import com.zusa.backend.repository.UserRepository;
import com.zusa.backend.service.CommentService;
import com.zusa.backend.service.mapper.CommentMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepo;
    private final CommentLikeRepository likeRepo;
    private final PostRepository postRepo;
    private final UserRepository userRepo;
    private final CommentMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public Page<CommentDto> listTopLevel(UUID postUuid, SortType sortType, Pageable pageable, UUID userUuid, boolean loadReplies) {
        Sort s = switch (sortType) {
            case HOT -> Sort.by(Sort.Order.desc("likeCount"), Sort.Order.desc("createdAt"));
            case LATEST -> Sort.by(Sort.Order.desc("createdAt"));
        };
        Pageable pr = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), s);
        Page<CommentDto> page = commentRepo.findTopLevelCommentsByPostUuid(postUuid, pr)
                .map(mapper::toDto);

        if (!page.isEmpty()) {
            // 设置点赞状态
            if (userUuid != null) {
                setLikedStatus(page.getContent(), userUuid);
            }

            // 加载回复（如果需要）
            if (loadReplies) {
                page.getContent().forEach(dto -> {
                    List<Comment> replies = commentRepo.findByParentComment_UuidOrderByCreatedAtAsc(dto.getUuid());
                    List<CommentDto> replyDtos = replies.stream()
                            .map(mapper::toDto)
                            .collect(Collectors.toList());

                    if (userUuid != null && !replyDtos.isEmpty()) {
                        setLikedStatus(replyDtos, userUuid);
                    }

                    dto.setReplies(replyDtos);
                });
            }
        }

        return page;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommentDto> listReplies(UUID parentCommentUuid, Pageable pageable, UUID userUuid) {
        Page<CommentDto> page = commentRepo.findByParentComment_Uuid(parentCommentUuid, pageable)
                .map(mapper::toDto);

        if (userUuid != null && !page.isEmpty()) {
            setLikedStatus(page.getContent(), userUuid);
        }

        return page;
    }

    @Override
    @Transactional(readOnly = true)
    public CommentDto get(UUID commentUuid, UUID userUuid) {
        Comment c = commentRepo.findByUuid(commentUuid)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
        CommentDto dto = mapper.toDto(c);

        if (userUuid != null) {
            boolean liked = likeRepo.findByComment_UuidAndUser_Uuid(commentUuid, userUuid).isPresent();
            dto.setLikedByCurrentUser(liked);
        }

        // 加载回复
        List<Comment> replies = commentRepo.findByParentComment_UuidOrderByCreatedAtAsc(commentUuid);
        List<CommentDto> replyDtos = replies.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());

        if (userUuid != null && !replyDtos.isEmpty()) {
            setLikedStatus(replyDtos, userUuid);
        }

        dto.setReplies(replyDtos);

        return dto;
    }

    @Override
    @Transactional
    public CommentDto add(UUID postUuid, UUID authorUuid, String content, UUID parentCommentUuid, UUID replyToUserUuid) {
        if (content == null || content.isBlank() || content.length() > 500) {
            throw new IllegalArgumentException("评论内容不能为空且不超过 500 字");
        }

        var post = postRepo.findByUuid(postUuid)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));
        var author = userRepo.findByUuid(authorUuid)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Comment.CommentBuilder builder = Comment.builder()
                .post(post)
                .author(author)
                .content(content.trim());

        // 如果是回复
        if (parentCommentUuid != null) {
            Comment parentComment = commentRepo.findByUuid(parentCommentUuid)
                    .orElseThrow(() -> new EntityNotFoundException("Parent comment not found"));

            // 确保父评论属于同一个帖子
            if (!parentComment.getPost().getUuid().equals(postUuid)) {
                throw new IllegalArgumentException("父评论不属于该帖子");
            }

            builder.parentComment(parentComment);

            // 更新父评论的回复数
            parentComment.setReplyCount(parentComment.getReplyCount() + 1);

            // 如果指定了被回复的用户
            if (replyToUserUuid != null) {
                User replyToUser = userRepo.findByUuid(replyToUserUuid)
                        .orElseThrow(() -> new EntityNotFoundException("Reply to user not found"));
                builder.replyToUser(replyToUser);
            }
        }

        Comment c = builder.build();
        commentRepo.save(c);

        // 更新帖子评论数
        post.setCommentCount(post.getCommentCount() + 1);

        return mapper.toDto(c);
    }

    @Override
    @Transactional
    public CommentDto toggleLike(UUID commentUuid, UUID userUuid) {
        Comment c = commentRepo.findByUuid(commentUuid)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
        User u = userRepo.findByUuid(userUuid)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Optional<CommentLike> exist = likeRepo.findByComment_UuidAndUser_Uuid(commentUuid, userUuid);
        if (exist.isPresent()) {
            likeRepo.delete(exist.get());
            c.setLikeCount(Math.max(0, c.getLikeCount() - 1));
        } else {
            likeRepo.save(CommentLike.builder().comment(c).user(u).build());
            c.setLikeCount(c.getLikeCount() + 1);
        }

        CommentDto dto = mapper.toDto(c);
        dto.setLikedByCurrentUser(!exist.isPresent());
        return dto;
    }

    @Override
    @Transactional
    public void delete(UUID commentUuid, UUID authorUuid) {
        Comment c = commentRepo.findByUuid(commentUuid)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));

        if (!c.getAuthor().getUuid().equals(authorUuid)) {
            throw new SecurityException("只能删除自己的评论");
        }

        var post = c.getPost();

        // 计算要删除的评论总数（包括所有子评论）
        long totalToDelete = 1 + countAllReplies(c);

        // 如果是子评论，更新父评论的回复数
        if (c.getParentComment() != null) {
            Comment parent = c.getParentComment();
            parent.setReplyCount(Math.max(0, parent.getReplyCount() - 1));
        }

        // 删除评论（会级联删除所有子评论）
        commentRepo.delete(c);

        // 更新帖子评论数
        post.setCommentCount(Math.max(0, post.getCommentCount() - totalToDelete));
    }

    private void setLikedStatus(List<CommentDto> comments, UUID userUuid) {
        List<UUID> ids = comments.stream()
                .map(CommentDto::getUuid)
                .collect(Collectors.toList());

        Set<UUID> likedSet = likeRepo
                .findAllByUser_UuidAndComment_UuidIn(userUuid, ids)
                .stream()
                .map(cl -> cl.getComment().getUuid())
                .collect(Collectors.toSet());

        comments.forEach(dto -> dto.setLikedByCurrentUser(likedSet.contains(dto.getUuid())));
    }

    private long countAllReplies(Comment comment) {
        long count = comment.getReplies().size();
        for (Comment reply : comment.getReplies()) {
            count += countAllReplies(reply);
        }
        return count;
    }
}