import { useMemo, useState, useEffect } from 'react';
import { Button, Card, Table, Tag, Space, Select, DatePicker, message, Popconfirm } from 'antd';
import { CheckCircle, XCircle } from 'lucide-react';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { api } from '../services/api';
import { useI18n } from '../i18n';

interface Booking {
  id: number;
  bookingNo: string;
  status: string;
  paidAmount: number;
  storeId?: number;
  client?: { nickname: string; phone: string };
  service?: { name: string };
  schedule?: { startAt: string };
}

const statusColors: Record<string, string> = {
  CREATED: 'default', PENDING_PAYMENT: 'orange', CONFIRMED: 'blue',
  CHECKED_IN: 'green', COMPLETED: 'purple', CANCELED: 'red',
};

export default function BookingsPage() {
  const { t } = useI18n();
  const [data, setData] = useState<Booking[]>([]);
  const [stores, setStores] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [storeFilter, setStoreFilter] = useState<number | undefined>();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (statusFilter) params.status = statusFilter;
      if (storeFilter) params.storeId = storeFilter;
      if (dateRange) {
        params.dateFrom = dateRange[0].startOf('day').toISOString();
        params.dateTo = dateRange[1].endOf('day').toISOString();
      }
      const res = await api.get('/bookings', { params });
      setData(res.data.data || res.data);
    } catch {
      message.error(t('common.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [statusFilter, storeFilter, dateRange]);

  useEffect(() => {
    api.get('/stores', { params: { limit: 100 } })
      .then((res) => setStores(res.data.data || res.data || []))
      .catch(() => setStores([]));
  }, []);

  const handleCheckIn = async (id: number) => {
    try {
      await api.patch(`/bookings/${id}/check-in`);
      message.success(t('pages.bookings.checkInSuccess'));
      fetch();
    } catch {
      message.error(t('pages.bookings.checkInFailed'));
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await api.patch(`/bookings/${id}/cancel`, {});
      message.success(t('pages.bookings.cancelSuccess'));
      fetch();
    } catch {
      message.error(t('common.cancelFailed'));
    }
  };

  const statusOptions = useMemo(() =>
    ['CREATED', 'PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELED'].map((value) => ({
      value,
      label: t(`bookingStatus.${value}`),
    })),
  [t]);

  const columns = useMemo(() => [
    { title: t('pages.bookings.bookingNo'), dataIndex: 'bookingNo', key: 'no' },
    { title: t('common.client'), key: 'client', render: (_: unknown, r: Booking) => r.client?.nickname || r.client?.phone || '-' },
    { title: t('common.service'), key: 'service', render: (_: unknown, r: Booking) => r.service?.name || '-' },
    { title: t('common.time'), key: 'time', render: (_: unknown, r: Booking) => r.schedule ? dayjs(r.schedule.startAt).format('MM/DD HH:mm') : '-' },
    { title: t('common.status'), dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{t(`bookingStatus.${s}`)}</Tag> },
    { title: t('common.amount'), dataIndex: 'paidAmount', render: (v: number) => v ? `¥${Number(v).toFixed(2)}` : '-' },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: unknown, record: Booking) => (
        <Space>
          {record.status === 'CONFIRMED' && (
            <Button type="link" icon={<CheckCircle size={14} />} onClick={() => handleCheckIn(record.id)} style={{ color: '#52c41a' }}>
              {t('pages.bookings.checkIn')}
            </Button>
          )}
          {['CREATED', 'PENDING_PAYMENT', 'CONFIRMED'].includes(record.status) && (
            <Popconfirm title={t('pages.bookings.cancelConfirm')} onConfirm={() => handleCancel(record.id)}>
              <Button type="link" danger icon={<XCircle size={14} />}>{t('common.cancel')}</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ], [t]);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t('common.eyebrow')}</p>
          <h1>{t('pages.bookings.title')}</h1>
        </div>
        <Space wrap>
          <Select
            allowClear
            placeholder={t('pages.bookings.filterStore')}
            style={{ width: 180 }}
            value={storeFilter}
            onChange={setStoreFilter}
            options={stores.map((store) => ({ value: store.id, label: store.name }))}
          />
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(range) => setDateRange(range as [Dayjs, Dayjs] | null)}
            placeholder={[t('pages.bookings.filterDate'), t('common.dateRange')]}
          />
          <Select
            allowClear
            placeholder={t('pages.bookings.filterStatus')}
            style={{ width: 180 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
        </Space>
      </div>
      <Card bordered={false}>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>
    </section>
  );
}
