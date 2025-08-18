import storage from '../utils/storage';

class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  // Initialize tokens from storage
  async init(): Promise<void> {
    const { accessToken, refreshToken } = await storage.getTokens();
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  // Save tokens
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    await storage.saveTokens(accessToken, refreshToken);
  }

  // Get access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  // Update access token
  async updateAccessToken(newAccessToken: string): Promise<void> {
    this.accessToken = newAccessToken;
    await storage.set('@zusa_access_token', newAccessToken);
  }

  // Clear tokens
  async clearTokens(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    await storage.clearAuth();
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

export default new TokenManager();