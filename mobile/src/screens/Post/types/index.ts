// src/screens/Post/types.ts

/** 评论排序方式 */
export type SortType = '最新' | '最热';

/** 评论类型 */
export type CommentType = {
  id: string;
  /** 作者 shortId */
  authorShortId: number;
  /** 作者昵称 */
  user: string;
  /** 作者头像 URL */
  avatar: string;
  content: string;
  time: string;
  /** 点赞数 */
  likes: number;
  /** 是否已点赞 */
  likedByCurrentUser: boolean;
  /** 父评论 ID */
  parentCommentUuid?: string;
  /** 回复目标用户 */
  replyToUser?: { shortId: number; nickname: string };
  /** 回复数量 */
  replyCount: number;
  /** 子回复 */
  replies?: CommentType[];
};

/** 帖子类型 */
export type PostType = {
  uuid: string;
  title: string;
  content: string;
  images: string[];
  author: string;
  authorAvatar: string;
  /** 作者 shortId */
  authorShortId: number;
  likeCount: number;
  collectCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
  collectedByCurrentUser: boolean;
  followedByCurrentUser: boolean;
};

/** 回复目标类型 */
export type ReplyingToType = {
  commentId: string;
  userName: string;
  parentCommentUuid?: string;
  /** 回复目标用户 shortId */
  replyToUserShortId?: number;
} | null;
