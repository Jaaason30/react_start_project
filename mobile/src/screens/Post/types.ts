// src/screens/Post/types.ts

/** 评论排序方式 */
export type SortType = '最新' | '最热';

/** 评论类型 */
export interface CommentType {
  id: string;
  authorUuid: string;
  user: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  liked: boolean;
  parentCommentUuid?: string;
  replyToUser?: { uuid: string; nickname: string };
  replyCount: number;
  replies?: CommentType[];
}

/** 帖子类型 */
export interface PostType {
  uuid: string;
  title: string;
  content: string;
  images: string[];
  author: string;
  authorAvatar: string;
  authorUuid: string;
  likeCount: number;
  collectCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
  collectedByCurrentUser: boolean;
  followedByCurrentUser: boolean;
}
