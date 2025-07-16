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

/** 帖子类型 */
export interface PostType {
  /** 帖子UUID */
  uuid: string;
  /** 标题 */
  title: string;
  /** 正文内容 */
  content: string;
  /** 图片列表 */
  images: string[];
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
