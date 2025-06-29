package com.zusa.backend.entity.post;

import com.zusa.backend.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "post_images",
        indexes = @Index(columnList = "post_id,idx")
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PostImage extends BaseEntity {

    /** 顺序索引 */
    @Builder.Default
    @Column(nullable = false)
    private int idx = 0;

    /** 图片 URL */
    @Builder.Default
    @Column(nullable = false, length = 512)
    private String url = "";

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
}
