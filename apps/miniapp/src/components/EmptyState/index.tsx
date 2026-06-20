import { Text, View } from '@tarojs/components';
import './index.scss';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="empty-state">
      <View className="empty-state__icon" />
      <Text className="empty-state__title">{title}</Text>
      {description ? <Text className="empty-state__desc">{description}</Text> : null}
      {actionLabel && onAction ? (
        <View className="empty-state__action" onClick={onAction}>
          <Text>{actionLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}
