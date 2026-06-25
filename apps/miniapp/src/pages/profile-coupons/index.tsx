import { Text, View } from '@tarojs/components';
import { request } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { t } from '../../i18n/messages';
import './index.scss';

type ClientCoupon = {
  id: number;
  status: string;
  expiredAt?: string;
  couponTemplate?: { name: string; couponType: string; discountValue: number; minimumSpend?: number };
};

export default function ProfileCouponsPage() {
  const { data, loading, error, reload } = useFetch(async () => {
    const res: any = await request('/marketing/my-coupons');
    return (res || []) as ClientCoupon[];
  }, []);

  return (
    <View className="coupons-page">
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => reload().catch(() => {})} />
      ) : !data?.length ? (
        <EmptyState title={t('coupons.empty')} />
      ) : (
        <View className="coupon-list">
          {data.map(coupon => (
            <View key={coupon.id} className="coupon-card">
              <Text className="coupon-card__name">{coupon.couponTemplate?.name || t('coupons.defaultName')}</Text>
              <Text className="coupon-card__value">
                {coupon.couponTemplate?.couponType === 'PERCENT'
                  ? t('coupons.percentOff', { n: coupon.couponTemplate.discountValue })
                  : t('coupons.amountOff', { n: Number(coupon.couponTemplate?.discountValue || 0).toFixed(0) })}
              </Text>
              {coupon.couponTemplate?.minimumSpend ? (
                <Text className="coupon-card__meta">{t('coupons.minSpend', { n: Number(coupon.couponTemplate.minimumSpend).toFixed(0) })}</Text>
              ) : null}
              <Text className="coupon-card__status">{t(`coupons.status.${coupon.status}`)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
