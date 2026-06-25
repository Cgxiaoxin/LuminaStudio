import { Text, View } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { request } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { t } from '../../i18n/messages';
import './index.scss';

export default function CoachDetailPage() {
  const router = useRouter();
  const coachId = Number(router.params.id);

  const { data: coach, loading, error, reload } = useFetch(async () => {
    if (!coachId) throw new Error('Invalid coach');
    return request(`/coaches/${coachId}`);
  }, [coachId]);

  if (loading) return <View className="coach-detail"><LoadingState /></View>;
  if (error || !coach) return <View className="coach-detail"><ErrorState message={error || undefined} onRetry={() => reload().catch(() => {})} /></View>;

  return (
    <View className="coach-detail">
      <View className="coach-detail__hero">
        <View className="coach-detail__avatar"><Text>{coach.displayName?.[0] || 'C'}</Text></View>
        <Text className="coach-detail__name">{coach.displayName}</Text>
      </View>
      <View className="coach-detail__card">
        <Text className="coach-detail__label">{t('coaches.intro')}</Text>
        <Text className="coach-detail__bio">{coach.bio || t('coaches.noBio')}</Text>
        {coach.phone ? (
          <View className="coach-detail__phone" onClick={() => Taro.makePhoneCall({ phoneNumber: coach.phone })}>
            <Text>{t('venue.phone')}：{coach.phone}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
