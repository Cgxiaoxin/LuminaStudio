import { useState, useEffect } from 'react';
import { Text, View } from '@tarojs/components';
import { request } from '../../services/api';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { bookingStatusLabel, t } from '../../i18n/messages';
import type { ClientStats } from '../../types/profile';
import type { Booking } from '../../types';
import './index.scss';

export default function ProfileStatsPage() {
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      request('/auth/me/stats'),
      request('/bookings?status=CHECKED_IN,COMPLETED&limit=30'),
    ])
      .then(([statsRes, bookingsRes]: any[]) => {
        setStats(statsRes);
        setBookings(bookingsRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  const statItems = [
    { label: t('profile.totalClasses'), value: stats?.totalClasses ?? 0 },
    { label: t('profile.monthClasses'), value: stats?.monthClasses ?? 0 },
    { label: t('profile.monthAbsences'), value: stats?.monthAbsences ?? 0 },
    {
      label: t('profile.monthRank'),
      value: stats?.monthRank ? t('profile.rankValue', { n: stats.monthRank }) : t('profile.rankEmpty'),
    },
  ];

  return (
    <View className="profile-sub-page">
      <View className="stats-grid">
        {statItems.map(item => (
          <View key={item.label} className="stats-item">
            <Text className="stats-value">{item.value}</Text>
            <Text className="stats-label">{item.label}</Text>
          </View>
        ))}
      </View>

      <Text className="section-title">{t('profileStats.history')}</Text>
      {bookings.length === 0 ? (
        <EmptyState title={t('profileStats.empty')} />
      ) : (
        <View className="history-list">
          {bookings.map(b => (
            <View key={b.id} className="history-card">
              <View className="history-card__head">
                <Text className="history-card__name">{b.service?.name || '-'}</Text>
                <Text className="history-card__status">{bookingStatusLabel(b.status)}</Text>
              </View>
              <Text className="history-card__time">
                {b.schedule ? new Date(b.schedule.startAt).toLocaleString('zh-CN') : '-'}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
