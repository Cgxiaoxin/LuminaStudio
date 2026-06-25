import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { TAB_PATHS, useTabBarStore } from '../stores/tabbar';
import './index.scss';

export default function CustomTabBar() {
  const selected = useTabBarStore((s) => s.selected);
  const setSelected = useTabBarStore((s) => s.setSelected);

  const switchTab = (index: number) => {
    const tab = TAB_PATHS[index];
    setSelected(index);
    Taro.switchTab({ url: `/${tab}` });
  };

  const tabs = [
    { text: '首页', icon: 'home' },
    { text: '课程', icon: 'classes' },
    { text: '预约', icon: 'bookings' },
    { text: '场馆', icon: 'venue' },
  ] as const;

  return (
    <View className="custom-tab-bar">
      {tabs.map((tab, index) => (
        <View
          key={tab.icon}
          className={`custom-tab-bar__item ${selected === index ? 'is-active' : ''}`}
          onClick={() => switchTab(index)}
        >
          <View className={`custom-tab-bar__icon custom-tab-bar__icon--${tab.icon}`} />
          <Text className="custom-tab-bar__text">{tab.text}</Text>
        </View>
      ))}
    </View>
  );
}
