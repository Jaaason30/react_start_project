# PROJECT CONTEXT

## Tech Stack

### Frontend (React Native)
- **Framework**: React Native 0.79.2 + TypeScript
- **Navigation**: React Navigation 7.x (Native Stack)
- **State Management**: React Context + Custom Hooks
- **HTTP Client**: Custom ApiClient with auto-refresh JWT
- **UI Libraries**: React Native Vector Icons, Fast Image, Linear Gradient
- **Storage**: AsyncStorage for token management
- **Development**: Metro bundler, ESLint, Jest

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.5.0 + Java 17
- **Security**: Spring Security + JWT (JJWT 0.11.5)
- **Database**: MySQL 8 with JPA/Hibernate
- **Documentation**: SpringDoc OpenAPI 3
- **Mapping**: MapStruct 1.5.5 + Lombok 1.18.38
- **File Upload**: MultipartFile support (20MB max)
- **Build**: Maven

### Infrastructure
- **Database**: MySQL 8 (localhost:3306/zusa_db)
- **File Storage**: Local filesystem (/Users/junzeli/Desktop/Uploads)
- **Development**: Android/iOS simulators + Spring Boot DevTools
- **API**: RESTful with Pageable support

## Domain Models

### Core Entities
- **User**: UUID + shortId, profile pictures, followers/following
- **Post**: UUID-based, title/content/images, tags, reactions, comments
- **Comment**: Nested replies, likes, author tracking
- **Tag**: Post categorization with hot tags support
- **Reaction**: Like/collect actions with user tracking
- **PostImage**: Ordered image attachments (idx-based)

### Key Relationships
- User (1:N) → Posts (author)
- Post (M:N) → Tags (categorization)
- Post (1:N) → Comments + PostImages + Reactions
- User (M:N) → User (followers/following)

## Square/Feed 现状

### Frontend Structure (✅ 完整支持视频)
- **DiscoverScreen**: Main feed with top tabs (推荐) + bottom navigation
- **PostCard**: Grid layout (2 columns), video cover + play icon + duration badge
- **PostCreationScreen**: 视频选择、预览、上传功能 (IMAGE/VIDEO 切换)
- **VideoPlayer**: 全屏播放、控制栏、点击暂停/播放、返回按钮
- **usePosts Hook**: Data fetching, refresh logic, pagination + video metadata
- **useVideoPlayer Hook**: 播放状态管理、后台暂停/恢复逻辑
- **PostActionSheet**: Create post options (gallery/camera/text/template)

### Backend API (✅ 视频功能完整实现)
```
GET /api/posts/feed?type=USER&mediaType=VIDEO&page=0&size=20  # 支持媒体类型筛选
GET /api/posts/{uuid}                         # Post detail (包含视频字段)
POST /api/posts (multipart/form-data)         # Create post (支持视频上传)
  - mediaType: IMAGE|VIDEO
  - video: file (for VIDEO posts)
  - videoCover: file (for VIDEO posts)
  - images: file[] (for IMAGE posts)
PATCH /api/posts/{uuid}                       # Edit post
DELETE /api/posts/{uuid}                      # Delete post
GET /api/posts/search?kw=keyword              # Search posts
GET /api/media/{id}                           # 流媒体传输 (新增)
```

### DTOs (✅ 已扩展支持视频)
- **PostSummaryDto**: Feed listing + mediaType + videoMetadata
- **PostDetailDto**: Full post + videoUrl + videoCoverUrl + videoMetadata
- **VideoMetadataDto**: durationSeconds, width, height, sizeBytes, mimeType
- **AuthorSummaryDto**: shortId, nickname, profilePictureUrl

### Backend Video Support (✅ 完整实现)
- **MediaType枚举**: IMAGE, VIDEO
- **PostVideo实体**: 视频元数据存储 (durationSeconds, width, height, sizeBytes, mimeType)
- **视频存储**: 本地文件系统 (/Users/junzeli/Desktop/Uploads/video/)
- **流媒体**: MediaController支持视频流式传输 (GET /api/media/{id})
- **安全配置**: Spring Security允许公开访问 /api/media/**
- **验证**: 图片/视频互斥，文件大小限制(100MB)，MP4格式验证

## API Design Patterns

### Pagination
- Spring Data Pageable: `?page=0&size=20`
- Response: `Page<T>` with content[], pagination metadata
- Frontend: Auto-loading via scroll/refresh

### Error Handling
- Global `@RestControllerAdvice` with structured error responses
- Frontend ApiClient wraps responses in `{data, error, status}`
- JWT auto-refresh on 401 responses

### Authentication
- **JWT Strategy**: Access token (1h) + Refresh token (7d)
- **Header**: `Authorization: Bearer <token>`
- **Auto-refresh**: Proactive (5min buffer) + reactive (401 fallback)

## Frontend Development Conventions

### ApiClient Usage
- Singleton instance with automatic token management
- Methods: `.get()`, `.post()`, `.upload()` for multipart
- Error boundary: All responses wrapped in ApiResponse<T>
- Auto-retry on token expiration

### State Management
- Context providers for global state (UserProfile, GroupChat)
- Custom hooks for data fetching (usePosts, usePostActions)
- Local state for UI interactions (loading, refreshing)

### Performance Optimizations
- FlatList with initialNumToRender=6, windowSize=9
- Fast Image for optimized image loading
- URL patching for profile pictures with version cache-busting
- Debounced refresh with MIN_AUTO_REFRESH_MS=800

## Backend Development Conventions

### Controller Layer
- `@RestController` + `@RequestMapping("/api")`
- `@AuthenticationPrincipal UserDetails` for current user
- Validation: `@Validated` + Jakarta Bean Validation
- Pagination: Spring Data Pageable parameters

### Service Layer
- Interface + Implementation pattern (`PostService` → `PostServiceImpl`)
- Command objects for complex operations (`CreatePostCmd`, `EditPostCmd`)
- MapStruct mappers for DTO conversion
- Business logic isolation from web layer

### Repository Layer
- Spring Data JPA with custom query methods
- `@Query` annotations for complex queries
- Indexed columns: author_id, createdAt for performance
- Pageable support in custom finder methods

### Exception Handling
- `@RestControllerAdvice` for global error handling
- Custom exceptions with meaningful messages
- Structured error responses with status codes

## Security & Performance

### Authentication Security
- JWT secret minimum 256 bits (HS256)
- Refresh tokens stored securely in AsyncStorage
- Token validation on protected endpoints
- Automatic token cleanup on auth failures

### Database Optimization
- Strategic indexes: `@Index(columnList = "author_id, createdAt")`
- Lazy loading for associations (`FetchType.LAZY`)
- N+1 prevention with proper JOIN strategies
- Connection pooling via HikariCP (Spring Boot default)

### File Upload Security
- **图片**: File size limits: 20MB per file, 50MB per request
- **视频**: File size limits: 100MB per video, MP4 format validation
- MIME type validation: "image/jpeg,image/png,image/webp,image/gif,video/mp4"
- Upload path sanitization and UUID naming
- Static file serving + video streaming via Spring configuration
- **视频安全**: /api/media/** 公开访问，解决react-native-video认证问题

## Video Feature Summary (✅ 完整实现 - 2025-08-16)

### 核心功能
- **视频上传**: PostCreationScreen支持IMAGE/VIDEO模式切换，视频选择、预览、上传功能
- **视频展示**: PostCard显示视频封面、播放角标、时长信息
- **视频播放**: VideoPlayer组件完整功能，包括全屏播放、控制栏、点击暂停
- **自动体验**: 进入视频帖子后1.5秒自动全屏播放，返回按钮始终可见

### 技术实现
- **后端**: PostVideo实体、MediaController流媒体、Spring Security公开访问配置
- **前端**: VideoPlayer + useVideoPlayer hook、React.memo性能优化
- **数据流**: API → usePostDetail/usePosts → PostContent → VideoPlayer
- **文件支持**: MP4格式，最大100MB，视频元数据自动提取

### 验收状态
- ✅ 视频上传成功，返回完整PostDetailDto
- ✅ Feed接口返回视频封面URL和videoMetadata
- ✅ 详情接口返回可播放的videoUrl
- ✅ GET /api/media/{id}正确返回视频流
- ✅ 视频文件大小限制100MB生效
- ✅ 列表显示视频封面+播放角标
- ✅ 详情页自动播放(默认静音)
- ✅ 全屏模式下返回按钮和点击暂停功能
- ✅ 切到后台自动暂停，切回前台自动恢复

## Runbook

### Backend Startup
```bash
cd backend
./mvnw spring-boot:run
# OR: ./mvnw clean install && java -jar target/backend-0.0.1-SNAPSHOT.jar
# Server: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Frontend Development
```bash
cd mobile
npm install
npm run prestart  # Setup ADB reverse proxy
npm start        # Metro bundler
npm run android  # Android build
npm run ios      # iOS build
```

### Environment Variables
- **Database**: MySQL root/123456 (localhost:3306/zusa_db)
- **JWT**: Update secret in application.yml for production
- **Upload Path**: Configure app.upload.base-path for deployment
- **API URL**: Automatic platform detection (Android: 10.0.2.2, iOS: localhost)

### Essential Commands
```bash
# Backend health check
curl http://localhost:8080/actuator/health

# Frontend debug
npx react-native log-android  # Android logs
npx react-native log-ios      # iOS logs

# Database reset
./mvnw spring-boot:run -Dspring.jpa.hibernate.ddl-auto=create-drop
```