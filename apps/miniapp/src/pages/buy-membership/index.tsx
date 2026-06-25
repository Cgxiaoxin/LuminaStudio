import { useState, useEffect } from 'react';
import { Text, View, Button } from '@tarojs/components';
import Taro, { showToast } from '@tarojs/taro';
import { request } from '../../services/api';
import { payOrder, isPaymentCanceled } from '../../services/payment';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { membershipTypeLabel, t } from '../../i18n/messages';
import './index.scss';

type MembershipTemplate = {
  id: number;
  name: string;
  type: string;
  description?: string;
  price: number | string;
  totalTimes?: number | null;
  validDays?: number | null;
  balanceAmount?: number | string;
};

export default function BuyMembershipPage() {
  const [templates, setTemplates] = useState<MembershipTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<number | null>(null);

  useEffect(() => {
    request('/membership-templates?status=ACTIVE')
      .then((res: any) => setTemplates(res.data || []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (tpl: MembershipTemplate) => {
    if (buyingId) return;

    const price = Number(tpl.price);
    const { confirm } = await Taro.showModal({
      title: t('buyMembership.confirmPayTitle'),
      content: t('buyMembership.confirmPayContent', { name: tpl.name, price: price.toFixed(2) }),
      confirmText: t('buyMembership.confirmPay'),
      cancelText: t('common.cancel'),
    });
    if (!confirm) return;

    setBuyingId(tpl.id);
    try {
      const result: any = await request(`/membership-templates/${tpl.id}/purchase`, {
        method: 'POST',
        data: {},
      });
      await payOrder(result.order.id, { title: tpl.name, amount: price });
      showToast({ title: t('buyMembership.success'), icon: 'success' });
      setTimeout(() => Taro.navigateTo({ url: '/pages/profile/index' }), 1200);
    } catch (err: any) {
      const msg = isPaymentCanceled(err) ? t('bookings.payCanceled') : (err.message || t('common.failed'));
      showToast({ title: msg, icon: 'none' });
    } finally {
      setBuyingId(null);
    }
  };

  const detailText = (tpl: MembershipTemplate) => {
    if (tpl.type === 'COUNT_BASED') {
      return t('buyMembership.countDetail', { times: tpl.totalTimes ?? 0, days: tpl.validDays ?? 0 });
    }
    if (tpl.type === 'STORED_VALUE') {
      return t('buyMembership.storedDetail', { amount: Number(tpl.balanceAmount || 0).toFixed(0) });
    }
    return t('buyMembership.durationDetail', { days: tpl.validDays ?? 0 });
  };

  return (
    <View className="buy-page">
      <Text className="buy-page__tip">{t('buyMembership.subtitle')}</Text>
      {loading ? (
        <LoadingState />
      ) : templates.length === 0 ? (
        <EmptyState title={t('buyMembership.empty')} />
      ) : (
        <View className="template-list">
          {templates.map(tpl => (
            <View key={tpl.id} className="template-card">
              <View className="template-card__ribbon">
                <Text>{membershipTypeLabel(tpl.type)}</Text>
              </View>
              <Text className="template-card__name">{tpl.name}</Text>
              {tpl.description ? (
                <Text className="template-card__desc">{tpl.description}</Text>
              ) : null}
              <Text className="template-card__detail">{detailText(tpl)}</Text>
              <View className="template-card__foot">
                <Text className="template-card__price">¥{Number(tpl.price).toFixed(0)}</Text>
                <View
                  className={`template-card__btn ${buyingId === tpl.id ? 'disabled' : ''}`}
                  onClick={() => handleBuy(tpl)}
                >
                  <Text>{buyingId === tpl.id ? t('buyMembership.paying') : t('buyMembership.buy')}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
