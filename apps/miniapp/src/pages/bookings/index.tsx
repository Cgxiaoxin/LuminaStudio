import { useState, useEffect } from 'react';
import { Text, View, Button } from '@tarojs/components';
import { showToast } from '@tarojs/taro';
import { request } from '../../services/api';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { bookingStatusLabel, t } from '../../i18n/messages';
import type { Booking } from '../../types';
import './index.scss';

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
  const [loading, setLoading] = useState(true);

  const loadBookings = () => {
    setLoading(true);
    const statusFilter = tab === 'upcoming' ? 'CREATED,CONFIRMED,PENDING_PAYMENT' : 'CHECKED_IN,COMPLETED,CANCELED';
    request(`/bookings?limit=20&status=${statusFilter}`)
      .then((res: any) => setBookings(res.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBookings(); }, [tab]);

  const handleCancel = async (id: number) => {
    try {
      await request(`/bookings/${id}/cancel`, { method: 'PATCH', data: {} });
      showToast({ title: t('bookings.canceled'), icon: 'success' });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELED' as any } : b));
    } catch {
      showToast({ title: t('common.failed'), icon: 'error' });
    }
  };

  return (
    <View className="bookings-page">
      <View className="tabs">
        {['upcoming', 'history'].map(tabKey => (
          <View key={tabKey} className={`tab ${tab === tabKey ? 'active' : ''}`} onClick={() => setTab(tabKey)}>
            <Text>{tabKey === 'upcoming' ? t('bookings.upcoming') : t('bookings.history')}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <LoadingState />
      ) : bookings.length === 0 ? (
        <EmptyState
          title={t('bookings.empty')}
          description={tab === 'upcoming' ? t('bookings.emptyUpcoming') : t('bookings.emptyHistory')}
        />
      ) : (
        <View className="booking-list">
          {bookings.map(b => (
            <View key={b.id} className="booking-card">
              <View className="booking-header">
                <Text className="booking-service">{b.service?.name || '-'}</Text>
                <View className="booking-status-wrap" style={{ backgroundColor: `${statusColors[b.status]}18` }}>
                  <Text className="booking-status" style={{ color: statusColors[b.status] }}>
                    {bookingStatusLabel(b.status)}
                  </Text>
                </View>
              </View>
              <Text className="booking-time">
                {b.schedule ? new Date(b.schedule.startAt).toLocaleString('zh-CN') : '-'}
              </Text>
              {b.usedMembership && (
                <Text className="booking-meta">{t('bookings.membership')}：{b.usedMembership.name}</Text>
              )}
              {Number(b.paidAmount) > 0 && (
                <Text className="booking-meta">{t('bookings.paid')}：¥{Number(b.paidAmount).toFixed(2)}</Text>
              )}
              {['CREATED', 'CONFIRMED', 'PENDING_PAYMENT'].includes(b.status) && (
                <View className="booking-actions">
                  <Button className="cancel-btn" onClick={() => handleCancel(b.id)}>{t('common.cancel')}</Button>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
