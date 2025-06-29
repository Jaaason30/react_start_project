// src/main/java/com/zusa/backend/service/TagService.java
package com.zusa.backend.service;

import com.zusa.backend.dto.post.TagDto;

import java.util.List;

public interface TagService {

    /** 自动补全：按关键字匹配，返回 name 升序 */
    List<TagDto> suggest(String keyword, int limit);

    /** 热门标签：按帖子引用次数倒序 */
    List<TagDto> hot(int limit);

    /** 规范化 + 去重后，如不存在则创建并返回 */
    TagDto createIfAbsent(String rawName);
}
