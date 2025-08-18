// src/main/java/com/zusa/backend/entity/post/Comment.java

package com.zusa.backend.entity.post;

import com.zusa.backend.entity.BaseEntity;
import com.zusa.backend.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "post_comments",
        indexes = {
                @Index(columnList = "post_id"),
                @Index(columnList = "author_id"),
                @Index(columnList = "parent_id"),
                @Index(columnList = "createdAt")
        }
)
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Comment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 对外安全 UUID */
    @Builder.Default
    @Column(nullable = false, updatable = false, unique = true)
    private UUID uuid = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Lob
    @Column(nullable = false)
    private String content;

    /** 父评论（被回复的评论） */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Comment parentComment;

    /** 被回复的用户（便于显示@某人） */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_to_user_id")
    private User replyToUser;

    /** 子评论列表 */
    @Builder.Default
    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> replies = new ArrayList<>();

    /** 回复数量 */
    @Column(nullable = false)
    @Builder.Default
    private long replyCount = 0L;

    /** 点赞数，可按最热排序 */
    @Column(nullable = false)
    @Builder.Default
    private long likeCount = 0L;

    /** 级联管理评论点赞 */
    @Builder.Default
    @OneToMany(
            mappedBy = "comment",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<CommentLike> likes = new ArrayList<>();

    /* === 审计字段 === */
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}