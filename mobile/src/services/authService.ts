// src/services/AuthService.ts

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import type {
  LoginRequest,
  RegisterRequest,
  JwtResponse,
  User,
} from '../types/auth.types';

class AuthService {
  /** 用户登录 */
  async login(credentials: LoginRequest) {
    return apiClient.post<JwtResponse>(API_ENDPOINTS.LOGIN, credentials);
  }

  /** 用户注册 */
  async register(data: RegisterRequest) {
    return apiClient.post<JwtResponse>(API_ENDPOINTS.REGISTER, data);
  }

  /** 获取当前登录用户信息（JWT 认证，后端自动从 Token 提取 UUID） */
  async getCurrentUser() {
    return apiClient.get<User>(API_ENDPOINTS.USER_ME);
  }

  /** 更新当前用户资料 */
  async updateCurrentUser(data: Partial<User>) {
    return apiClient.patch<void>(API_ENDPOINTS.USER_ME_UPDATE, data);
  }

  /** 根据 shortId 查询用户资料 */
  async getUserByShortId(shortId: number) {
    return apiClient.get<User>(`${API_ENDPOINTS.USER_BY_SHORT_ID}/${shortId}`);
  }

  /** 关注指定 shortId 用户 */
  async followUser(shortId: number) {
    return apiClient.post<void>(`${API_ENDPOINTS.USER_FOLLOW_SHORT}/${shortId}`);
  }

  /** 取消关注指定 shortId 用户 */
  async unfollowUser(shortId: number) {
    return apiClient.delete<void>(`${API_ENDPOINTS.USER_FOLLOW_SHORT}/${shortId}`);
  }

  /** 刷新 Token */
  async refreshToken(refreshToken: string) {
    return apiClient.post<JwtResponse>(API_ENDPOINTS.REFRESH, { refreshToken });
  }
}

export default new AuthService();
