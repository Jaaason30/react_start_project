export interface PartialUserDto {
  // Identifiers
  uuid?: string;
  shortId?: number;

  // Basic info
  email?: string;
  nickname?: string;
  bio?: string;
  dateOfBirth?: string;
  age?: number;

  // Location
  city?: { name: string };

  // Gender
  gender?: { text: string };
  genderPreferences?: Array<{ text: string }>;

  // Media
  profileBase64?: string;
  profileMime?: string;
  profilePictureUrl?: string;

  albumBase64List?: (string | undefined)[];
  albumMimeList?: (string | undefined)[];
  albumUrls?: string[];

  // Preferences
  interests?: string[];
  preferredVenues?: string[];

  // Statistics & Relationships
  totalLikesReceived?: number;
  followerCount?: number;
  followingCount?: number;
  followers?: Array<{ uuid: string; nickname: string; profilePictureUrl: string }>;
  following?: Array<{ uuid: string; nickname: string; profilePictureUrl: string }>;
}
