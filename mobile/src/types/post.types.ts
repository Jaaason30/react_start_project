// src/types/post.types.ts

/** 媒体类型枚举 */
export enum MediaType {
  IMAGE = 'IMAGE',
<<<<<<< HEAD
  VIDEO = 'VIDEO',
  MIXED = 'MIXED'  // 新增混合媒体类型
=======
  VIDEO = 'VIDEO'
>>>>>>> c99daa6 (Initial commit - Clean project state)
}

/** 视频元数据类型 */
export interface VideoMetadataDto {
  durationSeconds: number;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
}

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
  // [VIDEO-TYPES] 开始 - 视频相关字段
  mediaType: MediaType;
  images: PostImageDto[];
  videoUrl?: string;
  videoCoverUrl?: string;
  videoMetadata?: VideoMetadataDto;
  // [VIDEO-TYPES] 结束
  tags: TagDto[];
  author: AuthorSummaryDto;
  likeCount: number;
  collectCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
  collectedByCurrentUser: boolean;
  followedByCurrentUser: boolean;
}
