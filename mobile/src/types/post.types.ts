// src/types/post.types.ts

/** 对应后端的 PostImageDto */
export interface PostImageDto {
  idx: number;
  url: string;
}

/** 对应后端的 TagDto */
export interface TagDto {
  id: number;
  name: string;
}

/** 对应后端的 AuthorSummaryDto */
export interface AuthorSummaryDto {
  /** 使用 shortId 作为用户标识，不再包含 uuid */
  shortId: number;
  nickname: string;
  profilePictureUrl: string | null;
}

/** 对应后端的 PostDetailDto */
export interface PostDetailDto {
  uuid: string;
  title: string;
  content: string;
  images: PostImageDto[];
  tags: TagDto[];
  author: AuthorSummaryDto;
  likeCount: number;
  collectCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
  collectedByCurrentUser: boolean;
  followedByCurrentUser: boolean;
}
