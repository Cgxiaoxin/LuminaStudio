import { Text, View } from '@tarojs/components';
import { formatTimeBadge } from '../../utils/date';
import './index.scss';

export function TimeBadge({ iso }: { iso: string }) {
  const { period, time } = formatTimeBadge(iso);

  return (
    <View className="time-badge">
      <Text className="time-badge__period">{period}</Text>
      <Text className="time-badge__time">{time}</Text>
    </View>
  );
}
