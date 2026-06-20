import { useState, useEffect } from 'react';
import { Text, View, Picker } from '@tarojs/components';
import Taro, { useShareAppMessage } from '@tarojs/taro';
import { request } from '../../services/api';
import { useAppStore } from '../../stores/app';
import { StoreInfoBar } from '../../components/StoreInfoBar';
import { LoadingState } from '../../components/LoadingState';
import { formatBusinessHours, type StoreInfo } from '../../types/store';
import { t } from '../../i18n/messages';
import './index.scss';

export default function VenuePage() {
  const { selectedStoreId, setSelectedStoreId, hydrateStoreId } = useAppStore();
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const currentStore = stores.find(s => String(s.id) === selectedStoreId);

  useShareAppMessage(() => ({
    title: `${currentStore?.name || t('common.brand')} - ${t('venue.shareTitle')}`,
    path: '/pages/home/index',
  }));

  useEffect(() => {
    hydrateStoreId();
    setLoading(true);
    request('/stores')
      .then((res: any) => {
        const list = res.data?.data || res.data || [];
        setStores(list);
        if (list.length > 0 && !selectedStoreId) {
          setSelectedStoreId(String(list[0].id));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const storeRange = stores.map(s => s.name);
  const hours = formatBusinessHours(currentStore?.businessHours) || t('venue.defaultHours');

  const menuLinks = [
    { label: t('venue.linkProfile'), url: '/pages/profile/index' },
    { label: t('venue.linkBuyCard'), url: '/pages/buy-membership/index' },
    { label: t('venue.linkStats'), url: '/pages/profile-stats/index' },
    { label: t('venue.linkAgreement'), url: '/pages/profile-agreement/index' },
  ];

  return (
    <View className="venue-page">
      {loading ? (
        <LoadingState />
      ) : (
        <>
          <View className="venue-hero">
            <View className="venue-hero__overlay" />
            <View className="venue-card">
              <View className="venue-card__head">
                <View className="venue-card__title-wrap">
                  <Text className="venue-card__name">{currentStore?.name || t('home.selectStore')}</Text>
                  <Text className="venue-card__hours">{hours}</Text>
                </View>
                <Picker
                  mode="selector"
                  range={storeRange}
                  value={Math.max(0, stores.findIndex(s => String(s.id) === selectedStoreId))}
                  onChange={(e) => setSelectedStoreId(String(stores[e.detail.value]?.id || selectedStoreId))}
                >
                  <View className="venue-switch">
                    <Text>{t('venue.switch')}</Text>
                  </View>
                </Picker>
              </View>
              <StoreInfoBar store={currentStore} variant="inline" />
            </View>
          </View>

          <View className="venue-section">
            <Text className="venue-section__title">{t('venue.about')}</Text>
            <View className="venue-detail-card">
              <View className="venue-detail-row">
                <Text className="venue-detail-label">{t('venue.storeName')}</Text>
                <Text className="venue-detail-value">{currentStore?.name || '-'}</Text>
              </View>
              <View className="venue-detail-row">
                <Text className="venue-detail-label">{t('venue.businessHours')}</Text>
                <Text className="venue-detail-value">{hours}</Text>
              </View>
              <View className="venue-detail-row">
                <Text className="venue-detail-label">{t('venue.addressLabel')}</Text>
                <Text className="venue-detail-value">{currentStore?.address || t('venue.noAddress')}</Text>
              </View>
              <View className="venue-detail-row">
                <Text className="venue-detail-label">{t('venue.phoneLabel')}</Text>
                <Text className="venue-detail-value">{currentStore?.phone || t('venue.noPhone')}</Text>
              </View>
            </View>
          </View>

          <View className="venue-menu">
            {menuLinks.map(item => (
              <View
                key={item.url}
                className="venue-menu__item"
                onClick={() => Taro.navigateTo({ url: item.url })}
              >
                <Text>{item.label}</Text>
                <Text className="venue-menu__arrow">›</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}
