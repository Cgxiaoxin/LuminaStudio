import { Text, View } from '@tarojs/components';
import { formatMonthLabel, getMonthCalendarDays, isSameDay, startOfDay } from '../../utils/date';
import { t } from '../../i18n/messages';
import './index.scss';

const WEEK_HEADERS = ['一', '二', '三', '四', '五', '六', '日'];

interface MonthCalendarProps {
  selected: Date;
  viewMonth: Date;
  onSelect: (date: Date) => void;
  onViewMonthChange: (month: Date) => void;
}

export function MonthCalendar({ selected, viewMonth, onSelect, onViewMonthChange }: MonthCalendarProps) {
  const today = startOfDay(new Date());
  const days = getMonthCalendarDays(viewMonth);

  const shiftMonth = (delta: number) => {
    const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1);
    onViewMonthChange(next);
  };

  return (
    <View className="month-calendar">
      <View className="month-calendar__nav">
        <View className="month-calendar__arrow" onClick={() => shiftMonth(-1)}>
          <Text>‹</Text>
        </View>
        <Text className="month-calendar__label">{formatMonthLabel(viewMonth)}</Text>
        <View className="month-calendar__arrow" onClick={() => shiftMonth(1)}>
          <Text>›</Text>
        </View>
      </View>

      <View className="month-calendar__weekdays">
        {WEEK_HEADERS.map((label) => (
          <Text key={label} className="month-calendar__weekday">{label}</Text>
        ))}
      </View>

      <View className="month-calendar__grid">
        {days.map((day) => {
          const isSelected = isSameDay(day.date, selected);
          const isToday = isSameDay(day.date, today);
          return (
            <View
              key={day.date.toISOString()}
              className={[
                'month-calendar__cell',
                !day.inMonth ? 'month-calendar__cell--muted' : '',
                isSelected ? 'month-calendar__cell--selected' : '',
                isToday ? 'month-calendar__cell--today' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelect(day.date)}
            >
              <Text className="month-calendar__day">{day.date.getDate()}</Text>
              {isToday && !isSelected ? (
                <Text className="month-calendar__today-tag">{t('classes.today')}</Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
