import { useState, useEffect } from 'react';
import { Text, View } from '@tarojs/components';
import { useNavigate } from '@tarojs/taro';
import { request } from '../../services/api';
import './index.scss';

export default function ClassesPage() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    request('/schedules?limit=50').then((res: any) => {
      setSchedules(res.data || []);
    }).catch(() => {});
  }, []);

  const filtered = filter === 'ALL'
    ? schedules
    : schedules.filter(s => s.service?.type === filter);

  const typeLabels: Record<string, string> = {
    GROUP_CLASS: 'Group',
    PRIVATE_SESSION: 'Private',
  };

  return (
    <View className="classes-page">
      <View className="header">
        <Text className="title">Classes</Text>
        <Text className="subtitle">{filtered.length} sessions available</Text>
      </View>

      <View className="filter-bar">
        {['ALL', 'GROUP_CLASS', 'PRIVATE_SESSION'].map(f => (
          <View key={f} className={`filter-item ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            <Text>{f === 'ALL' ? 'All' : typeLabels[f] || f}</Text>
          </View>
        ))}
      </View>

      <View className="class-list">
        {filtered.map((s: any) => (
          <View key={s.id} className="class-card" onClick={() => navigate({ url: `/pages/class-detail/index?scheduleId=${s.id}` })}>
            <View className="class-header">
              <Text className="class-name">{s.service?.name || '-'}</Text>
              <View className="class-type">
                <Text>{typeLabels[s.service?.type] || s.service?.type}</Text>
              </View>
            </View>
            <View className="class-details">
              <Text className="detail-item">Coach: {s.coach?.displayName || '-'}</Text>
              <Text className="detail-item">{s.service?.durationMinutes || 0} min</Text>
              <Text className="detail-item">{new Date(s.startAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            <View className="class-footer">
              <Text className="class-price">¥{Number(s.service?.price || 0).toFixed(0)}</Text>
              <Text className={s.capacity - s.bookedCount <= 2 ? 'spots-low' : 'spots'}>
                {s.capacity - s.bookedCount} spots left
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
