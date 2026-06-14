import { useState, useEffect } from 'react';
import { Text, View } from '@tarojs/components';
import { useRouter, useNavigate } from '@tarojs/taro';
import { request } from '../../services/api';
import './index.scss';

export default function ClassDetailPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const scheduleId = Number(router.params.scheduleId);
  const [schedule, setSchedule] = useState<any>(null);

  useEffect(() => {
    if (!scheduleId) return;
    request(`/schedules/${scheduleId}`).then((res: any) => {
      setSchedule(res);
    }).catch(() => {});
  }, [scheduleId]);

  if (!schedule) return <View className="detail-page"><Text>Loading...</Text></View>;

  const spotsLeft = schedule.capacity - schedule.bookedCount;

  return (
    <View className="detail-page">
      <View className="detail-header">
        <Text className="detail-name">{schedule.service?.name}</Text>
        <Text className="detail-type">{schedule.service?.type === 'GROUP_CLASS' ? 'Group Class' : 'Private Session'}</Text>
      </View>

      <View className="detail-section">
        <Text className="detail-section-title">Class Info</Text>
        <View className="info-row">
          <Text className="info-label">Price</Text>
          <Text className="info-value">¥{Number(schedule.service?.price || 0).toFixed(2)}</Text>
        </View>
        <View className="info-row">
          <Text className="info-label">Duration</Text>
          <Text className="info-value">{schedule.service?.durationMinutes} min</Text>
        </View>
        <View className="info-row">
          <Text className="info-label">Time</Text>
          <Text className="info-value">{new Date(schedule.startAt).toLocaleString('zh-CN')}</Text>
        </View>
        <View className="info-row">
          <Text className="info-label">Spots Left</Text>
          <Text className={`info-value ${spotsLeft <= 2 ? 'spots-low' : ''}`} style={spotsLeft <= 2 ? { color: '#c77700' } : { color: '#2e6f57' }}>
            {spotsLeft}/{schedule.capacity}
          </Text>
        </View>
      </View>

      {schedule.coach && (
        <View className="detail-section">
          <Text className="detail-section-title">Coach</Text>
          <View className="coach-card">
            <View className="coach-avatar">{schedule.coach.avatarUrl ? '' : ''}</View>
            <View>
              <Text className="coach-name">{schedule.coach.displayName}</Text>
              {schedule.coach.bio && <Text className="coach-bio">{schedule.coach.bio}</Text>}
            </View>
          </View>
        </View>
      )}

      {schedule.service?.description && (
        <View className="detail-section">
          <Text className="detail-section-title">Description</Text>
          <Text className="description">{schedule.service.description}</Text>
        </View>
      )}

      <View className="book-btn" onClick={() => navigate({ url: `/pages/booking-confirm/index?scheduleId=${schedule.id}` })}>
        Book Now - ¥{Number(schedule.service?.price || 0).toFixed(0)}
      </View>
    </View>
  );
}
