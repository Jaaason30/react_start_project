-- V002__add_video_support.sql
-- 添加视频帖子支持：媒体类型字段 + 视频表 + 优化索引

-- 1. 为posts表添加媒体类型字段
ALTER TABLE posts 
ADD COLUMN media_type VARCHAR(10) NOT NULL DEFAULT 'IMAGE' 
COMMENT '媒体类型：IMAGE(图片) 或 VIDEO(视频)';

-- 2. 创建视频元数据表
CREATE TABLE post_videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    uuid CHAR(36) NOT NULL UNIQUE COMMENT '对外UUID',
    post_id BIGINT NOT NULL COMMENT '关联帖子ID',
    video_path VARCHAR(512) NOT NULL COMMENT '视频文件本地路径',
    cover_path VARCHAR(512) NOT NULL COMMENT '封面图片本地路径',
    duration_seconds INT NOT NULL COMMENT '视频时长（秒）',
    width INT NOT NULL COMMENT '视频宽度（像素）',
    height INT NOT NULL COMMENT '视频高度（像素）',
    size_bytes BIGINT NOT NULL COMMENT '文件大小（字节）',
    mime_type VARCHAR(50) NOT NULL COMMENT 'MIME类型（如video/mp4）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 外键约束
    CONSTRAINT fk_post_videos_post_id 
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    
    -- 基础索引
    INDEX idx_post_videos_uuid (uuid) COMMENT 'UUID查询索引',
    INDEX idx_post_videos_post_id (post_id) COMMENT '帖子关联索引',
    
    -- 业务约束
    CONSTRAINT chk_duration_positive CHECK (duration_seconds > 0),
    CONSTRAINT chk_dimensions_positive CHECK (width > 0 AND height > 0),
    CONSTRAINT chk_size_positive CHECK (size_bytes > 0),
    CONSTRAINT chk_video_size_limit CHECK (size_bytes <= 104857600), -- 100MB
    CONSTRAINT chk_duration_limit CHECK (duration_seconds <= 300) -- 5分钟
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帖子视频元数据表';

-- 3. 为posts表添加组合索引（支持按媒体类型分页查询）
CREATE INDEX idx_posts_media_type_created 
ON posts(media_type, created_at DESC) 
COMMENT '媒体类型+创建时间组合索引，支持分类Feed查询';

-- 4. 为posts表添加作者+媒体类型索引（支持用户个人页面按类型筛选）
CREATE INDEX idx_posts_author_media_created 
ON posts(author_id, media_type, created_at DESC) 
COMMENT '作者+媒体类型+时间索引，支持个人页媒体筛选';

-- 5. 数据完整性验证约束
-- 注意：MySQL不支持CHECK约束引用其他表，这部分逻辑需在应用层实现
-- 业务规则：mediaType=VIDEO时必须有对应post_videos记录
-- 业务规则：mediaType=IMAGE时不能有post_videos记录

/*
回滚思路（生产环境谨慎操作）：
1. 删除新增索引：
   DROP INDEX idx_posts_media_type_created ON posts;
   DROP INDEX idx_posts_author_media_created ON posts;

2. 删除视频表（CASCADE会自动清理外键约束）：
   DROP TABLE post_videos;

3. 删除媒体类型字段：
   ALTER TABLE posts DROP COLUMN media_type;

注意事项：
- 回滚前需确认无视频帖子数据，或做好数据备份
- 如有视频帖子，回滚会导致数据丢失
- 建议先在测试环境验证回滚脚本
*/

-- 验证脚本（可选执行）
-- SELECT 
--     COUNT(*) as total_posts,
--     SUM(CASE WHEN media_type = 'IMAGE' THEN 1 ELSE 0 END) as image_posts,
--     SUM(CASE WHEN media_type = 'VIDEO' THEN 1 ELSE 0 END) as video_posts
-- FROM posts;