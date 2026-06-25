import { Text, View } from '@tarojs/components';
import './index.scss';

type SkeletonStateProps = {
  rows?: number;
  variant?: 'card' | 'list';
};

export function SkeletonState({ rows = 3, variant = 'card' }: SkeletonStateProps) {
  return (
    <View className={`skeleton skeleton--${variant}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} className="skeleton__row">
          {variant === 'card' ? <View className="skeleton__badge" /> : null}
          <View className="skeleton__content">
            <View className="skeleton__line skeleton__line--title" />
            <View className="skeleton__line skeleton__line--sub" />
          </View>
        </View>
      ))}
    </View>
  );
}
