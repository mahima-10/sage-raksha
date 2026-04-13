import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppMode, User } from '../types';
import { MOCK_USER } from '../constants/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  selectedMode: AppMode | null;
  token: string | null;
  
  // Actions
  setMode: (mode: AppMode) => void;
  login: (phone: string, otp: string) => void;
  logout: () => void;
  addLinkedHome: (homeId: string) => void;
  updateName: (name: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      selectedMode: null,
      token: null,

      setMode: (mode) => set({ selectedMode: mode }),
      
      login: (phone, otp) => {
        // Mock login
        if (otp) {
          set({
            user: { ...MOCK_USER, phone },
            isAuthenticated: true,
            token: 'mock-jwt-token',
          });
        }
      },
      
      logout: () => set({
        user: null,
        isAuthenticated: false,
        token: null,
        // we keep selectedMode so they don't have to choose again
      }),
      
      addLinkedHome: (homeId) => set((state) => ({
        user: state.user ? {
          ...state.user,
          linkedHomeIds: [...new Set([...state.user.linkedHomeIds, homeId])]
        } : null
      })),
      
      updateName: (name) => set((state) => ({
        user: state.user ? {
          ...state.user,
          name
        } : null
      })),
    }),
    {
      name: 'sage-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
