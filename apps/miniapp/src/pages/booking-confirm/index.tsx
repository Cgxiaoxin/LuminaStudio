import { useState, useEffect } from 'react';
import { Text, View, Button } from '@tarojs/components';
import { useRouter, useNavigate, showToast } from '@tarojs/taro';
import { request } from '../../services/api';
import './index.scss';

export default function BookingConfirmPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const scheduleId = Number(router.params.scheduleId);
  const [schedule, setSchedule] = useState<any>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [selectedMembership, setSelectedMembership] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const token = '';

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
      await request('/bookings', { method: 'POST', data: payload });
      showToast({ title: 'Booked!', icon: 'success' });
      setTimeout(() => navigate({ url: '/pages/bookings/index' }), 1500);
    } catch (err: any) {
      showToast({ title: err.message || 'Failed', icon: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!schedule) return <View className="confirm-page"><Text>Loading...</Text></View>;

  const price = Number(schedule.service?.price || 0);
  const isFree = price === 0;
  const hasMembership = selectedMembership !== null;

  return (
    <View className="confirm-page">
      <View className="confirm-section">
        <Text className="confirm-title">Booking Summary</Text>
        <View className="info-row">
          <Text className="info-label">Class</Text>
          <Text className="info-value">{schedule.service?.name}</Text>
        </View>
        <View className="info-row">
          <Text className="info-label">Time</Text>
          <Text className="info-value">{new Date(schedule.startAt).toLocaleString('zh-CN')}</Text>
        </View>
        <View className="info-row">
          <Text className="info-label">Coach</Text>
          <Text className="info-value">{schedule.coach?.displayName}</Text>
        </View>
      </View>

      {memberships.length > 0 && (
        <View className="confirm-section">
          <Text className="confirm-title">Use Membership</Text>
          {memberships.map((m: any) => (
            <View key={m.id} className={`membership-card ${selectedMembership === m.id ? 'selected' : ''}`}
              onClick={() => setSelectedMembership(selectedMembership === m.id ? null : m.id)}
            >
              <Text className="membership-name">{m.name}</Text>
              <Text className="membership-info">
                {m.type === 'DURATION_BASED' ? 'Unlimited' : `${m.remainingTimes ?? 0}/${m.totalTimes ?? 0} sessions`}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View className="confirm-section">
        <Text className="price-display">
          {isFree ? 'Free' : hasMembership ? 'Free (with membership)' : `¥${price.toFixed(2)}`}
        </Text>
        {!isFree && !hasMembership && (
          <Text className="price-original">Pay on booking</Text>
        )}
      </View>

      <Button className={`submit-btn ${submitting ? 'disabled' : ''}`} disabled={submitting} onClick={handleSubmit}>
        {submitting ? 'Booking...' : 'Confirm Booking'}
      </Button>
    </View>
  );
}
