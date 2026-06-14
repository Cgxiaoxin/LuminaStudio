import { useState, useEffect } from 'react';
import { Text, View, Button } from '@tarojs/components';
import { showToast } from '@tarojs/taro';
import { request } from '../../services/api';
import type { Booking } from '../../types';
import './index.scss';

const statusLabels: Record<string, string> = {
  CREATED: 'Created',
  PENDING_PAYMENT: 'Pending Payment',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked In',
  COMPLETED: 'Completed',
  CANCELED: 'Canceled',
};

const statusColors: Record<string, string> = {
  CREATED: '#6f776f',
  PENDING_PAYMENT: '#c77700',
  CONFIRMED: '#2e6f57',
  CHECKED_IN: '#1f8a5b',
  COMPLETED: '#6f776f',
  CANCELED: '#c0392b',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    const statusFilter = tab === 'upcoming' ? 'CREATED,CONFIRMED,PENDING_PAYMENT' : 'CHECKED_IN,COMPLETED,CANCELED';
    request(`/bookings?limit=20&status=${statusFilter}`).then((res: any) => {
      setBookings(res.data || []);
    }).catch(() => {});
  }, [tab]);

  const handleCancel = async (id: number) => {
    try {
      await request(`/bookings/${id}/cancel`, { method: 'PATCH', data: {} });
      showToast({ title: 'Canceled', icon: 'success' });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELED' as any } : b));
    } catch {
      showToast({ title: 'Failed', icon: 'error' });
    }
  };

  return (
    <View className="bookings-page">
      <View className="tabs">
        {['upcoming', 'history'].map(t => (
          <View key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            <Text>{t === 'upcoming' ? 'Upcoming' : 'History'}</Text>
          </View>
        ))}
      </View>

      <View className="booking-list">
        {bookings.map(b => (
          <View key={b.id} className="booking-card">
            <View className="booking-header">
              <Text className="booking-service">{b.service?.name || '-'}</Text>
              <Text className="booking-status" style={{ color: statusColors[b.status] }}>{statusLabels[b.status]}</Text>
            </View>
            <Text className="booking-time">
              {b.schedule ? new Date(b.schedule.startAt).toLocaleString('zh-CN') : '-'}
            </Text>
            {b.usedMembership && (
              <Text className="booking-meta">Membership: {b.usedMembership.name}</Text>
            )}
            {Number(b.paidAmount) > 0 && (
              <Text className="booking-meta">Paid: ¥{Number(b.paidAmount).toFixed(2)}</Text>
            )}
            {['CREATED', 'CONFIRMED', 'PENDING_PAYMENT'].includes(b.status) && (
              <View className="booking-actions">
                <Button className="cancel-btn" onClick={() => handleCancel(b.id)}>Cancel</Button>
              </View>
            )}
          </View>
        ))}
        {bookings.length === 0 && <Text className="empty-state">No bookings yet</Text>}
      </View>
    </View>
  );
}
