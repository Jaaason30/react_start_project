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
                @Index(name = "idx_text_user", columnList = "text,user_id"),
                @Index(name = "idx_text_user_style", columnList = "text,user_id,style_type")
        }
)
public class TextImageHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false, length = 100)
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
        // 设置创建时间
        createdAt = LocalDateTime.now();
        // 默认风格类型为渐变
        if (styleType == null) {
            styleType = 1;
        }
    }
}