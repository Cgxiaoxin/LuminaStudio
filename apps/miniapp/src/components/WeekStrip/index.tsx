import { Text, View } from '@tarojs/components';
import { getWeekStripDays } from '../../utils/date';
import './index.scss';

interface WeekStripProps {
  selected: Date;
  onSelect: (date: Date) => void;
}

export function WeekStrip({ selected, onSelect }: WeekStripProps) {
  const days = getWeekStripDays(selected);

  return (
    <View className="week-strip">
      {days.map((day) => (
        <View
          key={day.date.toISOString()}
          className={`week-strip__day ${day.isSelected ? 'week-strip__day--active' : ''} ${day.isToday ? 'week-strip__day--today' : ''}`}
          onClick={() => onSelect(day.date)}
        >
          <Text className="week-strip__weekday">{day.weekday}</Text>
          <Text className="week-strip__num">{day.dayNum}</Text>
        </View>
      ))}
    </View>
  );
}
