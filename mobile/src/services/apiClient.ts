// src/api/ApiClient.ts

import { BASE_URL } from '../constants/api';
import tokenManager from './tokenManager';
import type { ApiResponse } from '../types/auth.types';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /** Refresh the access token, ensuring only one refresh runs at a time */
  private async refreshAccessToken(): Promise<string | null> {
    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

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
        return data.accessToken;
      } catch (err) {
        console.error('Token refresh failed:', err);
        await tokenManager.clearTokens();
        return null;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  /** Core request method with automatic token injection & refresh */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Build headers as a Headers instance
      const headers = new Headers({
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      });

      const accessToken = tokenManager.getAccessToken();
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }

      // First attempt
      let response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      // If unauthorized, try refreshing
      if (response.status === 401 && accessToken) {
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
}

export const apiClient = new ApiClient();
