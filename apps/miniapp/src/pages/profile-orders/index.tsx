import { useState, useEffect } from 'react';
import { Text, View } from '@tarojs/components';
import { request } from '../../services/api';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { orderStatusLabel, t } from '../../i18n/messages';
import './index.scss';

type Order = {
  id: number;
  orderNo: string;
  status: string;
  paidAmount: number | string;
  originalAmount: number | string;
  createdAt: string;
  booking?: { service?: { name?: string } };
};

const statusColors: Record<string, string> = {
  PENDING: '#c77700',
  PAID: '#2e6f57',
  REFUNDED: '#6f776f',
  CANCELED: '#c93d32',
  FAILED: '#c93d32',
};

export default function ProfileOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request('/orders?limit=30')
      .then((res: any) => setOrders(res.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <View className="profile-sub-page">
      {orders.length === 0 ? (
        <EmptyState title={t('profileOrders.empty')} />
      ) : (
        <View className="order-list">
          {orders.map(order => (
            <View key={order.id} className="order-card">
              <View className="order-card__head">
                <Text className="order-card__name">
                  {order.booking?.service?.name || t('profileOrders.orderNo')}
                </Text>
                <Text className="order-card__status" style={{ color: statusColors[order.status] }}>
                  {orderStatusLabel(order.status)}
                </Text>
              </View>
              <Text className="order-card__no">{order.orderNo}</Text>
              <View className="order-card__foot">
                <Text className="order-card__time">
                  {new Date(order.createdAt).toLocaleString('zh-CN')}
                </Text>
                <Text className="order-card__amount">
                  {t('profileOrders.paid')} ¥{Number(order.paidAmount || order.originalAmount || 0).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
