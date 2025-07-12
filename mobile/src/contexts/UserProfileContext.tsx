// src/contexts/UserProfileContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import { apiClient } from '../services/apiClient';
import { API_ENDPOINTS } from '../constants/api';
import type { PartialUserDto } from '../types/User.types.ts';

type ContextType = {
  profileData: PartialUserDto;
  setProfileData: React.Dispatch<React.SetStateAction<PartialUserDto>>;
  refreshProfile: () => Promise<void>;
  clearProfileData: () => void;
  avatarVersion: number;
  bumpAvatarVersion: () => void;
};

const defaultValue: ContextType = {
  profileData: {} as PartialUserDto,
  setProfileData: () => {},
  refreshProfile: async () => {},
  clearProfileData: () => {},
  avatarVersion: 0,
  bumpAvatarVersion: () => {},
};

export const UserProfileContext = createContext<ContextType>(defaultValue);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [profileData, setProfileData] = useState<PartialUserDto>({});
  const [avatarVersion, setAvatarVersion] = useState(0);

  // Only bump when URL actually changes
  const bumpAvatarVersion = useCallback(() => {
    setAvatarVersion((v) => v + 1);
  }, []);

  const clearProfileData = useCallback(() => {
    setProfileData({});
    setAvatarVersion(0);
  }, []);

  // Fetch latest profile from backend
  const refreshProfile = useCallback(async () => {
    if (!profileData.uuid) return;
    try {
      const { data } = await apiClient.get<PartialUserDto>(
        `${API_ENDPOINTS.USER_PROFILE}?userUuid=${profileData.uuid}`
      );
      if (data) {
        if (
          data.profilePictureUrl &&
          data.profilePictureUrl !== profileData.profilePictureUrl
        ) {
          bumpAvatarVersion();
        }
        setProfileData((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  }, [
    profileData.uuid,
    profileData.profilePictureUrl,
    bumpAvatarVersion,
  ]);

  return (
    <UserProfileContext.Provider
      value={{
        profileData,
        setProfileData,
        refreshProfile,
        clearProfileData,
        avatarVersion,
        bumpAvatarVersion,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);
