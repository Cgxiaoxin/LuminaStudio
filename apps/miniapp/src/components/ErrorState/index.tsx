import { Text, View } from '@tarojs/components';
import { t } from '../../i18n/messages';
import './index.scss';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className="error-state">
      <Text className="error-state__title">{t('errors.loadFailed')}</Text>
      {message ? <Text className="error-state__desc">{message}</Text> : null}
      {onRetry ? (
        <View className="error-state__action" onClick={onRetry}>
          <Text>{t('common.retry')}</Text>
        </View>
      ) : null}
    </View>
  );
}
