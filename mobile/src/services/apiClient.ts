// src/api/ApiClient.ts

import { BASE_URL } from '../constants/api';
import tokenManager from './tokenManager';
import type { ApiResponse } from '../types/auth.types';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let tokenCheckInterval: NodeJS.Timeout | null = null;

// JWT 解码辅助函数
const decodeJWT = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch (error) { 
    return null; 
    
  }
};

// 检查 token 是否即将过期
const isTokenExpiringSoon = (token: string, bufferMinutes: number = 5): boolean => {
  const payload = decodeJWT(token);
  if (!payload?.exp) return true;
  
  const expTime = payload.exp * 1000; // 转换为毫秒
  const bufferTime = bufferMinutes * 60 * 1000; // 缓冲时间（毫秒）
  const currentTime = Date.now();
  
  return (expTime - currentTime) <= bufferTime;
};

export class ApiClient {
  private baseUrl: string;
  private autoRefreshEnabled: boolean = true;
  private bufferMinutes: number = 5; // 提前5分钟刷新

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
    this.startTokenRefreshTimer();
  }

  /** 启动定时检查 token */
  private startTokenRefreshTimer() {
    // 清除之前的定时器
    if (tokenCheckInterval) {
      clearInterval(tokenCheckInterval);
    }

    // 每分钟检查一次
    tokenCheckInterval = setInterval(() => {
      this.checkAndRefreshToken();
    }, 60 * 1000); // 60秒

    // 立即检查一次
    this.checkAndRefreshToken();
  }

  /** 检查并刷新即将过期的 token */
  private async checkAndRefreshToken() {
    if (!this.autoRefreshEnabled) return;

    const accessToken = tokenManager.getAccessToken();
    if (!accessToken) return;

    if (isTokenExpiringSoon(accessToken, this.bufferMinutes)) {
      console.log(`[ApiClient] Token 即将在 ${this.bufferMinutes} 分钟内过期，主动刷新`);
      await this.refreshAccessToken();
    }
  }

  /** Refresh the access token, ensuring only one refresh runs at a time */
  private async refreshAccessToken(): Promise<string | null> {
    if (isRefreshing && refreshPromise) {
      console.log('[ApiClient] 已有刷新操作进行中，等待结果...');
      return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('[ApiClient] 开始刷新 token...');
        const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        await tokenManager.saveTokens(data.accessToken, data.refreshToken);
        
        console.log('[ApiClient] Token 刷新成功');
        
        // 刷新成功后，重新启动定时器
        this.startTokenRefreshTimer();
        
        return data.accessToken;
      } catch (err) {
        console.error('[ApiClient] Token refresh failed:', err);
        await tokenManager.clearTokens();
        
        // 清除定时器
        if (tokenCheckInterval) {
          clearInterval(tokenCheckInterval);
          tokenCheckInterval = null;
        }
        
        return null;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  /** 获取 token 状态信息（用于调试） */
  getTokenStatus() {
    const accessToken = tokenManager.getAccessToken();
    if (!accessToken) {
      return { hasToken: false };
    }

    const payload = decodeJWT(accessToken);
    if (!payload?.exp) {
      return { hasToken: true, valid: false };
    }

    const expTime = payload.exp * 1000;
    const currentTime = Date.now();
    const isExpired = currentTime >= expTime;
    const minutesUntilExpiry = Math.floor((expTime - currentTime) / 1000 / 60);

    return {
      hasToken: true,
      valid: !isExpired,
      isExpired,
      expiresAt: new Date(expTime),
      minutesUntilExpiry: Math.max(0, minutesUntilExpiry),
      willRefreshSoon: isTokenExpiringSoon(accessToken, this.bufferMinutes),
    };
  }

  /** 设置自动刷新配置 */
  setAutoRefreshConfig(enabled: boolean, bufferMinutes?: number) {
    this.autoRefreshEnabled = enabled;
    if (bufferMinutes !== undefined) {
      this.bufferMinutes = bufferMinutes;
    }
    
    if (enabled) {
      this.startTokenRefreshTimer();
    } else if (tokenCheckInterval) {
      clearInterval(tokenCheckInterval);
      tokenCheckInterval = null;
    }
  }

  /** Core request method with automatic token injection & refresh */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // 请求前先检查 token 状态（可选的额外保护）
      const accessToken = tokenManager.getAccessToken();
      if (accessToken && isTokenExpiringSoon(accessToken, 1)) {
        // 如果 token 在1分钟内过期，立即刷新
        console.log('[ApiClient] Token 即将过期，请求前主动刷新');
        await this.refreshAccessToken();
      }

      // Build headers as a Headers instance
      const headers = new Headers(options.headers as HeadersInit);
      
      // 只有在不是 FormData 的情况下才设置 Content-Type
      if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }

      const currentToken = tokenManager.getAccessToken();
      if (currentToken) {
        headers.set('Authorization', `Bearer ${currentToken}`);
      }

      // First attempt
      let response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      // If unauthorized, try refreshing (被动刷新作为后备方案)
      if (response.status === 401 && currentToken) {
        console.log('[ApiClient] 收到 401，尝试刷新 token');
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          headers.set('Authorization', `Bearer ${newToken}`);
          response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          return {
            data: null,
            error: 'Authentication failed. Please login again.',
            status: 401,
          };
        }
      }

      // Parse JSON if present
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : null;

      if (!response.ok) {
        return {
          data: null,
          error: data?.message || `Request failed with status ${response.status}`,
          status: response.status,
        };
      }

      return { data, error: null, status: response.status };
    } catch (err) {
      console.error('API request error:', err);
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Network error',
        status: 0,
      };
    }
  }

  // Convenience wrappers
  get<T = any>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /** 文件上传方法 - 专门处理 FormData */
  async upload<T = any>(
    endpoint: string,
    formData: FormData,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    // 直接传递 FormData 给 request 方法
    // request 方法会检测到 body 是 FormData 实例，就不会设置 Content-Type
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
    });
  }

  /** 清理资源（应用退出时调用） */
  cleanup() {
    if (tokenCheckInterval) {
      clearInterval(tokenCheckInterval);
      tokenCheckInterval = null;
    }
  }
}

export const apiClient = new ApiClient();

// 导出调试函数
export const checkTokenStatus = () => {
  const status = apiClient.getTokenStatus();
  console.log('=== Token Status ===');
  console.log('Has Token:', status.hasToken);
  if (status.hasToken) {
    console.log('Valid:', status.valid);
    console.log('Expires at:', status.expiresAt?.toLocaleString());
    console.log('Minutes until expiry:', status.minutesUntilExpiry);
    console.log('Will refresh soon:', status.willRefreshSoon);
  }
  console.log('==================');
  return status;
};