package com.zusa.backend.entity.post;

import com.zusa.backend.entity.BaseEntity;
import com.zusa.backend.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.*;

@Entity
@Table(
        name = "posts",
        indexes = {
                @Index(columnList = "author_id"),
                @Index(columnList = "createdAt")
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Post extends BaseEntity {

    /** 对外安全 UUID */
    @Builder.Default
    @Column(nullable = false, updatable = false, unique = true)
    private UUID uuid = UUID.randomUUID();

    /** 发帖人 */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    /** 封面图 URL */
    @Column(length = 512)
    private String coverUrl;

    /** 标题 */
    @Column(nullable = false, length = 120)
    private String title;

    /** 正文 */
    @Lob
    @Column(nullable = false)
    private String content;

    /** 关联标签 */
    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "post_tags",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    /** 统计字段 */
    @Column(nullable = false) private long likeCount    = 0;
    @Column(nullable = false) private long collectCount = 0;
    @Column(nullable = false) private long commentCount = 0;

    /** 帖子图片顺序 */
    @Builder.Default
    @OneToMany(
            mappedBy = "post",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @OrderBy("idx ASC")
    private List<PostImage> images = new ArrayList<>();

    /** 可选：级联删除评论 */
    @Builder.Default
    @OneToMany(
            mappedBy = "post",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<Comment> comments = new ArrayList<>();

    /** 可选：级联删除点赞/收藏记录 */
    @Builder.Default
    @OneToMany(
            mappedBy = "post",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<Reaction> reactions = new ArrayList<>();
}
