package com.zusa.backend.entity.user;

import com.zusa.backend.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * 实体：表示用户之间的关注关系
 */
@Entity
@Table(name = "follows", uniqueConstraints = @UniqueConstraint(columnNames = {"follower_id", "target_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 关注者
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    /**
     * 被关注的用户
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "target_id", nullable = false)
    private User target;

    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * 便捷构造函数：只需传 follower 与 target
     */
    public Follow(User follower, User target) {
        this.follower = follower;
        this.target = target;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
