import { useState, useEffect, useCallback } from 'react';
import { Text, View, Button } from '@tarojs/components';
import Taro, { useRouter, showToast } from '@tarojs/taro';
import { request } from '../../services/api';
import { payOrder, isPaymentCanceled } from '../../services/payment';
import { ErrorState } from '../../components/ErrorState';
import { t } from '../../i18n/messages';
import './index.scss';

export default function BookingConfirmPage() {
  const router = useRouter();
  const scheduleId = Number(router.params.scheduleId);
  const [schedule, setSchedule] = useState<any>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [selectedMembership, setSelectedMembership] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!Taro.getStorageSync('token')) {
      const redirect = encodeURIComponent(`/pages/booking-confirm/index?scheduleId=${scheduleId || ''}`);
      Taro.redirectTo({ url: `/pages/login/index?redirect=${redirect}` });
      return;
    }
    if (!scheduleId) {
      setError(t('errors.loadFailed'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      request(`/schedules/${scheduleId}`),
      request('/memberships?status=ACTIVE').catch(() => ({ data: [] })),
    ]).then(([scheduleRes, membershipRes]: any[]) => {
      setSchedule(scheduleRes);
      setMemberships(membershipRes.data || []);
    }).catch((err: any) => {
      setSchedule(null);
      setError(err?.message || t('errors.loadFailed'));
    }).finally(() => setLoading(false));
  }, [scheduleId]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (submitting || !schedule) return;
    const spotsLeft = schedule.capacity - schedule.bookedCount;
    if (spotsLeft <= 0 || schedule.status !== 'OPEN') {
      showToast({ title: t('classDetail.full'), icon: 'none' });
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = { scheduleId, source: 'WECHAT_MINIAPP' };
      if (selectedMembership) payload.membershipId = selectedMembership;
      const result: any = await request('/bookings', { method: 'POST', data: payload });

      if (result.order) {
        await payOrder(result.order.id);
      }

      showToast({ title: t('bookingConfirm.success'), icon: 'success' });
      setTimeout(() => Taro.switchTab({ url: '/pages/bookings/index' }), 1500);
    } catch (err: any) {
      const msg = isPaymentCanceled(err) ? t('bookings.payCanceled') : (err.message || t('common.failed'));
      showToast({ title: msg, icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View className="confirm-page"><Text>{t('common.loading')}</Text></View>;
  if (error || !schedule) {
    return (
      <View className="confirm-page">
        <ErrorState message={error || t('errors.loadFailed')} onRetry={load} />
      </View>
    );
  }

  const price = Number(schedule.service?.price || 0);
  const isFree = price === 0;
  const hasMembership = selectedMembership !== null;

  return (
    <View className="confirm-page">
      <View className="confirm-section">
        <Text className="confirm-title">{t('bookingConfirm.summary')}</Text>
        <View className="info-row">
          <Text className="info-label">{t('common.class')}</Text>
          <Text className="info-value">{schedule.service?.name}</Text>
        </View>
        <View className="info-row">
          <Text className="info-label">{t('common.time')}</Text>
          <Text className="info-value">{new Date(schedule.startAt).toLocaleString('zh-CN')}</Text>
        </View>
        <View className="info-row">
          <Text className="info-label">{t('common.coach')}</Text>
          <Text className="info-value">{schedule.coach?.displayName}</Text>
        </View>
      </View>

      {memberships.length > 0 && (
        <View className="confirm-section">
          <Text className="confirm-title">{t('bookingConfirm.useMembership')}</Text>
          {memberships.map((m: any) => (
            <View key={m.id} className={`membership-card ${selectedMembership === m.id ? 'selected' : ''}`}
              onClick={() => setSelectedMembership(selectedMembership === m.id ? null : m.id)}
            >
              <Text className="membership-name">{m.name}</Text>
              <Text className="membership-info">
                {m.type === 'DURATION_BASED'
                  ? t('bookingConfirm.unlimited')
                  : m.type === 'STORED_VALUE'
                    ? t('bookingConfirm.balanceLeft', { amount: Number(m.balanceAmount || 0).toFixed(0) })
                    : t('bookingConfirm.sessionsLeft', { remaining: m.remainingTimes ?? 0, total: m.totalTimes ?? 0 })}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View className="confirm-section">
        <Text className="price-display">
          {isFree ? t('common.free') : hasMembership ? t('bookingConfirm.freeWithMembership') : `¥${price.toFixed(2)}`}
        </Text>
        {!isFree && !hasMembership && (
          <Text className="price-original">{t('bookingConfirm.payOnBooking')}</Text>
        )}
      </View>

      <Button className={`submit-btn ${submitting ? 'disabled' : ''}`} disabled={submitting} onClick={handleSubmit}>
        {submitting ? t('bookingConfirm.submitting') : t('bookingConfirm.confirm')}
      </Button>
    </View>
  );
}
