import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AppMode, User } from '../types';
import * as authApi from '../api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  selectedMode: AppMode | null;
  isRehydrating: boolean;
  
  // Actions
  setMode: (mode: AppMode) => void;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  addLinkedHome: (homeId: string) => void;
  updateName: (name: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      selectedMode: null,
      isRehydrating: true,

      setMode: (mode) => set({ selectedMode: mode }),
      
      requestOtp: async (phone) => {
        await authApi.requestOtp(phone);
      },
      
      verifyOtp: async (phone, otp) => {
        const { user } = await authApi.verifyOtp(phone, otp);
        set({
          user,
          isAuthenticated: true,
        });
      },
      
      logout: async () => {
        const refreshToken = await SecureStore.getItemAsync('sage_refresh_token');
        if (refreshToken) {
          try {
            await authApi.logout(refreshToken);
          } catch (e) {
            console.error('Logout failed on backend, clearing anyway', e);
          }
        }
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      restoreSession: async () => {
        try {
          const accessToken = await SecureStore.getItemAsync('sage_access_token');
          if (accessToken) {
            const user = await authApi.getMe();
            set({ user, isAuthenticated: true });
          } else {
            set({ isAuthenticated: false });
          }
        } catch (e) {
          console.error('Failed to restore session', e);
          set({ isAuthenticated: false, user: null });
          // If restoring failed because of 401, the interceptor will have cleared tokens
        } finally {
          set({ isRehydrating: false });
        }
      },
      
      addLinkedHome: (homeId) => set((state) => ({
        user: state.user ? {
          ...state.user,
          linkedHomeIds: [...new Set([...state.user.linkedHomeIds, homeId])]
        } : null
      })),
      
      updateName: async (name) => {
        const updatedUser = await authApi.updateMe({ name });
        set({ user: updatedUser });
      },
    }),
    {
      name: 'sage-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        selectedMode: state.selectedMode,
        // We could persist user/isAuthenticated but restoreSession will override them
        // Keeping them in persist allows for faster initial render before API returns.
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
