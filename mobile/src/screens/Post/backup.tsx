// src/contexts/UserProfileContext.tsx
import React, { createContext, useContext, useState } from 'react';

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
};

const defaultContextValue: ContextType = {
  profileData: {} as PartialUserDto,
  setProfileData: () => {},
  refreshProfile: async () => {},
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

  const refreshProfile = async () => {
    if (!profileData?.uuid) return;

    try {
      const response = await fetch(`http://10.0.2.2:8080/api/user/profile?userUuid=${profileData.uuid}`);
      
      if (!response.ok) {
        throw new Error('Failed to refresh profile');
      }
      
      const data = await response.json();
      setProfileData(prevData => ({...prevData, ...data}));
      
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <UserProfileContext.Provider value={{ profileData, setProfileData, refreshProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = (): ContextType => useContext(UserProfileContext);