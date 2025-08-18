package com.zusa.backend.entity.post.texttoimage;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@Entity
@Table(
        name = "text_image_history",
        indexes = {
                @Index(name = "idx_user_id", columnList = "user_id"),
                // 如果确实需要按风格和用户查询历史，可以保留下面这条：
                @Index(name = "idx_user_style", columnList = "user_id,style_type")
        }
)
public class TextImageHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    /**
     * 用户输入的多行文本，允许换行
     */
    @Lob
    @Column(name = "text", columnDefinition = "TEXT", nullable = false)
    private String text;

    /**
     * 风格类型：1=渐变, 2=卡片, 3=创意
     */
    @Column(name = "style_type", nullable = false)
    private Integer styleType;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.styleType == null) {
            this.styleType = 1;
        }
    }
}
