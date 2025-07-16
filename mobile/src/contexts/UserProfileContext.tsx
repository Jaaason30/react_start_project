// src/contexts/UserProfileContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { apiClient } from '../services/apiClient';
import { API_ENDPOINTS } from '../constants/api';
import type { PartialUserDto } from '../types/User.types';

/* ---------- 上下文类型 ---------- */
type ContextType = {
  profileData: PartialUserDto | null;
  setProfileData: React.Dispatch<React.SetStateAction<PartialUserDto | null>>;
  refreshProfile: () => Promise<void>;
  clearProfileData: () => void;
  avatarVersion: number;
  bumpAvatarVersion: () => void;
  isLoading: boolean;
};

const defaultCtx: ContextType = {
  profileData: null,
  setProfileData: () => {},
  refreshProfile: async () => {},
  clearProfileData: () => {},
  avatarVersion: 0,
  bumpAvatarVersion: () => {},
  isLoading: true,
};

export const UserProfileContext = createContext<ContextType>(defaultCtx);

/* ---------- Provider ---------- */
export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileData, setProfileData] = useState<PartialUserDto | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  /* ----- 强制刷新头像 ----- */
  const bumpAvatarVersion = useCallback(() => setAvatarVersion(v => v + 1), []);

  /* ----- 清空 Profile（登出） ----- */
  const clearProfileData = useCallback(() => {
    setProfileData(null);
    setAvatarVersion(0);
  }, []);

  /* ----- 初始化加载 /me ----- */
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const { data, status, error } = await apiClient.get<PartialUserDto>(
          API_ENDPOINTS.USER_ME
        );
        if (status === 200 && data) {
          setProfileData(data);
        } else {
          console.warn('[UserProfileProvider] initProfile error:', error);
        }
      } catch (err) {
        console.error('[UserProfileProvider] initProfile network error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  /* ---------- 手动刷新 /me ---------- */
  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, status, error } = await apiClient.get<PartialUserDto>(
        API_ENDPOINTS.USER_ME
      );
      if (status === 200 && data) {
        // 如果头像 URL 变化，刷新版本号
        if (data.profilePictureUrl !== profileData?.profilePictureUrl) {
          bumpAvatarVersion();
        }
        setProfileData(data);
      } else {
        console.warn('[refreshProfile] error:', error);
      }
    } catch (err) {
      console.error('[refreshProfile] network error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [profileData, bumpAvatarVersion]);

  return (
    <UserProfileContext.Provider
      value={{
        profileData,
        setProfileData,
        refreshProfile,
        clearProfileData,
        avatarVersion,
        bumpAvatarVersion,
        isLoading,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

/* ---------- 便捷 Hook ---------- */
export const useUserProfile = () => useContext(UserProfileContext);
