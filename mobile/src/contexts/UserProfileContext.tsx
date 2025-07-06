// src/contexts/UserProfileContext.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';

export type PartialUserDto = {
  // Identifiers
  shortId?: number;
  uuid?: string;

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

  // Interests and Venues
  interests?: string[];
  preferredVenues?: string[];

  // Statistics & Relationships
  totalLikesReceived?: number;
  followerCount?: number;
  followingCount?: number;
  followers?: Array<{ uuid: string; nickname: string; profilePictureUrl: string }>;
  following?: Array<{ uuid: string; nickname: string; profilePictureUrl: string }>;
};

type ContextType = {
  profileData: PartialUserDto;
  setProfileData: React.Dispatch<React.SetStateAction<PartialUserDto>>;
  refreshProfile: () => Promise<void>;
  // 新增：avatarVersion 和 控制版本号的函数
  avatarVersion: number;
  bumpAvatarVersion: () => void;
};

const defaultContextValue: ContextType = {
  profileData: {} as PartialUserDto,
  setProfileData: () => {},
  refreshProfile: async () => {},
  avatarVersion: 0,
  bumpAvatarVersion: () => {},
};

export const UserProfileContext = createContext<ContextType>(defaultContextValue);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileData, setProfileData] = useState<PartialUserDto>({
    genderPreferences: [],
    albumBase64List: [],
    albumMimeList: [],
    albumUrls: [],
    interests: [],
    preferredVenues: [],
    followers: [],
    following: [],
  });

  // avatarVersion 用于给头像 URL 打版本号，只有在真正更新后才变更
  const [avatarVersion, setAvatarVersion] = useState<number>(0);

  // 手动触发版本号更新
  const bumpAvatarVersion = useCallback(() => {
    setAvatarVersion(Date.now());
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!profileData?.uuid) return;

    try {
      const response = await fetch(
        `http://10.0.2.2:8080/api/user/profile?userUuid=${profileData.uuid}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to refresh profile');
      }

      const data: PartialUserDto = await response.json();

      // 只有在后端返回的头像 URL 与当前不同，才 bump 版本号
      if (data.profilePictureUrl && data.profilePictureUrl !== profileData.profilePictureUrl) {
        bumpAvatarVersion();
      }

      setProfileData(prev => ({
        ...prev,
        ...data
      }));
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  }, [profileData.profilePictureUrl, profileData.uuid, bumpAvatarVersion]);

  return (
    <UserProfileContext.Provider
      value={{
        profileData,
        setProfileData,
        refreshProfile,
        avatarVersion,
        bumpAvatarVersion
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = (): ContextType => useContext(UserProfileContext);
