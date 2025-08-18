package com.zusa.backend.entity.post;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.zusa.backend.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * 帖子视频实体
 * 存储视频相关的元数据信息
 */
@Entity
@Table(
        name = "post_videos",
        indexes = {
                @Index(columnList = "uuid"),
                @Index(columnList = "post_id")
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PostVideo extends BaseEntity {

    /** 对外安全 UUID */
    @Builder.Default
    @Column(nullable = false, unique = true)
    private UUID uuid = UUID.randomUUID();

    /** 关联帖子 */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @JsonIgnore
    private Post post;

    /** 视频文件本地路径 */
    @Column(name = "video_path", nullable = false, length = 512)
    private String videoPath;

    /** 封面图片本地路径 */
    @Column(name = "cover_path", nullable = false, length = 512)
    private String coverPath;

    /** 视频时长（秒） */
    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds;

    /** 视频宽度（像素） */
    @Column(nullable = false)
    private Integer width;

    /** 视频高度（像素） */
    @Column(nullable = false)
    private Integer height;

    /** 文件大小（字节） */
    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    /** MIME类型 */
    @Column(name = "mime_type", nullable = false, length = 50)
    private String mimeType;
}