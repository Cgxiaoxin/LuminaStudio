import { useMemo, useState, useEffect } from 'react';
import { Button, Card, Table, Tabs, Tag, Statistic, Row, Col, Popconfirm, message } from 'antd';
import dayjs from 'dayjs';
import { api } from '../services/api';
import { useI18n } from '../i18n';
import { isOwnerOrAdmin, getStoredAdminRole } from '../app/roleAccess';

const statusColors: Record<string, string> = {
  PENDING: 'orange', PAID: 'green', REFUNDED: 'red', CANCELED: 'default', FAILED: 'default',
};

export default function FinancePage() {
  const { t } = useI18n();
  const canLedger = isOwnerOrAdmin(getStoredAdminRole());
  const [orders, setOrders] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [ledgerTotal, setLedgerTotal] = useState(0);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);

  const loadOrders = () => {
    setLoadingOrders(true);
    api.get('/orders', { params: { limit: 50 } })
      .then((oRes) => setOrders(oRes.data.data || []))
      .catch(() => message.error(t('common.loadFailed')))
      .finally(() => setLoadingOrders(false));
  };

  const loadLedger = () => {
    if (!canLedger) return;
    setLoadingLedger(true);
    api.get('/ledger', { params: { limit: 50 } })
      .then((lRes) => {
        setLedger(lRes.data.data || []);
        setLedgerTotal(Number(lRes.data.totalAmount || 0));
      })
      .catch(() => message.error(t('common.loadFailed')))
      .finally(() => setLoadingLedger(false));
  };

  const load = () => {
    loadOrders();
    loadLedger();
  };

  useEffect(() => { load(); }, []);

  const handleRefund = async (id: number) => {
    try {
      await api.post(`/orders/${id}/refund`);
      message.success(t('pages.finance.refundSuccess'));
      load();
    } catch (err: any) {
      message.error(err.response?.data?.message || t('common.operationFailed'));
    }
  };

  const orderColumns = useMemo(() => [
    { title: t('pages.finance.orderNo'), dataIndex: 'orderNo', key: 'no' },
    { title: t('common.type'), dataIndex: 'orderType', key: 'type', render: (type: string) => t(`orderType.${type}`) },
    { title: t('common.amount'), dataIndex: 'originalAmount', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: t('pages.finance.paid'), dataIndex: 'paidAmount', render: (v: number) => v ? `¥${Number(v).toFixed(2)}` : '-' },
    { title: t('common.status'), dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{t(`orderStatus.${s}`)}</Tag> },
    { title: t('pages.finance.paidAt'), dataIndex: 'paidAt', render: (v: string) => v ? dayjs(v).format('MM/DD HH:mm') : '-' },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: unknown, r: any) => r.status === 'PAID' ? (
        <Popconfirm title={t('pages.finance.refundConfirm')} onConfirm={() => handleRefund(r.id)}>
          <Button type="link" danger>{t('pages.finance.refund')}</Button>
        </Popconfirm>
      ) : null,
    },
  ], [t]);

  const ledgerColumns = useMemo(() => [
    { title: t('common.type'), dataIndex: 'type', render: (type: string) => <Tag>{t(`ledgerType.${type}`)}</Tag> },
    { title: t('common.amount'), dataIndex: 'amount', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: t('common.client'), key: 'client', render: (_: unknown, r: any) => r.client?.nickname || '-' },
    { title: t('common.time'), dataIndex: 'occurredAt', render: (v: string) => dayjs(v).format('MM/DD HH:mm') },
    { title: t('pages.finance.remark'), dataIndex: 'remark' },
  ], [t]);

  const tabItems = [
    { key: 'orders', label: t('pages.finance.orders'), children: <Table columns={orderColumns} dataSource={orders} rowKey="id" loading={loadingOrders} pagination={{ pageSize: 20 }} /> },
  ];
  if (canLedger) {
    tabItems.push({
      key: 'ledger',
      label: t('pages.finance.ledger'),
      children: <Table columns={ledgerColumns} dataSource={ledger} rowKey="id" loading={loadingLedger} pagination={{ pageSize: 20 }} />,
    });
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t('common.eyebrow')}</p>
          <h1>{t('pages.finance.title')}</h1>
        </div>
      </div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {canLedger ? (
          <Col span={6}>
            <Card><Statistic title={t('pages.finance.totalLedger')} value={ledgerTotal} prefix="¥" precision={2} /></Card>
          </Col>
        ) : null}
        <Col span={6}>
          <Card><Statistic title={t('pages.finance.ordersCount')} value={orders.length} /></Card>
        </Col>
      </Row>
      <Card bordered={false}>
        <Tabs items={tabItems} />
      </Card>
    </section>
  );
}
