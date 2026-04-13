import { create } from 'zustand';
import { Home } from '../types';
import { MOCK_HOME } from '../constants/mockData';

interface HomeState {
  homes: Home[];
  
  // Actions
  addHome: (home: Home) => void;
  updateHome: (id: string, data: Partial<Home>) => void;
  getHomeById: (id: string) => Home | undefined;
}

export const useHomeStore = create<HomeState>()((set, get) => ({
      homes: [MOCK_HOME], // Initialize with mock data

      addHome: (home) => set((state) => ({
        homes: [...state.homes, home]
      })),

      updateHome: (id, data) => set((state) => ({
        homes: state.homes.map(h => h.id === id ? { ...h, ...data } : h)
      })),

      getHomeById: (id) => {
        return get().homes.find(h => h.id === id);
      },
    }));
