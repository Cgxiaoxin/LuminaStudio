import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { formatBusinessHours, type StoreInfo } from '../../types/store';
import { t } from '../../i18n/messages';
import './index.scss';

interface StoreInfoBarProps {
  store?: StoreInfo | null;
  variant?: 'hero' | 'card' | 'inline';
}

export function StoreInfoBar({ store, variant = 'card' }: StoreInfoBarProps) {
  const handleCall = () => {
    if (!store?.phone) {
      Taro.showToast({ title: t('venue.noPhone'), icon: 'none' });
      return;
    }
    Taro.makePhoneCall({ phoneNumber: store.phone });
  };

  const handleShare = () => {
    Taro.showShareMenu({ withShareTicket: true }).catch(() => {
      Taro.showToast({ title: t('venue.shareTip'), icon: 'none' });
    });
  };

  if (!store) return null;

  const hours = formatBusinessHours(store.businessHours) || t('venue.defaultHours');

  return (
    <View className={`store-info-bar store-info-bar--${variant}`}>
      {variant === 'card' && hours ? (
        <Text className="store-info-bar__hours">{hours}</Text>
      ) : null}
      <View className="store-info-bar__row">
        <Text className="store-info-bar__address">{store.address || t('venue.noAddress')}</Text>
        <View className="store-info-bar__actions">
          <View className="store-info-bar__action" onClick={handleCall}>
            <View className="store-info-bar__icon store-info-bar__icon--phone" />
            <Text>{t('venue.phone')}</Text>
          </View>
          <View className="store-info-bar__action" onClick={handleShare}>
            <View className="store-info-bar__icon store-info-bar__icon--share" />
            <Text>{t('venue.share')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
