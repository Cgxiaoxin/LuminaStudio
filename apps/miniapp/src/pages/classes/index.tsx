import { useState, useEffect, useMemo } from 'react';
import { Text, View } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { request } from '../../services/api';
import { useAppStore } from '../../stores/app';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonState } from '../../components/SkeletonState';
import { ErrorState } from '../../components/ErrorState';
import { TimeBadge } from '../../components/TimeBadge';
import { useTabBarPage } from '../../hooks/useTabBarPage';
import { MonthCalendar } from '../../components/MonthCalendar';
import { formatApiDate, formatSelectedDateLabel, isSameDay, startOfDay } from '../../utils/date';
import { t } from '../../i18n/messages';
import './index.scss';

type ViewMode = 'schedule' | 'list';

export default function ClassesPage() {
  useTabBarPage(1);
  const { selectedStoreId, hydrateStoreId } = useAppStore();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('schedule');
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => startOfDay(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSchedules = () => {
    setLoading(true);
    setError(null);
    const storeQuery = selectedStoreId ? `&storeId=${selectedStoreId}` : '';
    const dateFrom = formatApiDate(selectedDate);
    const dateTo = `${dateFrom}T23:59:59.999Z`;
    const rangeQuery = viewMode === 'schedule' ? `&dateFrom=${dateFrom}&dateTo=${dateTo}` : '';
    return request(`/schedules?limit=50${storeQuery}${rangeQuery}`)
      .then((res: any) => setSchedules(res.data || []))
      .catch((err: any) => {
        setSchedules([]);
        setError(err?.message || t('errors.loadFailed'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    hydrateStoreId();
  }, []);

  useEffect(() => {
    loadSchedules().catch(() => {});
  }, [selectedStoreId, selectedDate, viewMode]);

  usePullDownRefresh(() => {
    loadSchedules().finally(() => Taro.stopPullDownRefresh());
  });

  const filtered = useMemo(() => {
    const byType = filter === 'ALL'
      ? schedules
      : schedules.filter(s => s.service?.type === filter);

    if (viewMode === 'list') return byType;

    return byType
      .filter(s => isSameDay(new Date(s.startAt), selectedDate))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [schedules, filter, viewMode, selectedDate]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setViewMonth(startOfDay(new Date(date.getFullYear(), date.getMonth(), 1)));
  };

  const typeLabels: Record<string, string> = {
    GROUP_CLASS: t('classes.group'),
    PRIVATE_SESSION: t('classes.private'),
  };

  const renderCard = (s: any) => (
    <View
      key={s.id}
      className="class-card"
      onClick={() => Taro.navigateTo({ url: `/pages/class-detail/index?scheduleId=${s.id}` })}
    >
      {viewMode === 'schedule' && (
        <View className="class-card__time-col">
          <TimeBadge iso={s.startAt} />
        </View>
      )}
      <View className="class-card__body">
        <View className="class-header">
          <Text className="class-name">{s.service?.name || '-'}</Text>
          <View className={`class-type ${s.service?.type === 'PRIVATE_SESSION' ? 'class-type--private' : ''}`}>
            <Text>{typeLabels[s.service?.type] || s.service?.type}</Text>
          </View>
        </View>
        <View className="class-details">
          <Text className="detail-item">{t('classes.coachPrefix')}{s.coach?.displayName || '-'}</Text>
          <Text className="detail-item">{s.service?.durationMinutes || 0}{t('common.min')}</Text>
          {viewMode === 'list' && (
            <Text className="detail-item">
              {new Date(s.startAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
        <View className="class-footer">
          <Text className="class-price">
            {Number(s.service?.price || 0) > 0 ? `¥${Number(s.service?.price).toFixed(0)}` : t('common.free')}
          </Text>
          <Text className={s.capacity - s.bookedCount <= 2 ? 'spots-low' : 'spots'}>
            {t('classes.spotsLeft', { n: s.capacity - s.bookedCount })}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="classes-page">
      <View className="header">
        <Text className="title">{t('classes.title')}</Text>
        <Text className="subtitle">
          {viewMode === 'schedule'
            ? t('classes.sessionsOnDay', { n: filtered.length })
            : t('classes.sessionsAvailable', { n: filtered.length })}
        </Text>
      </View>

      <View className="view-toggle">
        <View
          className={`view-toggle__item ${viewMode === 'schedule' ? 'active' : ''}`}
          onClick={() => setViewMode('schedule')}
        >
          <Text>{t('classes.viewSchedule')}</Text>
        </View>
        <View
          className={`view-toggle__item ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <Text>{t('classes.viewList')}</Text>
        </View>
      </View>

      {viewMode === 'schedule' && (
        <View className="schedule-panel">
          <View className="schedule-panel__head">
            <Text className="schedule-panel__title">{t('classes.scheduleTitle')}</Text>
            <View
              className={`calendar-btn ${calendarOpen ? 'calendar-btn--active' : ''}`}
              onClick={() => setCalendarOpen((open) => !open)}
            >
              <Text>{calendarOpen ? t('classes.collapseCalendar') : t('classes.pickDate')}</Text>
            </View>
          </View>
          {calendarOpen ? (
            <MonthCalendar
              selected={selectedDate}
              viewMonth={viewMonth}
              onSelect={handleSelectDate}
              onViewMonthChange={setViewMonth}
            />
          ) : (
            <Text className="schedule-panel__date">
              {t('classes.selectedDate', { date: formatSelectedDateLabel(selectedDate) })}
            </Text>
          )}
        </View>
      )}

      <View className="filter-bar">
        {['ALL', 'GROUP_CLASS', 'PRIVATE_SESSION'].map(f => (
          <View key={f} className={`filter-item ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            <Text>{f === 'ALL' ? t('classes.all') : typeLabels[f] || f}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <SkeletonState rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadSchedules().catch(() => {})} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={viewMode === 'schedule' ? t('classes.emptyDay') : t('classes.empty')}
          description={viewMode === 'schedule' ? t('classes.emptyDayDesc') : t('classes.emptyDesc')}
          actionLabel={viewMode === 'schedule' ? t('classes.viewList') : undefined}
          onAction={viewMode === 'schedule' ? () => setViewMode('list') : undefined}
        />
      ) : (
        <View className={`class-list ${viewMode === 'schedule' ? 'class-list--schedule' : ''}`}>
          {filtered.map(renderCard)}
        </View>
      )}
    </View>
  );
}
