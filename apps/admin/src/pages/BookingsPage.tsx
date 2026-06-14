import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, Space, Modal, Select, message, Popconfirm } from 'antd';
import { CheckCircle, XCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { api } from '../services/api';

interface Booking {
  id: number;
  bookingNo: string;
  status: string;
  source: string;
  paidAmount: number;
  checkinAt: string | null;
  createdAt: string;
  client?: { id: number; nickname: string; phone: string };
  service?: { id: number; name: string; type: string };
  schedule?: { startAt: string; endAt: string };
  usedMembership?: { id: number; name: string };
}

const statusColors: Record<string, string> = {
  CREATED: 'default', PENDING_PAYMENT: 'orange', CONFIRMED: 'blue',
  CHECKED_IN: 'green', COMPLETED: 'purple', CANCELED: 'red',
};

export default function BookingsPage() {
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const fetch = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/bookings', { params });
      setData(res.data.data || res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch() }, [statusFilter]);

  const handleCheckIn = async (id: number) => {
    try {
      await api.patch(`/bookings/${id}/check-in`);
      message.success('Checked in');
      fetch();
    } catch { message.error('Check-in failed') }
  };

  const handleCancel = async (id: number, reason?: string) => {
    try {
      await api.patch(`/bookings/${id}/cancel`, { reason });
      message.success('Canceled');
      fetch();
    } catch { message.error('Cancel failed') }
  };

  const columns = [
    { title: 'Booking No', dataIndex: 'bookingNo', key: 'no' },
    { title: 'Client', key: 'client', render: (_: any, r: Booking) => r.client?.nickname || r.client?.phone || '-' },
    { title: 'Service', key: 'service', render: (_: any, r: Booking) => r.service?.name || '-' },
    { title: 'Time', key: 'time', render: (_: any, r: Booking) => r.schedule ? dayjs(r.schedule.startAt).format('MM/DD HH:mm') : '-' },
    { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
    { title: 'Amount', dataIndex: 'paidAmount', render: (v: number) => v ? `¥${Number(v).toFixed(2)}` : '-' },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, record: Booking) => (
        <Space>
          {record.status === 'CONFIRMED' && (
            <Button type="link" icon={<CheckCircle size={14} />} onClick={() => handleCheckIn(record.id)} style={{ color: '#52c41a' }}>
              Check In
            </Button>
          )}
          {['CREATED', 'PENDING_PAYMENT', 'CONFIRMED'].includes(record.status) && (
            <Popconfirm title="Cancel this booking?" onConfirm={() => handleCancel(record.id)}>
              <Button type="link" danger icon={<XCircle size={14} />}>Cancel</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">LuminaStudio</p>
          <h1>Bookings</h1>
        </div>
        <Select
          allowClear placeholder="Filter by status" style={{ width: 200 }}
          value={statusFilter} onChange={setStatusFilter}
          options={[
            { value: 'CREATED', label: 'Created' },
            { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
            { value: 'CONFIRMED', label: 'Confirmed' },
            { value: 'CHECKED_IN', label: 'Checked In' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELED', label: 'Canceled' },
          ]}
        />
      </div>
      <Card bordered={false}>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>
    </section>
  );
}
