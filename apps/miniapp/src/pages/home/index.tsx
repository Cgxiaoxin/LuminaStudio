import { useState, useEffect } from 'react';
import { Text, View, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { request } from '../../services/api';
import { t } from '../../i18n/messages';
import './index.scss';

export default function HomePage() {
  const [selectedStore, setSelectedStore] = useState('');
  const [stores, setStores] = useState<{ id: number; name: string }[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => {
    request('/stores').then((res: any) => {
      const list = res.data?.data || res.data || [];
      setStores(list);
      if (list.length > 0) setSelectedStore(String(list[0].id));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedStore) return;
    request(`/schedules?storeId=${selectedStore}&limit=5`).then((res: any) => {
      setSchedules(res.data || []);
    }).catch(() => {});
  }, [selectedStore]);

  const storeRange = stores.map(s => s.name);

  return (
    <View className="home-page">
      <View className="header">
        <Text className="brand">{t('common.brand')}</Text>
        <Picker mode="selector" range={storeRange} value={stores.findIndex(s => String(s.id) === selectedStore)}
          onChange={(e) => setSelectedStore(String(stores[e.detail.value]?.id || selectedStore))}
        >
          <View className="store-selector">
            <Text className="store-name">{stores.find(s => String(s.id) === selectedStore)?.name || t('home.selectStore')}</Text>
            <Text className="arrow">▼</Text>
          </View>
        </Picker>
      </View>

      {schedules.length > 0 && (
        <View className="section">
          <Text className="section-title">{t('home.upcomingClasses')}</Text>
          <View className="class-list">
            {schedules.map((s: any) => (
              <View key={s.id} className="class-card" onClick={() => Taro.navigateTo({ url: `/pages/class-detail/index?scheduleId=${s.id}` })}>
                <View className="class-info">
                  <Text className="class-name">{s.service?.name || '-'}</Text>
                  <Text className="class-coach">{s.coach?.displayName || '-'}</Text>
                  <Text className="class-time">{new Date(s.startAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <View className="class-spots">
                  <Text className={s.capacity - s.bookedCount <= 2 ? 'spots-low' : 'spots'}>
                    {t('home.spotsLeft', { n: s.capacity - s.bookedCount })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className="section">
        <Text className="section-title">{t('home.quickActions')}</Text>
        <View className="action-grid">
          <View className="action-item" onClick={() => Taro.switchTab({ url: '/pages/classes/index' })}>
            <Text className="action-icon">📚</Text>
            <Text className="action-text">{t('home.browseClasses')}</Text>
          </View>
          <View className="action-item" onClick={() => Taro.switchTab({ url: '/pages/bookings/index' })}>
            <Text className="action-icon">📅</Text>
            <Text className="action-text">{t('home.myBookings')}</Text>
          </View>
          <View className="action-item" onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}>
            <Text className="action-icon">👤</Text>
            <Text className="action-text">{t('home.profile')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
