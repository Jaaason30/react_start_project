package com.zusa.backend.dto.post;

import lombok.Data;

/**
 * 视频元数据DTO
 * 包含视频文件的基本信息
 */
@Data
public class VideoMetadataDto {
    /** 视频时长（秒） */
    private Integer durationSeconds;
    
    /** 视频宽度（像素） */
    private Integer width;
    
    /** 视频高度（像素） */
    private Integer height;
    
    /** 文件大小（字节） */
    private Long sizeBytes;
    
    /** MIME类型 */
    private String mimeType;
}