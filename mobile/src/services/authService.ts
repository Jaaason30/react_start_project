import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import type { 
  LoginRequest, 
  RegisterRequest, 
  JwtResponse, 
  User 
} from '../types/auth.types';

class AuthService {
  async login(credentials: LoginRequest) {
    return apiClient.post<JwtResponse>(API_ENDPOINTS.LOGIN, credentials);
  }

  async register(data: RegisterRequest) {
    return apiClient.post<JwtResponse>(API_ENDPOINTS.REGISTER, data);
  }

  async getCurrentUser(uuid: string) {
    return apiClient.get<User>(`${API_ENDPOINTS.USER_PROFILE}?userUuid=${uuid}`);
  }

  async refreshToken(refreshToken: string) {
    return apiClient.post<JwtResponse>(API_ENDPOINTS.REFRESH, { refreshToken });
  }
}

export default new AuthService();