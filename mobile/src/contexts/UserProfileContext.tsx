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
  cityId?: number;
  city?: { id: number; name: string };

  // Gender
  genderId?: number;
  gender?: { id: number; name: string };
  genderPreferenceIds?: number[];
  genderPreferences?: Array<{ id: number; name: string }>;

  // Media
  profileBase64?: string;
  profileMime?: string;
  profilePictureUrl?: string;

  albumBase64List?: (string | undefined)[];
  albumMimeList?: (string | undefined)[];
  albumUrls?: string[];

  // Interests and Venues
  interestIds?: number[];
  interests?: Array<{ id: number; name: string }>;

  venueIds?: number[];
  preferredVenues?: Array<{ id: number; name: string }>;

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
};

const defaultContextValue: ContextType = {
  profileData: {} as PartialUserDto,
  setProfileData: () => {},
};

export const UserProfileContext = createContext<ContextType>(defaultContextValue);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileData, setProfileData] = useState<PartialUserDto>({
    genderPreferenceIds: [],
    genderPreferences: [],
    albumBase64List: [],
    albumMimeList: [],
    albumUrls: [],
    interestIds: [],
    interests: [],
    venueIds: [],
    preferredVenues: [],
    followers: [],
    following: [],
  });

  return (
    <UserProfileContext.Provider value={{ profileData, setProfileData }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = (): ContextType => useContext(UserProfileContext);
