import { Text, View } from '@tarojs/components';
import { membershipStatusLabel, membershipTypeLabel, t } from '../../i18n/messages';
import type { Membership } from '../../types';
import './index.scss';

interface MembershipCardVisualProps {
  membership: Membership;
  brandName?: string;
}

export function MembershipCardVisual({ membership, brandName = 'LuminaStudio' }: MembershipCardVisualProps) {
  const typeClass =
    membership.type === 'DURATION_BASED'
      ? 'wallet-card--duration'
      : membership.type === 'STORED_VALUE'
        ? 'wallet-card--stored'
        : 'wallet-card--count';

  const detail =
    membership.type === 'DURATION_BASED'
      ? t('profile.unlimitedSessions')
      : membership.type === 'STORED_VALUE'
        ? t('profile.balanceLeft', { amount: Number(membership.balanceAmount ?? 0).toFixed(0) })
        : t('profile.sessionsLeft', {
            remaining: membership.remainingTimes ?? 0,
            total: membership.totalTimes ?? 0,
          });

  return (
    <View className={`wallet-card ${typeClass}`}>
      <View className="wallet-card__ribbon">
        <Text>{membershipTypeLabel(membership.type)}</Text>
      </View>
      <View className="wallet-card__top">
        <Text className="wallet-card__brand">{brandName}</Text>
        <Text className="wallet-card__status">{membershipStatusLabel(membership.status)}</Text>
      </View>
      <Text className="wallet-card__name">{membership.name}</Text>
      <Text className="wallet-card__detail">{detail}</Text>
      {membership.expiredAt && (
        <Text className="wallet-card__expiry">
          {t('profile.validUntil', {
            date: new Date(membership.expiredAt).toLocaleDateString('zh-CN'),
          })}
        </Text>
      )}
    </View>
  );
}
