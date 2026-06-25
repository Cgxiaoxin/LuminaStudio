import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { request } from '../../services/api';
import { useAppStore } from '../../stores/app';
import { useFetch } from '../../hooks/useFetch';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { t } from '../../i18n/messages';
import './index.scss';

type Coach = {
  id: number;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
};

export default function CoachesPage() {
  const { selectedStoreId } = useAppStore();
  const { data, loading, error, reload } = useFetch(async () => {
    const query = selectedStoreId ? `?storeId=${selectedStoreId}` : '';
    const res: any = await request(`/coaches${query}`);
    return (res.data || []) as Coach[];
  }, [selectedStoreId]);

  return (
    <View className="coaches-page">
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => reload().catch(() => {})} />
      ) : !data?.length ? (
        <EmptyState title={t('coaches.empty')} />
      ) : (
        <View className="coach-list">
          {data.map(coach => (
            <View
              key={coach.id}
              className="coach-card"
              onClick={() => Taro.navigateTo({ url: `/pages/coach-detail/index?id=${coach.id}` })}
            >
              <View className="coach-avatar">
                <Text>{coach.displayName?.[0] || 'C'}</Text>
              </View>
              <View className="coach-info">
                <Text className="coach-name">{coach.displayName}</Text>
                <Text className="coach-bio">{coach.bio || t('coaches.noBio')}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
