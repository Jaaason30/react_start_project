package com.zusa.backend.service.model;

import com.zusa.backend.entity.post.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Set;

/** 创建帖子用的命令对象，Controller 用 @Validated 校验 */
public record CreatePostCmd(
        String   title,
        String   content,
        MediaType mediaType,              // [VIDEO-SAVE] 媒体类型
        List<MultipartFile> images,       // 0-9 张图片（仅当mediaType=IMAGE）
        MultipartFile video,              // [VIDEO-SAVE] 视频文件（仅当mediaType=VIDEO）
        MultipartFile videoCover,         // [VIDEO-SAVE] 视频封面（仅当mediaType=VIDEO）
        Set<String> tagNames              // #台球 #snooker
) {}
