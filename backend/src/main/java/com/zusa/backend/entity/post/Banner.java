package com.zusa.backend.entity.post;

import com.zusa.backend.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "banners",
        indexes = @Index(columnList = "enabled,sortOrder")
)
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Banner extends BaseEntity {

    /** 图片地址 */
    @Column(nullable = false, length = 512)
    private String imageUrl;

    /** 点击链接 */
    @Column(length = 512)
    private String linkUrl;

    /** 排序 */
    @Builder.Default
    private int sortOrder = 0;

    /** 是否启用 */
    @Builder.Default
    private boolean enabled = true;

    /** 定时上线下线 */
    private LocalDateTime startAt;
    private LocalDateTime endAt;

    /* === 审计字段 === (继承自 BaseEntity) === */
}
