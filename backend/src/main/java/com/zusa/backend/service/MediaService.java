// src/main/java/com/zusa/backend/service/MediaService.java
package com.zusa.backend.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 统一的媒体存取接口 – 目前只实现图片。
 * 若需要音频 / 视频，可扩展 MIME 判断与存储路径即可。
 */
public interface MediaService {

    /** 上传单张图片，返回可公开访问的 URL */
    String uploadImage(MultipartFile file, String subDir);

    /** 批量上传，保持原顺序返回 URL 列表 */
    List<String> uploadImages(List<MultipartFile> files, String subDir);
}
