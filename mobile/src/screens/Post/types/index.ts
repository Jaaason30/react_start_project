export type CommentType = {
  id: string;
  authorUuid: string;
  user: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  likedByCurrentUser: boolean;
  parentCommentUuid?: string;
  replyToUser?: { uuid: string; nickname: string };
  replyCount: number;
  replies?: CommentType[];
};

export type SortType = '最新' | '最热';

export type PostType = {
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
};

export type ReplyingToType = {
  commentId: string;
  userName: string;
  parentCommentUuid?: string;
  replyToUserUuid?: string;
};