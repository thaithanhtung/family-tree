import api from './axios';
import type { LoginInput, RegisterInput, AuthResponse, User } from '../types';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const authApi = {
  async login(data: LoginInput): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    const result = response.data;
    
    localStorage.setItem(TOKEN_KEY, result.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
    
    return result;
  },

  async register(data: RegisterInput): Promise<{ message: string; user: User }> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await api.post('/auth/refresh', { refreshToken });
    const { accessToken } = response.data;
    
    localStorage.setItem(TOKEN_KEY, accessToken);
    
    return accessToken;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};
