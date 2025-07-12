// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import tokenManager from '../services/tokenManager';
import { useUserProfile } from '../contexts/UserProfileContext';
import type { LoginRequest, RegisterRequest } from '../types/auth.types';

export const useAuth = () => {
  const { setProfileData, clearProfileData, refreshProfile } = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // On app start: load tokens, set auth flag, fetch profile if logged in
  const initializeAuth = useCallback(async () => {
    try {
      await tokenManager.init();
      const auth = tokenManager.isAuthenticated();
      setIsAuthenticated(auth);

      if (auth) {
        await refreshProfile();
      }
    } catch (err) {
      console.error('Auth initialization failed:', err);
    } finally {
      setIsInitialized(true);
    }
  }, [refreshProfile]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Return { success, error? } so screens can show alerts
  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      try {
        const { data: loginData, error } = await authService.login(credentials);
        if (error || !loginData) {
          return { success: false as const, error: error || 'Login failed' };
        }

        await tokenManager.saveTokens(
          loginData.accessToken,
          loginData.refreshToken
        );

        setProfileData({
          uuid: loginData.userUuid,
          email: loginData.email,
          nickname: loginData.nickname,
        });
        setIsAuthenticated(true);

        return { success: true as const };
      } catch (err) {
        console.error('Login error:', err);
        return { success: false as const, error: 'Network error' };
      } finally {
        setIsLoading(false);
      }
    },
    [setProfileData]
  );

  const register = useCallback(
    async (req: RegisterRequest) => {
      setIsLoading(true);
      try {
        const { data: regData, error } = await authService.register(req);
        if (error || !regData) {
          return { success: false as const, error: error || 'Register failed' };
        }

        await tokenManager.saveTokens(
          regData.accessToken,
          regData.refreshToken
        );

        setProfileData({
          uuid: regData.userUuid,
          email: regData.email,
          nickname: regData.nickname,
        });
        setIsAuthenticated(true);

        return { success: true as const };
      } catch (err) {
        console.error('Register error:', err);
        return { success: false as const, error: 'Network error' };
      } finally {
        setIsLoading(false);
      }
    },
    [setProfileData]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await tokenManager.clearTokens();
      clearProfileData();
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [clearProfileData]);

  return {
    isLoading,
    isAuthenticated,
    isInitialized,
    login,
    register,
    logout,
  };
};
