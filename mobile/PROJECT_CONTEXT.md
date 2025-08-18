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

### Frontend Structure
- **DiscoverScreen**: Main feed with top tabs (推荐) + bottom navigation
- **PostCard**: Grid layout (2 columns), cover image + author + stats
- **usePosts Hook**: Data fetching, refresh logic, pagination
- **PostActionSheet**: Create post options (gallery/camera/text/template)

### Video Support Status (✅ 完整功能实现 - 2025-08-16)
**全流程视频功能**:
- **视频上传**: PostCreationScreen支持视频选择、预览、上传
- **视频播放**: VideoPlayer组件支持全屏播放、控制栏、点击暂停
- **视频展示**: PostCard显示视频封面、播放角标、时长
- **自动全屏**: 进入视频帖子后1.5秒自动全屏播放
- **性能优化**: React.memo、减少重渲染、清理调试日志
- **数据流**: API → usePostDetail/usePosts → PostContent → VideoPlayer

### Backend API (✅ 视频功能已完成)
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

### Backend Video Support (✅ 已完成)
- **MediaType枚举**: IMAGE, VIDEO
- **PostVideo实体**: 视频元数据存储
- **视频存储**: 本地文件系统 (/Users/junzeli/Desktop/Uploads/video/)
- **流媒体**: 支持视频播放和下载
- **验证**: 图片/视频互斥，文件大小限制(100MB)

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
- File size limits: 20MB per file, 50MB per request
- MIME type validation: "image/jpeg,image/png,image/webp,image/gif"
- Upload path sanitization and UUID naming
- Static file serving via Spring configuration

## Recent Updates & Issues Resolved

### Video Rendering Fix (2025-08-16)
**问题**: 帖子详情无法加载和播放视频
**根因**: usePostDetail hook未获取视频相关字段
**解决方案**:
1. 修复usePostDetail hook - 添加mediaType, videoUrl, videoCoverUrl, videoMetadata字段
2. 改进VideoPlayerFallback组件 - 放宽URL验证规则，支持相对路径
3. 增强PostContent组件 - 添加视频数据验证和错误处理
4. 确保数据流完整性 - API → hooks → components

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