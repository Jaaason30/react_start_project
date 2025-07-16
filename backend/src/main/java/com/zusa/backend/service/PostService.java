package com.zusa.backend.service;

import com.zusa.backend.dto.post.PostDetailDto;
import com.zusa.backend.dto.post.PostSummaryDto;
import com.zusa.backend.service.model.CreatePostCmd;
import com.zusa.backend.service.model.EditPostCmd;
import com.zusa.backend.service.model.FeedType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PostService {

    /** Feed 列表 */
    Page<PostSummaryDto> listFeed(FeedType type,
                                  UUID currentUserUuid,
                                  Pageable pageable);

    /** 详情 */
    PostDetailDto getDetail(UUID postUuid, UUID currentUserUuid);

    /** 创建帖子，返回帖子的外部 UUID */
    UUID createPost(CreatePostCmd cmd, UUID authorUuid);

    /** 编辑（仅作者 / 管理员） */
    void editPost(EditPostCmd cmd, UUID authorUuid);

    /** 删除（仅作者 / 管理员） */
    void deletePost(UUID postUuid, UUID operatorUuid);

    /**
     * 按标签名分页查询帖子摘要
     *
     * @param tagName         标签名称
     * @param currentUserUuid 当前登录用户 UUID（可为 null）
     * @param pageable        分页和排序参数
     * @return 带标签筛选的帖子摘要页
     */
    Page<PostSummaryDto> listByTag(String tagName,
                                   UUID currentUserUuid,
                                   Pageable pageable);

    /**
     * 全文搜索帖子摘要（标题 / 正文 / 标签）
     *
     * @param keyword         搜索关键词
     * @param currentUserUuid 当前登录用户 UUID（可 null）
     * @param pageable        分页 + 排序
     * @return 搜索结果分页
     */
    Page<PostSummaryDto> search(String keyword,
                                UUID currentUserUuid,
                                Pageable pageable);

    /**
     * 按作者查询帖子
     *
     * @param authorUuid      作者的 UUID
     * @param currentUserUuid 当前登录用户 UUID（可为 null）
     * @param pageable        分页参数
     * @return 该作者的帖子摘要分页
     */
    Page<PostSummaryDto> listByAuthor(UUID authorUuid,
                                      UUID currentUserUuid,
                                      Pageable pageable);

    /**
     * 按作者 shortId 查询帖子
     *
     * @param authorShortId   作者的 shortId
     * @param currentUserUuid 当前登录用户 UUID（可为 null）
     * @param pageable        分页参数
     * @return 该作者的帖子摘要分页
     */
    Page<PostSummaryDto> listByAuthorShortId(Long authorShortId,
                                             UUID currentUserUuid,
                                             Pageable pageable);
}