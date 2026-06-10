import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/src/types';
import { authService } from '@/src/services/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const user = await authService.login(email, password);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const user = await authService.register(username, email, password);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: async () => {
        await authService.logout();
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
      
      updateUser: (user: User) => {
        set({ user });
      },
      
      checkAuth: async () => {
        const isAuthenticated = await authService.isAuthenticated();
        if (isAuthenticated) {
          const user = await authService.getUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);