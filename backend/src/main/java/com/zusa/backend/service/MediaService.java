// src/main/java/com/zusa/backend/service/MediaService.java
package com.zusa.backend.service;

import com.zusa.backend.dto.post.VideoMetadataDto;
import com.zusa.backend.entity.post.PostVideo;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * 统一的媒体存取接口 – 支持图片和视频
 */
public interface MediaService {

    /** 上传单张图片，返回可公开访问的 URL */
    String uploadImage(MultipartFile file, String subDir);

    /** 批量上传，保持原顺序返回 URL 列表 */
    List<String> uploadImages(List<MultipartFile> files, String subDir);
    
    // [VIDEO-METHODS] 开始
    /** 上传视频文件，返回本地存储路径 */
    String uploadVideo(MultipartFile file, String subDir);
    
    /** 从视频文件提取元数据 */
    VideoMetadataDto extractVideoMetadata(String videoPath);
    
    /** 流式传输媒体文件（支持Range请求） */
    void streamMedia(UUID mediaUuid, HttpServletResponse response);
    
    /** 根据PostVideo实体生成访问URL */
    String getVideoUrl(PostVideo postVideo);
    
    /** 根据PostVideo实体生成封面URL */
    String getVideoCoverUrl(PostVideo postVideo);
    
    /** 从视频文件生成封面图片 */
    String generateVideoCover(String videoPath, String subDir);
    // [VIDEO-METHODS] 结束
}
