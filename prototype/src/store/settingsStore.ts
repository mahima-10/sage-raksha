import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  escalationTimeoutMinutes: number;
  colorScheme: 'light' | 'dark';
  
  setEscalationTimeout: (minutes: number) => void;
  toggleColorScheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      escalationTimeoutMinutes: 5,
      colorScheme: 'light',
      setEscalationTimeout: (minutes) => set({ escalationTimeoutMinutes: minutes }),
      toggleColorScheme: () => set((state) => ({ colorScheme: state.colorScheme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'sage-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
