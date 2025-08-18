 广场视频帖子 MVP 规划

  1. 数据结构与接口契约

  OpenAPI 3.0 契约片段

  paths:
    /api/posts:
<<<<<<< HEAD
=======
    
    
    
>>>>>>> c99daa6 (Initial commit - Clean project state)
      post:
        summary: 创建帖子（支持视频）
        requestBody:
          content:
<<<<<<< HEAD
            multipart/form-data:
=======
            multipart/form-data:   
>>>>>>> c99daa6 (Initial commit - Clean project state)
              schema:
                type: object
                properties:
                  title:
                    type: string
                    maxLength: 120
                  content:
                    type: string
                  mediaType:
                    type: string
                    enum: [IMAGE, VIDEO]
                    default: IMAGE
                  images:
                    type: array
                    items:
                      type: string
                      format: binary
                    maxItems: 9
                  video:
                    type: string
                    format: binary
                    description: 视频文件(与images互斥)
                  videoCover:
                    type: string
                    format: binary
                    description: 视频封面
                required: [title, content, mediaType]
        responses:
          201:
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/PostDetailDto'

    /api/posts/feed:
      get:
        parameters:
          - name: mediaType
            in: query
            schema:
              type: string
              enum: [ALL, IMAGE, VIDEO]
              default: ALL
        responses:
          200:
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    content:
                      type: array
                      items:
                        $ref: '#/components/schemas/PostSummaryDto'

    /api/media/{id}:
      get:
        summary: 获取媒体文件
        parameters:
          - name: id
            in: path
            required: true
            schema:
              type: string
              format: uuid
        responses:
          200:
            content:
              video/mp4:
                schema:
                  type: string
                  format: binary
              image/*:
                schema:
                  type: string
                  format: binary

  components:
    schemas:
      PostSummaryDto:
        properties:
          uuid:
            type: string
          mediaType:
            type: string
            enum: [IMAGE, VIDEO]
          coverUrl:
            type: string
            description: 图片帖首图或视频封面
          videoMetadata:
            $ref: '#/components/schemas/VideoMetadata'
          # ... 原有字段

      PostDetailDto:
        properties:
          mediaType:
            type: string
            enum: [IMAGE, VIDEO]
          images:
            type: array
            items:
              type: string
          videoUrl:
            type: string
          videoCoverUrl:
            type: string
          videoMetadata:
            $ref: '#/components/schemas/VideoMetadata'
          # ... 原有字段

      VideoMetadata:
        type: object
        properties:
          durationSeconds:
            type: integer
          width:
            type: integer
          height:
            type: integer
          sizeBytes:
            type: integer
          mimeType:
            type: string

  DTO/实体最小增量

  // Post.java 增量
  @Enumerated(EnumType.STRING)
  @Column(name = "media_type", nullable = false)
  private MediaType mediaType = MediaType.IMAGE; // [VIDEO-FIELDS]

  @OneToOne(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = 
  true)
  private PostVideo video; // [VIDEO-FIELDS]

  // 新增 PostVideo.java
  @Entity
  @Table(name = "post_videos")
  public class PostVideo extends BaseEntity {
      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @Column(nullable = false, unique = true)
      private UUID uuid;

      @OneToOne(fetch = FetchType.LAZY)
      @JoinColumn(name = "post_id", nullable = false)
      private Post post;

      @Column(name = "video_path", nullable = false, length = 512)
      private String videoPath;

      @Column(name = "cover_path", nullable = false, length = 512)
      private String coverPath;

      @Column(name = "duration_seconds", nullable = false)
      private Integer durationSeconds;

      @Column(nullable = false)
      private Integer width;

      @Column(nullable = false)
      private Integer height;

      @Column(name = "size_bytes", nullable = false)
      private Long sizeBytes;

      @Column(name = "mime_type", nullable = false, length = 50)
      private String mimeType;
  }

  // MediaType枚举
  public enum MediaType {
      IMAGE, VIDEO
  }

  表结构变更 (V002__add_video_support.sql)

  -- 1. 添加媒体类型字段
  ALTER TABLE posts
  ADD COLUMN media_type VARCHAR(10) NOT NULL DEFAULT 'IMAGE';

  -- 2. 创建视频表
  CREATE TABLE post_videos (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      uuid CHAR(36) NOT NULL UNIQUE,
      post_id BIGINT NOT NULL,
      video_path VARCHAR(512) NOT NULL,
      cover_path VARCHAR(512) NOT NULL,
      duration_seconds INT NOT NULL,
      width INT NOT NULL,
      height INT NOT NULL,
      size_bytes BIGINT NOT NULL,
      mime_type VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE
  CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      INDEX idx_post_video_uuid (uuid),
      INDEX idx_post_video_post_id (post_id)
  );

  -- 3. 优化查询索引
  CREATE INDEX idx_posts_media_type_created ON posts(media_type, created_at
   DESC);

  -- 回滚思路：DROP TABLE post_videos; ALTER TABLE posts DROP COLUMN 
  media_type;

  校验与安全

  - 参数校验: 视频文件≤100MB, 支持mp4/webm, 时长≤5分钟
  - 互斥验证:
  mediaType=VIDEO时images必须为空，mediaType=IMAGE时video必须为空
  - 统一错误: {code: "VIDEO_TOO_LARGE", message: "视频文件超过100MB限制"}
  - N+1防护: Feed查询使用JOIN FETCH或@EntityGraph预加载video关系

  2. 需要修改/新增的文件

  后端文件清单

  修改:
  - entity/post/Post.java
    // [VIDEO-FIELDS] 添加mediaType字段和video关系

  - dto/PostSummaryDto.java
    // [VIDEO-FEED] 添加mediaType、videoMetadata字段

  - dto/PostDetailDto.java
    // [VIDEO-DETAIL] 添加videoUrl、videoCoverUrl、videoMetadata

  - controller/PostController.java
    // [VIDEO-CREATE] createPost方法支持video/videoCover参数
    // [VIDEO-FEED] getFeed方法支持mediaType查询参数

  - service/PostService.java & PostServiceImpl.java
    // [VIDEO-SAVE] saveVideo(MultipartFile video, MultipartFile cover):
  PostVideo
    // [VIDEO-PROCESS] extractVideoMetadata(File video): VideoMetadata

  - repository/PostRepository.java
    // [VIDEO-QUERY] findByMediaTypeAndAuthor(MediaType type, User author,
  Pageable p)

  新增:
  - entity/post/PostVideo.java
  - entity/post/MediaType.java (enum)
  - dto/VideoMetadataDto.java
  - controller/MediaController.java
    // GET /api/media/{id} 返回视频/图片二进制流
  - service/MediaService.java & MediaServiceImpl.java
    // streamMedia(UUID id, HttpServletResponse response)
  - repository/PostVideoRepository.java

  前端文件清单

  修改:
  - types/post.ts
    // [VIDEO-TYPES] 添加mediaType、videoUrl、videoMetadata类型

  - services/apiClient.ts
    // [VIDEO-UPLOAD] 支持video/videoCover上传的uploadVideo方法

  - screens/Post/CreatePostScreen.tsx
    // [VIDEO-SELECT] 添加视频选择按钮和预览
    // [VIDEO-SUBMIT] 调用uploadVideo而非uploadImages

  - screens/Post/Discover/components/PostCard.tsx
    // [VIDEO-COVER] 显示视频封面+播放图标overlay

  - screens/Post/PostDetailScreen.tsx
    // [VIDEO-PLAYER] 集成react-native-video播放器
    // [VIDEO-AUTO] 自动播放逻辑
    // [VIDEO-EXIT] 左上角退出按钮

  - screens/Post/Discover/hooks/usePosts.ts
    // [VIDEO-PATCH] 处理视频URL的patch逻辑

  新增:
  - components/VideoPlayer.tsx
    // 封装react-native-video的播放器组件
  - hooks/useVideoPlayer.ts
    // 播放状态管理(暂停/恢复/重试)

  react-native-video 最小配置

  <Video
    source={{ uri: videoUrl }}
    paused={paused}
    muted={muted}
    resizeMode="contain"
    onError={handleError}
    onLoad={handleLoad}
    onEnd={handleEnd}
    onBuffer={handleBuffer}
    style={styles.video}
  />

  3. 验收标准

  后端验收清单

  - 视频帖创建成功，返回201和完整PostDetailDto
  - 视频与图片互斥验证生效(400错误)
  - Feed接口返回视频帖的封面URL和videoMetadata
  - 详情接口返回可播放的videoUrl
  - GET /api/media/{id}正确返回视频流(206部分内容)
  - 视频文件大小限制100MB生效
  - 分页/排序与现有保持一致
  - JWT鉴权正常工作
  - 统一错误结构返回
  - 旧图片帖完全不受影响
  - idx_posts_media_type_created索引创建成功
  - N+1查询问题已解决(JOIN FETCH)

  前端验收清单

  - 发帖页可选择视频(相册/拍摄)
  - 视频选择后显示预览和时长
  - 列表显示视频封面+播放角标
  - 点击视频帖进入详情页
  - 详情页自动播放(默认静音)
  - 点击屏幕切换静音状态
  - 左上角X按钮返回列表
  - 加载中显示loading占位
  - 加载失败显示错误占位+重试按钮
  - 切到后台自动暂停
  - 切回前台自动恢复
  - 点赞/收藏/评论功能正常
  - 内存无明显泄漏
  - 列表滑动流畅度≥50fps

  4. To-Do 列表

  | 阶段             | 模块    | 文件路径
               | 插入点            | 任务说明                 | 依赖      |
   工时(h) | 负责人 | 验收标准          |
  |----------------|-------|-----------------------------------------------
  -----|----------------|----------------------|---------|-------|-----|---
  ------------|
  | Phase 1: 契约与迁移 |       |
            |                |                      |         |       |
   |               |
  | 1.1            | BE    |
  resources/db/migration/V002__add_video_support.sql | 新文件            |
  创建数据库迁移脚本            | -       | 1     | BE  | 迁移成功执行
     |
  | 1.2            | BE    | entity/post/MediaType.java
       | 新文件            | 创建媒体类型枚举             | -       | 0.5
   | BE  | 编译通过          |
  | 1.3            | BE    | entity/post/PostVideo.java
       | 新文件            | 创建视频实体类              | 1.2     | 1
  | BE  | JPA映射正确       |
  | 1.4            | BE    | entity/post/Post.java
       | [VIDEO-FIELDS] | 添加mediaType和video关系  | 1.2,1.3 | 0.5   | BE
   | 关系映射正确        |
  | Phase 2: 后端实现  |       |
           |                |                      |         |       |
  |               |
  | 2.1            | BE    | dto/VideoMetadataDto.java
       | 新文件            | 创建视频元数据DTO           | -       | 0.5
  | BE  | 字段完整          |
  | 2.2            | BE    | dto/PostSummaryDto.java
       | [VIDEO-FEED]   | 添加视频相关字段             | 2.1     | 0.5   |
  BE  | MapStruct映射正确 |
  | 2.3            | BE    | dto/PostDetailDto.java
       | [VIDEO-DETAIL] | 添加视频URL和元数据          | 2.1     | 0.5   |
  BE  | 序列化正确         |
  | 2.4            | BE    | repository/PostVideoRepository.java
       | 新文件            | 创建视频仓库接口             | 1.3     | 0.5
   | BE  | CRUD方法可用      |
  | 2.5            | BE    | repository/PostRepository.java
       | [VIDEO-QUERY]  | 添加按媒体类型查询            | 1.4     | 1     |
   BE  | 查询无N+1        |
  | 2.6            | BE    | service/MediaService.java
       | 新文件            | 媒体服务接口和实现            | 2.4     | 2
    | BE  | 视频元数据提取成功     |
  | 2.7            | BE    | service/PostServiceImpl.java
       | [VIDEO-SAVE]   | 实现视频保存逻辑             | 2.6     | 3     |
  BE  | 视频保存到本地       |
  | 2.8            | BE    | controller/PostController.java
       | [VIDEO-CREATE] | 支持视频上传               | 2.7     | 2     | BE
    | 接口返回201       |
  | 2.9            | BE    | controller/MediaController.java
       | 新文件            | 实现媒体流接口              | 2.6     | 2
  | BE  | 支持206部分内容     |
  | 2.10           | BE    | -
       | -              | 后端单元测试               | 2.1-2.9 | 3     | BE
    | 覆盖率>80%       |
  | Phase 3: 前端实现  |       |
           |                |                      |         |       |
  |               |
  | 3.1            | FE    | types/post.ts
       | [VIDEO-TYPES]  | 添加视频相关类型定义           | -       | 0.5
  | FE  | TS编译通过        |
  | 3.2            | FE    | services/apiClient.ts
       | [VIDEO-UPLOAD] | 实现uploadVideo方法      | 3.1     | 1     | FE
  | 上传进度回调正常      |
  | 3.3            | FE    | hooks/useVideoPlayer.ts
       | 新文件            | 视频播放状态管理             | -       | 2
   | FE  | 暂停/恢复逻辑正确     |
  | 3.4            | FE    | components/VideoPlayer.tsx
       | 新文件            | 封装播放器组件              | 3.3     | 3
  | FE  | 自动播放+错误处理     |
  | 3.5            | FE    | screens/Post/CreatePostScreen.tsx
       | [VIDEO-SELECT] | 添加视频选择UI             | 3.2     | 2     | FE
    | 视频预览显示        |
  | 3.6            | FE    | screens/Post/Discover/components/PostCard.tsx
       | [VIDEO-COVER]  | 显示视频封面+角标            | 3.1     | 1     |
  FE  | 角标正确显示        |
  | 3.7            | FE    | screens/Post/PostDetailScreen.tsx
       | [VIDEO-PLAYER] | 集成视频播放器              | 3.4     | 3     |
  FE  | 自动播放+退出按钮     |
  | 3.8            | FE    | screens/Post/Discover/hooks/usePosts.ts
       | [VIDEO-PATCH]  | 处理视频URL              | 3.1     | 1     | FE
  | URL正确拼接       |
  | Phase 4: 联调与测试 |       |
            |                |                      |         |       |
   |               |
  | 4.1            | FE+BE | -
       | -              | 前后端联调                | 3.1-3.8 | 4     |
  全栈  | 主流程通过         |
  | 4.2            | FE    | -
       | -              | 弱网测试                 | 4.1     | 2     | FE
  | 重试机制正常        |
  | 4.3            | FE    | -
       | -              | 性能测试                 | 4.1     | 2     | FE
  | 内存无泄漏         |
  | 4.4            | BE    | -
       | -              | 压力测试                 | 4.1     | 2     | BE
  | QPS>100       |
  | Phase 5: 文档与监控 |       |
            |                |                      |         |       |
   |               |
  | 5.1            | BE    | -
       | -              | 更新API文档              | 4.4     | 1     | BE
  | Swagger更新     |
  | 5.2            | FE+BE | -
       | -              | 更新PROJECT_CONTEXT.md | 5.1     | 1     | 全栈
  | 文档完整          |

  PR 拆分建议

  PR #1: 数据库迁移与实体 (1.1-1.4)
  - 评审要点：表结构设计、索引策略、回滚方案

  PR #2: 后端核心实现 (2.1-2.9)
  - 评审要点：视频存储安全性、N+1查询、错误处理

  PR #3: 后端单测 (2.10)
  - 评审要点：测试覆盖率、边界条件

  PR #4: 前端视频播放 (3.1-3.4)
  - 评审要点：播放器性能、内存管理

  PR #5: 前端UI集成 (3.5-3.8)
  - 评审要点：用户体验、交互一致性

  PR #6: 联调与优化 (4.1-5.2)
  - 评审要点：端到端测试结果、性能指标

  总预估：45小时（约6个工作日）
