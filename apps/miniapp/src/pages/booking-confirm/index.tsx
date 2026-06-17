import { useState, useEffect } from 'react';
import { Text, View, Button } from '@tarojs/components';
import Taro, { useRouter, useNavigate, showToast } from '@tarojs/taro';
import { request } from '../../services/api';
import { t } from '../../i18n/messages';
import './index.scss';

export default function BookingConfirmPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const scheduleId = Number(router.params.scheduleId);
  const [schedule, setSchedule] = useState<any>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [selectedMembership, setSelectedMembership] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!scheduleId) return;
    request(`/schedules/${scheduleId}`).then(setSchedule).catch(() => {});
    request('/memberships?status=ACTIVE').then((res: any) => {
      setMemberships(res.data || []);
    }).catch(() => {});
  }, [scheduleId]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload: any = { scheduleId, source: 'WECHAT_MINIAPP' };
      if (selectedMembership) payload.membershipId = selectedMembership;
      const result: any = await request('/bookings', { method: 'POST', data: payload });

      if (result.order) {
        const payRes: any = await request('/payments/unified-order', {
          method: 'POST',
          data: { orderId: result.order.id, channel: 'wechat' },
        });
        if (payRes.unified?.devMode) {
          await request(`/payments/notify/${payRes.payment.id}`, {
            method: 'POST',
            data: { transactionId: `dev_tx_${Date.now()}`, success: true },
          });
        }
      }

      showToast({ title: t('bookingConfirm.success'), icon: 'success' });
      setTimeout(() => navigate({ url: '/pages/bookings/index' }), 1500);
    } catch (err: any) {
      showToast({ title: err.message || t('common.failed'), icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!schedule) return <View className="confirm-page"><Text>{t('common.loading')}</Text></View>;

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
