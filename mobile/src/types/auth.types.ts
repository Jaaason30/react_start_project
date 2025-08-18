// src/types/auth.types.ts

/**
 * Request payload for login. 'username' can be either the user's email or nickname.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Request payload for user registration.
 */
export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}

/**
 * Response returned by the server after a successful authentication.
 */
export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userShortId: number;
  email: string;
  nickname: string;
}

/**
 * Request payload when refreshing an access token.
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * User information returned by the API.
 */
export interface User {
  uuid: string;
  email: string;
  nickname: string;
  profilePictureUrl?: string;
  bio?: string;
  city?: string;
  age?: number;
  followers?: number;
  following?: number;
}

/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
}
