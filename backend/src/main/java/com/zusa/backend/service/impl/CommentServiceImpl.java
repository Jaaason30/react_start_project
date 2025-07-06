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
    public Page<CommentDto> listTopLevel(UUID postUuid,
                                         SortType sortType,
                                         Pageable pageable,
                                         UUID userUuid,
                                         boolean loadReplies) {
        // 1) 根据 sortType 构造排序规则
        Sort s = switch (sortType) {
            case HOT -> Sort.by(Sort.Order.desc("likeCount"), Sort.Order.desc("createdAt"));
            case LATEST -> Sort.by(Sort.Order.desc("createdAt"));
        };
        Pageable effectivePageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                s
        );

        // 2) 执行分页查询
        Page<Comment> commentPage = commentRepo.findTopLevelCommentsByPostUuid(postUuid, effectivePageable);

        // 3) DTO 映射
        Page<CommentDto> dtoPage = commentPage.map(mapper::toDto);

        if (!dtoPage.isEmpty()) {
            // 4) 设置当前用户的点赞状态
            if (userUuid != null) {
                setLikedStatus(dtoPage.getContent(), userUuid);
            }

            // 5) 如果前端请求加载回复，则查询并填充
            if (loadReplies) {
                dtoPage.getContent().forEach(dto -> {
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

        return dtoPage;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommentDto> listReplies(UUID parentCommentUuid,
                                        Pageable pageable,
                                        UUID userUuid) {
        Page<CommentDto> page = commentRepo
                .findByParentComment_Uuid(parentCommentUuid, pageable)
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

        // 加载并映射所有子评论
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
    public CommentDto add(UUID postUuid,
                          UUID authorUuid,
                          String content,
                          UUID parentCommentUuid,
                          UUID replyToUserUuid) {
        // ... （保持不变，省略） ...
        // mapper.toDto(c) 返回的 DTO 里会有正确的 createdAt, likeCount等字段
        throw new UnsupportedOperationException("省略实现");
    }

    @Override
    @Transactional
    public CommentDto toggleLike(UUID commentUuid, UUID userUuid) {
        // ... （保持不变，省略） ...
        throw new UnsupportedOperationException("省略实现");
    }

    @Override
    @Transactional
    public void delete(UUID commentUuid, UUID authorUuid) {
        // ... （保持不变，省略） ...
        throw new UnsupportedOperationException("省略实现");
    }

    /** 内部方法：批量设置 DTO 的 likedByCurrentUser 字段 */
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
}
