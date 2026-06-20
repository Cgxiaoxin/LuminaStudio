import { Text, View } from '@tarojs/components';
import { t } from '../../i18n/messages';
import './index.scss';

export function LoadingState({ label }: { label?: string }) {
  return (
    <View className="loading-state">
      <View className="loading-state__spinner" />
      <Text className="loading-state__text">{label || t('common.loading')}</Text>
    </View>
  );
}
