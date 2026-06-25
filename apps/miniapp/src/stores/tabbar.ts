import { create } from 'zustand';

type TabBarState = {
  selected: number;
  setSelected: (index: number) => void;
};

export const useTabBarStore = create<TabBarState>((set) => ({
  selected: 0,
  setSelected: (selected) => set({ selected }),
}));

export const TAB_PATHS = [
  'pages/home/index',
  'pages/classes/index',
  'pages/bookings/index',
  'pages/venue/index',
] as const;

export function syncTabBarFromRoute(path?: string) {
  const normalized = (path || '').replace(/^\//, '');
  const index = TAB_PATHS.findIndex((tab) => normalized.startsWith(tab));
  if (index >= 0) {
    useTabBarStore.getState().setSelected(index);
  }
}
