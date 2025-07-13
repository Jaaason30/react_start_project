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

// Helper: decode JWT payload
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const decoded = Buffer.from(parts[1], 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// Debug: print token status on module load
console.log('[UserProfileContext] Token Status →', checkTokenStatus());

type ContextType = {
  profileData: PartialUserDto | null;
  setProfileData: React.Dispatch<React.SetStateAction<PartialUserDto | null>>;
  refreshProfile: () => Promise<void>;
  clearProfileData: () => void;
  avatarVersion: number;
  bumpAvatarVersion: () => void;
  isLoading: boolean;
};

const defaultValue: ContextType = {
  profileData: null,
  setProfileData: () => {},
  refreshProfile: async () => {},
  clearProfileData: () => {},
  avatarVersion: 0,
  bumpAvatarVersion: () => {},
  isLoading: true,
};

export const UserProfileContext = createContext<ContextType>(defaultValue);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [profileData, setProfileData] = useState<PartialUserDto | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Init: fetch current user's profile using JWT-derived UUID
  useEffect(() => {
    const initProfile = async () => {
      const token = tokenManager.getAccessToken();
      if (!token) {
        console.warn('[UserProfileProvider] no access token—skipping init');
        setIsLoading(false);
        return;
      }

      const payload = decodeJWT(token);
      const uuid =
        payload?.sub || payload?.user_name || payload?.username || null;
      if (!uuid) {
        console.warn('[UserProfileProvider] unable to decode UUID from token');
        setIsLoading(false);
        return;
      }

      const endpoint = `${API_ENDPOINTS.USER_PROFILE}?userUuid=${uuid}`;
      console.log('[UserProfileProvider] initProfile →', endpoint);

      try {
        const { data, status, error } = await apiClient.get<PartialUserDto>(
          endpoint
        );
        console.log(
          '[UserProfileProvider] initProfile status=',
          status,
          'error=',
          error,
          'payload=',
          data
        );
        if (status === 200 && data) {
          setProfileData(data);
        }
      } catch (err) {
        console.error(
          '[UserProfileProvider] init fetch profile failed:',
          err
        );
      } finally {
        setIsLoading(false);
      }
    };

    initProfile();
  }, []);

  // Bump avatar version to force-refresh image
  const bumpAvatarVersion = useCallback(() => {
    setAvatarVersion((v) => v + 1);
  }, []);

  // Clear profile data (e.g., on logout)
  const clearProfileData = useCallback(() => {
    setProfileData(null);
    setAvatarVersion(0);
  }, []);

  // Manually refresh profile (e.g., pull-to-refresh)
  const refreshProfile = useCallback(async () => {
    const uuid = profileData?.uuid;
    if (!uuid) {
      console.warn('[refreshProfile] no uuid, aborting');
      return;
    }

    setIsLoading(true);
    const endpoint = `${API_ENDPOINTS.USER_PROFILE}?userUuid=${uuid}`;
    console.log('[refreshProfile] calling →', endpoint);

    try {
      const { data, status, error } = await apiClient.get<PartialUserDto>(
        endpoint
      );
      console.log(
        '[refreshProfile] status=',
        status,
        'error=',
        error,
        'payload=',
        data
      );
      if (status === 200 && data) {
        if (
          data.profilePictureUrl &&
          data.profilePictureUrl !== profileData.profilePictureUrl
        ) {
          bumpAvatarVersion();
        }
        setProfileData((prev) => (prev ? { ...prev, ...data } : data));
      }
    } catch (err) {
      console.error('[refreshProfile] Failed to refresh profile:', err);
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

export const useUserProfile = () => useContext(UserProfileContext);
