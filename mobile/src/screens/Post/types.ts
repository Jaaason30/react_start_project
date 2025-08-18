// src/screens/Post/types.ts

/** 评论排序方式 */
export type SortType = '最新' | '最热';

/** 评论类型 */
export interface CommentType {
  /** 评论ID */
  id: string;
  /** 作者信息 */
  author: {
    shortId: number;
    nickname: string;
    profilePictureUrl?: string | null;
  };
  /** 正文内容 */
  content: string;
  /** 时间戳 */
  time: string;
  /** 点赞数 */
  likes: number;
  /** 是否已点赞 */
  liked: boolean;
  /** 父评论 ID */
  parentCommentUuid?: string;
  /** 回复目标用户 */
  replyToUser?: {
    shortId: number;
    nickname: string;
    profilePictureUrl?: string | null;
  };
  /** 回复数量 */
  replyCount: number;
  /** 子回复列表 */
  replies?: CommentType[];
}

// [VIDEO-TYPES] 开始 - 视频相关类型定义
/** 媒体类型 */
<<<<<<< HEAD
export type MediaType = 'IMAGE' | 'VIDEO' | 'MIXED';
=======
export type MediaType = 'IMAGE' | 'VIDEO';
>>>>>>> c99daa6 (Initial commit - Clean project state)

/** 视频元数据 */
export interface VideoMetadata {
  /** 视频时长（秒） */
  durationSeconds: number;
  /** 视频宽度（像素） */
  width: number;
  /** 视频高度（像素） */
  height: number;
  /** 文件大小（字节） */
  sizeBytes: number;
  /** MIME类型 */
  mimeType: string;
}
// [VIDEO-TYPES] 结束

/** 帖子类型 */
export interface PostType {
  /** 帖子UUID */
  uuid: string;
  /** 标题 */
  title: string;
  /** 正文内容 */
  content: string;
  
  // [VIDEO-TYPES] 开始 - 媒体相关字段
<<<<<<< HEAD
  /** 媒体类型：IMAGE、VIDEO 或 MIXED */
=======
  /** 媒体类型：IMAGE 或 VIDEO */
>>>>>>> c99daa6 (Initial commit - Clean project state)
  mediaType?: MediaType;
  /** 图片列表（仅当mediaType=IMAGE时存在） */
  images: string[];
  /** 视频播放URL（仅当mediaType=VIDEO时存在） */
  videoUrl?: string;
  /** 视频封面URL（仅当mediaType=VIDEO时存在） */
  videoCoverUrl?: string;
  /** 视频元数据（仅当mediaType=VIDEO时存在） */
  videoMetadata?: VideoMetadata;
  // [VIDEO-TYPES] 结束
  /** 作者信息 */
  author: {
    shortId: number;
    nickname: string;
    profilePictureUrl?: string | null;
  };
  /** 点赞数 */
  likeCount: number;
  /** 收藏数 */
  collectCount: number;
  /** 评论数 */
  commentCount: number;
  /** 是否已点赞 */
  likedByCurrentUser: boolean;
  /** 是否已收藏 */
  collectedByCurrentUser: boolean;
  /** 是否已关注作者 */
  followedByCurrentUser: boolean;
}

/** 回复目标类型 */
export type ReplyingToType = {
  commentId: string;
  userName: string;
  parentCommentUuid?: string;
  /** 回复目标用户 shortId */
  replyToUserShortId?: number;
} | null;
