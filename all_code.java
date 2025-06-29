// src/main/java/com/zusa/backend/entity/BaseEntity.java
package com.zusa.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import lombok.Getter;
import lombok.Setter;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
public abstract class BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** JPA 自动填充创建时间 */
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** JPA 自动填充更新时间 */
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
package com.zusa.backend.entity;

import com.zusa.backend.entity.user.*;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name = "users")
@Getter @Setter @NoArgsConstructor
public class User {

    /** 业务无关的技术主键（自增） */
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 业务层推荐使用的公钥，避免泄露自增 id */
    @Column(nullable = false, updatable = false, unique = true)
    private UUID uuid = UUID.randomUUID();

    /** 账号字段 —— 注册 & 登录 */
    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(nullable = false)
    private String password;   // 先留明文列，实际存 bcrypt

    /** 基础资料 */
    private String nickname;
    private LocalDate dateOfBirth;

    /** 关系字段 */
    @ManyToOne(fetch = FetchType.LAZY)
    private Gender gender;                     // 性别

    @ManyToOne(fetch = FetchType.LAZY)
    private UserIntention intention;           // 交友意向

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private UserProfilePicture profilePicture; // 头像

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private UserDates dates = new UserDates(); // 创建 / 活跃时间

    /** 统计字段 —— 后期可用「点赞表」替代，这里直接存计数满足 MVP */
    private int likes = 0;

    /** 内部工具方法：计算年龄（按生日） */
    public int getAge() {
        return dateOfBirth == null ? 0
                : LocalDate.now().getYear() - dateOfBirth.getYear();
    }
}
package com.zusa.backend.entity.post;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 首页横幅 / 轮播图
 */
@Entity
@Table(name = "banners",
        indexes = @Index(columnList = "enabled,sortOrder"))
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Banner {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 图片地址（将来可迁移到对象存储） */
    @Column(nullable = false, length = 512)
    private String imageUrl;

    /** 点击后跳转的链接（可为空） */
    @Column(length = 512)
    private String linkUrl;

    /** 排序字段：数字越小越靠前 */
    private int sortOrder = 0;

    /** 是否启用 */
    private boolean enabled = true;

    /** 定时上线下线，可选 */
    private LocalDateTime startAt;
    private LocalDateTime endAt;

    /* === 审计字段 === */
    @CreatedDate  @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
package com.zusa.backend.entity.post;

import com.zusa.backend.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 帖子评论
 */
@Entity
@Table(name = "post_comments",
        indexes = {
                @Index(columnList = "post_id"),
                @Index(columnList = "author_id"),
                @Index(columnList = "createdAt")
        })
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Comment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 外部安全 ID（避免暴露自增） */
    @Column(nullable = false, updatable = false, unique = true)
    private UUID uuid = UUID.randomUUID();

    /** 所属帖子 */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Post post;

    /** 评论作者 */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User author;

    /** 评论正文 */
    @Lob @Column(nullable = false)
    private String content;

    /** 点赞数，可用于最热评论排序 */
    private long likeCount = 0;

    /* === 审计字段 === */
    @CreatedDate  @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
package com.zusa.backend.entity.post;

import com.zusa.backend.entity.BaseEntity;
import com.zusa.backend.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.*;

@Entity
@Table(name = "posts",
        indexes = {
                @Index(columnList = "author_id"),
                @Index(columnList = "createdAt")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Post extends BaseEntity {

    @Column(nullable = false, updatable = false, unique = true)
    private UUID uuid = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(length = 512)
    private String coverUrl;

    @Column(nullable = false, length = 120)
    private String title;

    @Lob @Column(nullable = false)
    private String content;

    // —— 新增的标签关联 ——
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "post_tags",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"),
            indexes = @Index(columnList = "post_id,tag_id"))
    private Set<Tag> tags = new HashSet<>();

    @Column(nullable = false) private long likeCount    = 0;
    @Column(nullable = false) private long collectCount = 0;
    @Column(nullable = false) private long commentCount = 0;

    @OneToMany(mappedBy = "post",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    @OrderBy("idx ASC")
    private List<PostImage> images = new ArrayList<>();
}
// src/main/java/com/zusa/backend/entity/post/PostImage.java
package com.zusa.backend.entity.post;

import com.zusa.backend.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "post_images",
        indexes = {
                @Index(columnList = "post_id, idx")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PostImage extends BaseEntity {

    /** 顺序索引，用于轮播或瀑布流按顺序展示 */
    @Column(nullable = false)
    private int idx;

    /** 外部 URL；后续如改对象存储只需替换此字段内容 */
    @Column(nullable = false, length = 512)
    private String url;

    /** 所属帖子 */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
}
package com.zusa.backend.entity.post;

import com.zusa.backend.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "post_reactions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"post_id","user_id","type"}))
@Getter @Setter @NoArgsConstructor
public class Reaction {

    public enum Type { LIKE, COLLECT }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Type type;
}
package com.zusa.backend.entity.post;

import com.zusa.backend.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "tags",
        uniqueConstraints = @UniqueConstraint(columnNames = "name"),
        indexes = @Index(columnList = "name")
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Tag extends BaseEntity {

    /** 标签名称（唯一） */
    @Column(nullable = false, length = 64, unique = true)
    private String name;
}
package com.zusa.backend.entity.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor
public class Gender {

    public static final long MALE   = 1L;
    public static final long FEMALE = 2L;
    public static final long OTHER  = 3L;

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String text;    // "male" / "female" / "other"
}
package com.zusa.backend.entity.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor
public class UserDates {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime lastActiveAt = LocalDateTime.now();
}
package com.zusa.backend.entity.user;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Getter @Setter @NoArgsConstructor
public class UserProfilePicture {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private UUID uuid = UUID.randomUUID();            // 方便前端拉取

    @Lob @Basic(fetch = FetchType.LAZY)
    private byte[] data;                              // WEBP / JPG

    @Column(length = 40)
    private String mime;                              // image/webp
}
