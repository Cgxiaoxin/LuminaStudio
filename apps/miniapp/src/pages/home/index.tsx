import { useState, useEffect, useCallback } from 'react';
import { Text, View, Picker } from '@tarojs/components';
import Taro, { useShareAppMessage, usePullDownRefresh } from '@tarojs/taro';
import { request } from '../../services/api';
import { useAppStore } from '../../stores/app';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonState } from '../../components/SkeletonState';
import { TimeBadge } from '../../components/TimeBadge';
import { StoreInfoBar } from '../../components/StoreInfoBar';
import { formatBusinessHours, type StoreInfo } from '../../types/store';
import { useTabBarPage } from '../../hooks/useTabBarPage';
import { t } from '../../i18n/messages';
import './index.scss';

const quickActions = [
  { key: 'buy', labelKey: 'home.buyMembership', icon: '卡', color: 'blue', url: '/pages/buy-membership/index', navigate: 'to' as const },
  { key: 'book', labelKey: 'home.goBooking', icon: '约', color: 'yellow', url: '/pages/classes/index', navigate: 'tab' as const },
  { key: 'stats', labelKey: 'home.bookingStats', icon: '统', color: 'green', url: '/pages/profile-stats/index', navigate: 'to' as const },
  { key: 'profile', labelKey: 'home.profile', icon: '我', color: 'purple', url: '/pages/profile/index', navigate: 'to' as const },
];

export default function HomePage() {
  useTabBarPage(0);
  const { selectedStoreId, setSelectedStoreId, hydrateStoreId } = useAppStore();
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const currentStore = stores.find(s => String(s.id) === selectedStoreId);

  useShareAppMessage(() => ({
    title: `${currentStore?.name || t('common.brand')} - ${t('venue.shareTitle')}`,
    path: '/pages/home/index',
  }));

  useEffect(() => {
    hydrateStoreId();
    loadStores();
  }, []);

  const loadStores = useCallback(() => {
    setLoadingStores(true);
    return request('/stores')
      .then((res: any) => {
        const list = res.data?.data || res.data || [];
        setStores(list);
        if (list.length > 0 && !selectedStoreId) {
          setSelectedStoreId(String(list[0].id));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStores(false));
  }, [selectedStoreId, setSelectedStoreId]);

  const loadSchedules = useCallback(() => {
    if (!selectedStoreId) return Promise.resolve();
    setLoadingSchedules(true);
    return request(`/schedules?storeId=${selectedStoreId}&limit=5`)
      .then((res: any) => setSchedules(res.data || []))
      .catch(() => setSchedules([]))
      .finally(() => setLoadingSchedules(false));
  }, [selectedStoreId]);

  useEffect(() => {
    loadSchedules().catch(() => {});
  }, [loadSchedules]);

  usePullDownRefresh(() => {
    Promise.all([loadStores(), loadSchedules()])
      .finally(() => Taro.stopPullDownRefresh());
  });

  const storeRange = stores.map(s => s.name);
  const hours = formatBusinessHours(currentStore?.businessHours) || t('venue.defaultHours');

  const handleQuickAction = (action: typeof quickActions[number]) => {
    if (action.navigate === 'tab') {
      Taro.switchTab({ url: action.url });
    } else {
      Taro.navigateTo({ url: action.url });
    }
  };

  return (
    <View className="home-page">
      <View className="hero">
        <Text className="brand">{t('common.brand')}</Text>
        <Text className="hero-subtitle">{t('home.heroSubtitle')}</Text>
        {loadingStores ? (
          <SkeletonState rows={2} />
        ) : (
          <>
            <Picker
              mode="selector"
              range={storeRange}
              value={Math.max(0, stores.findIndex(s => String(s.id) === selectedStoreId))}
              onChange={(e) => setSelectedStoreId(String(stores[e.detail.value]?.id || selectedStoreId))}
            >
              <View className="store-selector">
                <Text className="store-label">{t('home.currentStore')}</Text>
                <View className="store-chip">
                  <Text className="store-name">{currentStore?.name || t('home.selectStore')}</Text>
                  <Text className="arrow">▼</Text>
                </View>
              </View>
            </Picker>
            <Text className="hero-hours">{hours}</Text>
            <StoreInfoBar store={currentStore} variant="hero" />
          </>
        )}
      </View>

      <View className="section">
        <Text className="section-title">{t('home.quickActions')}</Text>
        <View className="action-grid action-grid--four">
          {quickActions.map(action => (
            <View
              key={action.key}
              className={`action-item action-item--${action.color}`}
              onClick={() => handleQuickAction(action)}
            >
              <View className={`action-icon-wrap action-icon-wrap--${action.color}`}>
                <Text className="action-icon">{action.icon}</Text>
              </View>
              <Text className="action-text">{t(action.labelKey)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="section">
        <View className="section-header">
          <Text className="section-title">{t('home.upcomingClasses')}</Text>
          {schedules.length > 0 && (
            <Text className="section-link" onClick={() => Taro.switchTab({ url: '/pages/classes/index' })}>
              {t('home.viewAll')}
            </Text>
          )}
        </View>

        {loadingSchedules ? (
          <SkeletonState rows={3} />
        ) : schedules.length === 0 ? (
          <EmptyState
            title={t('home.noUpcoming')}
            description={t('home.noUpcomingDesc')}
            actionLabel={t('home.browseClasses')}
            onAction={() => Taro.switchTab({ url: '/pages/classes/index' })}
          />
        ) : (
          <View className="class-list">
            {schedules.map((s: any) => (
              <View
                key={s.id}
                className="class-card"
                onClick={() => Taro.navigateTo({ url: `/pages/class-detail/index?scheduleId=${s.id}` })}
              >
                <TimeBadge iso={s.startAt} />
                <View className="class-info">
                  <Text className="class-name">{s.service?.name || '-'}</Text>
                  <Text className="class-coach">{s.coach?.displayName || '-'}</Text>
                </View>
                <View className="class-spots">
                  <Text className={s.capacity - s.bookedCount <= 2 ? 'spots-low' : 'spots'}>
                    {t('home.spotsLeft', { n: s.capacity - s.bookedCount })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
