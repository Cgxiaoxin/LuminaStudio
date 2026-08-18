import { useState, useEffect, useCallback } from 'react';
import { Image, Text, View } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { request } from '../../services/api';
import { ErrorState } from '../../components/ErrorState';
import { t } from '../../i18n/messages';
import './index.scss';

export default function ClassDetailPage() {
  const router = useRouter();
  const scheduleId = Number(router.params.scheduleId);
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!scheduleId) {
      setError(t('errors.loadFailed'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    request(`/schedules/${scheduleId}`).then((res: any) => {
      setSchedule(res);
    }).catch((err: any) => {
      setSchedule(null);
      setError(err?.message || t('errors.loadFailed'));
    }).finally(() => setLoading(false));
  }, [scheduleId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <View className="detail-page"><Text>{t('common.loading')}</Text></View>;
  if (error || !schedule) {
    return (
      <View className="detail-page">
        <ErrorState message={error || t('errors.loadFailed')} onRetry={load} />
      </View>
    );
  }

  const spotsLeft = schedule.capacity - schedule.bookedCount;
  const canBook = spotsLeft > 0 && schedule.status === 'OPEN';
  const loggedIn = Boolean(Taro.getStorageSync('token'));

  const handleBook = () => {
    if (!canBook) return;
    if (!loggedIn) {
      const redirect = encodeURIComponent(`/pages/booking-confirm/index?scheduleId=${schedule.id}`);
      Taro.navigateTo({ url: `/pages/login/index?redirect=${redirect}` });
      return;
    }
    Taro.navigateTo({ url: `/pages/booking-confirm/index?scheduleId=${schedule.id}` });
  };

  const ctaLabel = !canBook
    ? (schedule.status === 'CANCELED' ? t('classDetail.canceled') : t('classDetail.full'))
    : loggedIn
      ? `${t('classDetail.bookNow')} - ¥${Number(schedule.service?.price || 0).toFixed(0)}`
      : t('classDetail.loginToBook');

  return (
    <View className="detail-page">
      <View className="detail-header">
        <Text className="detail-name">{schedule.service?.name}</Text>
        <Text className="detail-type">{schedule.service?.type === 'GROUP_CLASS' ? t('classDetail.groupClass') : t('classDetail.privateSession')}</Text>
      </View>

      <View className="detail-section">
        <Text className="detail-section-title">{t('classDetail.classInfo')}</Text>
        <View className="info-row">
          <Text className="info-label">{t('common.price')}</Text>
          <Text className="info-value">¥{Number(schedule.service?.price || 0).toFixed(2)}</Text>
        </View>
        <View className="info-row">
          <Text className="info-label">{t('common.duration')}</Text>
          <Text className="info-value">{schedule.service?.durationMinutes} {t('common.min')}</Text>
        </View>
        <View className="info-row">
          <Text className="info-label">{t('common.time')}</Text>
          <Text className="info-value">{new Date(schedule.startAt).toLocaleString('zh-CN')}</Text>
        </View>
        <View className="info-row">
          <Text className="info-label">{t('classDetail.spotsLeft')}</Text>
          <Text className={`info-value ${spotsLeft <= 2 ? 'spots-low' : ''}`} style={spotsLeft <= 2 ? { color: '#c77700' } : { color: '#2e6f57' }}>
            {spotsLeft}/{schedule.capacity}
          </Text>
        </View>
      </View>

      {schedule.coach && (
        <View
          className="detail-section"
          onClick={() => Taro.navigateTo({ url: `/pages/coach-detail/index?id=${schedule.coach.id}` })}
        >
          <Text className="detail-section-title">{t('common.coach')}</Text>
          <View className="coach-card">
            <View className="coach-avatar">
              {schedule.coach.avatarUrl ? (
                <Image className="coach-avatar-img" src={schedule.coach.avatarUrl} mode="aspectFill" />
              ) : (
                <Text>{schedule.coach.displayName?.[0] || '?'}</Text>
              )}
            </View>
            <View>
              <Text className="coach-name">{schedule.coach.displayName}</Text>
              {schedule.coach.bio && <Text className="coach-bio">{schedule.coach.bio}</Text>}
            </View>
          </View>
        </View>
      )}

      {schedule.service?.description && (
        <View className="detail-section">
          <Text className="detail-section-title">{t('classDetail.description')}</Text>
          <Text className="description">{schedule.service.description}</Text>
        </View>
      )}

      <View className={`book-btn ${canBook ? '' : 'disabled'}`} onClick={handleBook}>
        {ctaLabel}
      </View>
    </View>
  );
}
