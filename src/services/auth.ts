import * as SecureStore from 'expo-secure-store';
import { api } from './api';
import { User, AuthResponse, ApiResponse } from '@/src/types';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

class AuthService {
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/users/login', {
        email,
        password,
      });

      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        await this.setTokens(token);
        await this.setUser(user);
        return user;
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async register(username: string, email: string, password: string): Promise<User> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/users/register', {
        username,
        email,
        password,
      });

      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        await this.setTokens(token);
        await this.setUser(user);
        return user;
      }
      throw new Error(response.data.message || 'Registration failed');
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }

  private async setTokens(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  async getUser(): Promise<User | null> {
    const userJson = await SecureStore.getItemAsync(USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  private async setUser(user: User): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await api.put<ApiResponse<User>>('/users/profile', data);
      if (response.data.success && response.data.data) {
        await this.setUser(response.data.data);
        return response.data.data;
      }
      throw new Error(response.data.message || 'Profile update failed');
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  }
}

export const authService = new AuthService();