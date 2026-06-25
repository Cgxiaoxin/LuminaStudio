import { useDidShow } from '@tarojs/taro';
import { useTabBarStore } from '../stores/tabbar';

export function useTabBarPage(index: number) {
  useDidShow(() => {
    useTabBarStore.getState().setSelected(index);
  });
}
