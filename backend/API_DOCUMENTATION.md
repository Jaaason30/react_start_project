# ZUSA Backend API Documentation

## 基础信息

- **Base URL**: `/api`
- **认证方式**: JWT Bearer Token
- **响应格式**: JSON

## 认证 API `/api/auth`

### 用户注册
**POST** `/api/auth/register`

**请求体**:
```json
{
  "email": "string (required, email format)",
  "password": "string (required)",
  "nickname": "string (required)"
}
```

**响应**: `200 OK`
```json
{
  "accessToken": "string",
  "refreshToken": "string", 
  "shortId": "number",
  "email": "string",
  "nickname": "string"
}
```

### 用户登录
**POST** `/api/auth/login`

**请求体**:
```json
{
  "username": "string (email or nickname, required)",
  "password": "string (required)"
}
```

**响应**: `200 OK`
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "shortId": "number",
  "email": "string",
  "nickname": "string"
}
```

### 游客登录
**POST** `/api/auth/guest`

**响应**: `200 OK`
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "uuid": "string",
    "shortId": "number",
    "email": "string",
    "nickname": "string",
    // ... 其他用户信息
  }
}
```

### 刷新令牌
**POST** `/api/auth/refresh`

**请求体**:
```json
{
  "refreshToken": "string (required)"
}
```

**响应**: `200 OK`
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "shortId": "number",
  "email": "string",
  "nickname": "string"
}
```

## 用户 API `/api/user`

### 当前用户信息

#### 获取当前用户信息
**GET** `/api/user/me`

**Headers**: `Authorization: Bearer {token}`

**响应**: `200 OK`
```json
{
  "uuid": "string",
  "shortId": "number",
  "email": "string",
  "nickname": "string",
  "bio": "string",
  "dateOfBirth": "date",
  "profilePicture": {...},
  "city": {...},
  "gender": {...},
  "interests": [...],
  // ... 其他用户信息
}
```

#### 更新当前用户资料
**PATCH** `/api/user/me`

**Headers**: `Authorization: Bearer {token}`

**请求体**: UserDto (部分字段可选)

**响应**: `200 OK`

#### 获取当前用户粉丝列表
**GET** `/api/user/me/followers`

**Headers**: `Authorization: Bearer {token}`

**查询参数**:
- `page`: 页码 (默认: 0)
- `size`: 每页数量 (默认: 20)

**响应**: `200 OK` - Page<UserSummaryDto>

#### 获取当前用户关注列表
**GET** `/api/user/me/following`

**Headers**: `Authorization: Bearer {token}`

**查询参数**:
- `page`: 页码 (默认: 0)
- `size`: 每页数量 (默认: 20)

**响应**: `200 OK` - Page<UserSummaryDto>

### 用户资料（通过 shortId）

#### 获取用户资料
**GET** `/api/user/profile/short/{shortId}`

**响应**: `200 OK` - UserDto

#### 更新用户资料
**PATCH** `/api/user/profile/short/{shortId}`

**Headers**: `Authorization: Bearer {token}`

**请求体**: UserDto (部分字段可选)

**响应**: `200 OK`

### 关注/取消关注

#### 关注用户
**POST** `/api/user/follow/{targetShortId}`

**Headers**: `Authorization: Bearer {token}`

**响应**: `200 OK`

#### 取消关注
**DELETE** `/api/user/follow/{targetShortId}`

**Headers**: `Authorization: Bearer {token}`

**响应**: `200 OK`

### 用户社交信息

#### 获取用户粉丝列表
**GET** `/api/user/{shortId}/followers`

**查询参数**:
- `page`: 页码
- `size`: 每页数量

**响应**: `200 OK` - Page<UserSummaryDto>

#### 获取用户关注列表  
**GET** `/api/user/{shortId}/following`

**查询参数**:
- `page`: 页码
- `size`: 每页数量

**响应**: `200 OK` - Page<UserSummaryDto>

## 帖子 API `/api/posts`

### 帖子列表

#### 获取 Feed 列表
**GET** `/api/posts/feed`

**查询参数**:
- `type`: Feed类型 (USER/ALL, 默认: USER)
- `mediaType`: 媒体类型筛选 (IMAGE/VIDEO, 可选)
- `page`: 页码
- `size`: 每页数量

**响应**: `200 OK` - Page<PostSummaryDto>

#### 搜索帖子
**GET** `/api/posts/search`

**查询参数**:
- `kw`: 搜索关键词 (required)
- `page`: 页码
- `size`: 每页数量

**响应**: `200 OK` - Page<PostSummaryDto>

#### 获取当前用户的帖子
**GET** `/api/posts/me`

**Headers**: `Authorization: Bearer {token}`

**查询参数**:
- `page`: 页码
- `size`: 每页数量

**响应**: `200 OK` - Page<PostSummaryDto>

#### 按作者获取帖子
**GET** `/api/posts/user/short/{shortId}`

**查询参数**:
- `page`: 页码
- `size`: 每页数量

**响应**: `200 OK` - Page<PostSummaryDto>

### 帖子详情

#### 获取帖子详情
**GET** `/api/posts/{uuid}`

**响应**: `200 OK` - PostDetailDto

### 帖子操作

#### 创建帖子
**POST** `/api/posts`

**Headers**: 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**表单字段**:
- `title`: 标题 (required)
- `content`: 内容 (required)
- `mediaType`: 媒体类型 (IMAGE/VIDEO, 默认: IMAGE)
- `images[]`: 图片文件 (最多9张, 当mediaType=IMAGE时)
- `video`: 视频文件 (当mediaType=VIDEO时)
- `videoCover`: 视频封面 (当mediaType=VIDEO时)
- `tagNames[]`: 标签名称数组

**响应**: `200 OK` - UUID

#### 编辑帖子
**PATCH** `/api/posts/{uuid}`

**Headers**: `Authorization: Bearer {token}`

**请求体**:
```json
{
  "title": "string (optional)",
  "content": "string (optional)",
  "tagNames": ["string"] 
}
```

**响应**: `200 OK`

#### 删除帖子
**DELETE** `/api/posts/{uuid}`

**Headers**: `Authorization: Bearer {token}`

**响应**: `200 OK`

## 评论 API

### 评论列表

#### 获取帖子一级评论
**GET** `/api/posts/{postUuid}/comments`

**查询参数**:
- `sortType`: 排序类型 (LATEST/HOTTEST, 默认: LATEST)
- `loadReplies`: 是否加载回复 (默认: false)
- `page`: 页码
- `size`: 每页数量

**响应**: `200 OK` - Page<CommentDto>

#### 获取评论的回复列表
**GET** `/api/comments/{commentUuid}/replies`

**查询参数**:
- `page`: 页码
- `size`: 每页数量

**响应**: `200 OK` - Page<CommentDto>

### 评论操作

#### 新增评论或回复
**POST** `/api/posts/{postUuid}/comments`

**Headers**: `Authorization: Bearer {token}`

**请求体**:
```json
{
  "content": "string (required)",
  "parentCommentUuid": "UUID (optional, 回复评论时)",
  "replyToUserUuid": "UUID (optional, @某人时)"
}
```

**响应**: `200 OK` - CommentDto

#### 点赞/取消点赞评论
**POST** `/api/comments/{commentUuid}/likes`

**Headers**: `Authorization: Bearer {token}`

**响应**: `200 OK` - CommentDto

#### 获取单条评论详情
**GET** `/api/comments/{commentUuid}`

**响应**: `200 OK` - CommentDto

#### 删除评论
**DELETE** `/api/comments/{commentUuid}`

**Headers**: `Authorization: Bearer {token}`

**响应**: `204 No Content`

## 反应（点赞/收藏）API

### 切换点赞/收藏
**POST** `/api/posts/{postUuid}/reactions`

**Headers**: `Authorization: Bearer {token}`

**请求体**:
```json
{
  "type": "LIKE | COLLECT"
}
```

**响应**: `200 OK` - PostDetailDto (返回更新后的帖子详情)

### 检查是否已点赞/收藏
**GET** `/api/posts/{postUuid}/reactions/check`

**Headers**: `Authorization: Bearer {token}`

**查询参数**:
- `type`: LIKE | COLLECT (required)

**响应**: `200 OK` - boolean

## 标签 API `/api/tags`

### 获取热门标签
**GET** `/api/tags/hot`

**查询参数**:
- `limit`: 返回数量 (默认: 20)

**响应**: `200 OK` - List<TagDto>

### 标签自动补全
**GET** `/api/tags/suggest`

**查询参数**:
- `kw`: 关键词 (required)
- `limit`: 返回数量 (默认: 20)

**响应**: `200 OK` - List<TagDto>

## 横幅 API `/api/banners`

### 获取活动横幅
**GET** `/api/banners/active`

**响应**: `200 OK` - List<BannerDto>

## 媒体 API `/api/media`

### 获取用户头像
**GET** `/api/media/profile/{uuid}`

**响应**: `200 OK` - 图片二进制数据

### 获取用户照片
**GET** `/api/media/photo/{uuid}`

**响应**: `200 OK` - 图片二进制数据

### 上传单个文件
**POST** `/api/media/upload`

**Headers**: `Content-Type: multipart/form-data`

**表单字段**:
- `file`: 文件 (required)
- `subDir`: 子目录 (默认: "post")

**响应**: `200 OK` - 文件URL字符串

### 批量上传文件
**POST** `/api/media/uploads`

**Headers**: `Content-Type: multipart/form-data`

**表单字段**:
- `files[]`: 文件数组 (required)
- `subDir`: 子目录 (默认: "post")

**响应**: `200 OK` - List<String> (文件URL列表)

### 流媒体传输
**GET** `/api/media/{id}`

用于视频等大文件的流式传输

**响应**: 流媒体数据

## 文字转图片 API `/api/text-images`

### 生成文字图片
**POST** `/api/text-images/generate`

**Headers**: `Authorization: Bearer {token}`

**请求体**:
```json
{
  "text": "string (required)",
  "styleType": "number (1-渐变风格, 2-其他风格, 默认: 1)"
}
```

**响应**: `200 OK`
```json
{
  "imageUrl": "string"
}
```

### 获取生成历史
**GET** `/api/text-images/history`

**Headers**: `Authorization: Bearer {token}`

**响应**: `200 OK` - List<HistoryResponse>

### 删除历史记录
**DELETE** `/api/text-images/history/{id}`

**Headers**: `Authorization: Bearer {token}`

**响应**: `200 OK`

## 数据模型说明

### UserDto
```json
{
  "uuid": "UUID",
  "shortId": "Long", 
  "email": "String",
  "nickname": "String",
  "bio": "String",
  "dateOfBirth": "LocalDate",
  "profilePicture": "UserProfilePictureDto",
  "gender": "GenderDto",
  "genderPreferences": ["GenderDto"],
  "city": "CityDto",
  "interests": ["InterestDto"],
  "preferredVenues": ["VenueDto"],
  "albumPhotos": ["UserPhoto"],
  "dates": "UserDatesDto",
  "likes": "int"
}
```

### PostSummaryDto
```json
{
  "uuid": "UUID",
  "title": "String",
  "content": "String",
  "coverUrl": "String",
  "mediaType": "IMAGE | VIDEO",
  "videoCover": "String (视频封面URL)",
  "author": "AuthorSummaryDto",
  "tags": ["TagDto"],
  "images": ["PostImageDto"],
  "likeCount": "long",
  "collectCount": "long",
  "commentCount": "long",
  "liked": "boolean",
  "collected": "boolean",
  "createdAt": "LocalDateTime"
}
```

### PostDetailDto
继承自 PostSummaryDto，额外包含:
```json
{
  "video": "VideoMetadataDto (当mediaType=VIDEO时)"
}
```

### CommentDto
```json
{
  "uuid": "UUID",
  "content": "String",
  "author": "AuthorSummaryDto",
  "parentCommentUuid": "UUID",
  "replyToUser": "AuthorSummaryDto",
  "replies": ["CommentDto"],
  "replyCount": "long",
  "likeCount": "long",
  "liked": "boolean",
  "createdAt": "LocalDateTime"
}
```

### TagDto
```json
{
  "id": "Long",
  "name": "String",
  "count": "long"
}
```

### BannerDto  
```json
{
  "uuid": "UUID",
  "imageUrl": "String",
  "linkUrl": "String",
  "title": "String",
  "idx": "int"
}
```

## 错误响应

所有 API 在出错时返回相应的 HTTP 状态码：

- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未认证或令牌过期
- `403 Forbidden`: 无权限访问
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

错误响应体通常包含:
```json
{
  "timestamp": "ISO-8601 datetime",
  "status": "HTTP status code",
  "error": "Error type",
  "message": "Error description",
  "path": "Request path"
}
```

## 分页响应格式

分页接口返回的 Page 对象格式:
```json
{
  "content": [...],           // 数据列表
  "pageable": {
    "sort": {...},
    "pageNumber": 0,          // 当前页码
    "pageSize": 20,           // 每页大小
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalElements": 100,       // 总元素数
  "totalPages": 5,            // 总页数
  "last": false,              // 是否最后一页
  "first": true,              // 是否第一页
  "numberOfElements": 20,     // 当前页元素数
  "empty": false              // 是否为空
}
```

## 注意事项

1. **认证**: 除了登录、注册、游客登录等认证接口外，大部分接口需要在请求头中携带 JWT Token
2. **UUID vs shortId**: 系统内部使用 UUID，对外展示使用 shortId
3. **媒体文件**: 图片和视频通过 multipart/form-data 上传
4. **视频功能**: 支持视频上传、封面生成、流媒体播放
5. **实时性**: 点赞、收藏等操作会立即返回更新后的完整数据