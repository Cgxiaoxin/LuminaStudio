import { create } from 'zustand';
import Taro from '@tarojs/taro';

const STORAGE_KEY = 'selectedStoreId';

interface AppState {
  selectedStoreId: string;
  setSelectedStoreId: (id: string) => void;
  hydrateStoreId: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedStoreId: Taro.getStorageSync(STORAGE_KEY) || '',

  setSelectedStoreId: (id: string) => {
    Taro.setStorageSync(STORAGE_KEY, id);
    set({ selectedStoreId: id });
  },

  hydrateStoreId: () => {
    const stored = Taro.getStorageSync(STORAGE_KEY);
    if (stored) set({ selectedStoreId: stored });
  },
}));
