// src/contexts/UserProfileContext.tsx
import React, { createContext, useContext, useState } from 'react';

export type PartialUserDto = {
  uuid?: string;
  nickname?: string;
  bio?: string;
  dateOfBirth?: string;
  cityId?: number;
  genderId?: number;
  genderPreferenceIds?: number[];
  profileBase64?: string;
  profileMime?: string;
  albumBase64List?: (string | undefined)[];
  albumMimeList?: (string | undefined)[];
  interestIds?: number[];
  venueIds?: number[];
};

const defaultContextValue = {
  profileData: {} as PartialUserDto,
  setProfileData: (() => {}) as React.Dispatch<React.SetStateAction<PartialUserDto>>
};

type ContextType = {
  profileData: PartialUserDto;
  setProfileData: React.Dispatch<React.SetStateAction<PartialUserDto>>;
};

const UserProfileContext = createContext<ContextType>(defaultContextValue);

export const UserProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profileData, setProfileData] = useState<PartialUserDto>({
    interestIds: [],
    venueIds: [],
    albumBase64List: [],
    albumMimeList: [],
    genderPreferenceIds: [] // ← 初始化为空数组
  });

  return (
    <UserProfileContext.Provider value={{ profileData, setProfileData }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  return useContext(UserProfileContext);
};
