// src/types/User.types.ts

export interface PartialUserDto {
  // —— 标识符 —— 
  shortId?: number;

  // —— 基本信息 —— 
  email?: string;
  nickname?: string;
  bio?: string;
  dateOfBirth?: string;
  age?: number;

  // —— 位置信息 —— 
  city?: { name: string };

  // —— 性别 —— 
  gender?: { text: string };
  genderPreferences?: Array<{ text: string }>;

  // —— 媒体 —— 
  profileBase64?: string;
  profileMime?: string;
  profilePictureUrl?: string;

  albumBase64List?: string[];
  albumMimeList?: string[];
  albumUrls?: string[];

  // —— 喜好 —— 
  interests?: string[];
  preferredVenues?: string[];

  // —— 统计 & 关系 —— 
  totalLikesReceived?: number;
  followerCount?: number;
  followingCount?: number;
  followers?: Array<{
    shortId: number;
    nickname: string;
    profilePictureUrl: string;
  }>;
  following?: Array<{
    shortId: number;
    nickname: string;
    profilePictureUrl: string;
  }>;

  // —— 时间戳 —— 
  dates?: {
    createdAt: string;
    lastActiveAt: string;
  };
}
