package com.zusa.backend.service.model;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Set;

/** 创建帖子用的命令对象，Controller 用 @Validated 校验 */
public record CreatePostCmd(
        String   title,
        String   content,
        List<MultipartFile> images,   // 0-9 张图片
        Set<String> tagNames          // #台球 #snooker
) {}
