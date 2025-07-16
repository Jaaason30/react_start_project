// src/contexts/UserProfileContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { apiClient, checkTokenStatus } from '../services/apiClient';
import tokenManager from '../services/tokenManager';
import { API_ENDPOINTS } from '../constants/api';
import type { PartialUserDto } from '../types/User.types';
import { Buffer } from 'buffer';

/* ---------- 工具：解码 JWT ---------- */
function decodeJWT(token: string) {
  try {
    const [, payload] = token.split('.');
    return payload ? JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) : null;
  } catch {
    return null;
  }
}

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

  /* ----- 强制刷新头像用 ----- */
  const bumpAvatarVersion = useCallback(() => setAvatarVersion((v) => v + 1), []);

  /* ----- 清空 Profile（登出） ----- */
  const clearProfileData = useCallback(() => {
    setProfileData(null);
    setAvatarVersion(0);
  }, []);

  /* ---------- 初始化：根据 token 自动加载 /me ---------- */
  useEffect(() => {
    const init = async () => {
      const token = tokenManager.getAccessToken();
      if (!token) return setIsLoading(false);

      const uid = decodeJWT(token)?.sub;
      if (!uid) return setIsLoading(false);

      try {
        // 1) 先尝试旧接口 /user/profile?userUuid=xxx
        let { data, status, error } = await apiClient.get<PartialUserDto>(
          `${API_ENDPOINTS.USER_PROFILE}?userUuid=${uid}`,
        );

        // 2) 如果404则降级到 /user/me
        if (status === 404) {
          ({ data, status, error } = await apiClient.get<PartialUserDto>(API_ENDPOINTS.USER_ME));
        }

        if (status === 200 && data) setProfileData(data);
        else console.warn('[UserProfileProvider] initProfile error:', error);
      } catch (err) {
        console.error('[UserProfileProvider] initProfile network error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  /* ---------- 手动刷新 ---------- */
  const refreshProfile = useCallback(async () => {
    if (!profileData?.uuid) {
      console.warn('[refreshProfile] no uuid, abort');
      return;
    }
    setIsLoading(true);

    try {
      const { data, status, error } = await apiClient.get<PartialUserDto>(
        `${API_ENDPOINTS.USER_PROFILE}?userUuid=${profileData.uuid}`,
      );

      if (status === 200 && data) {
        if (data.profilePictureUrl !== profileData.profilePictureUrl) bumpAvatarVersion();
        setProfileData((prev) => ({ ...prev!, ...data }));
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
