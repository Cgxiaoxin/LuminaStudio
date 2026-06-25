import { Text, View } from '@tarojs/components';
import { request } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { bookingStatusLabel, t } from '../../i18n/messages';
import type { Booking } from '../../types';
import './index.scss';

export default function ProfileHistoryPage() {
  const { data, loading, error, reload } = useFetch(async () => {
    const res: any = await request('/bookings?status=CHECKED_IN,COMPLETED&limit=50');
    return (res.data || []) as Booking[];
  }, []);

  return (
    <View className="history-page">
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => reload().catch(() => {})} />
      ) : !data?.length ? (
        <EmptyState title={t('profileHistory.empty')} />
      ) : (
        <View className="history-list">
          {data.map(item => (
            <View key={item.id} className="history-card">
              <Text className="history-card__name">{item.service?.name || '-'}</Text>
              <Text className="history-card__time">
                {item.schedule ? new Date(item.schedule.startAt).toLocaleString('zh-CN') : '-'}
              </Text>
              <Text className="history-card__status">{bookingStatusLabel(item.status)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
