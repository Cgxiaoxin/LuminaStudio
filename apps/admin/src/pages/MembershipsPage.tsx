import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, Space, Modal, Form, Input, InputNumber, Select, DatePicker, message, Popconfirm } from 'antd';
import { Plus, XCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { api } from '../services/api';

interface Membership {
  id: number;
  name: string;
  type: string;
  totalTimes: number | null;
  remainingTimes: number | null;
  status: string;
  startedAt: string | null;
  expiredAt: string | null;
  client?: { id: number; nickname: string; phone: string };
  _count?: { bookings: number };
}

const typeLabels: Record<string, string> = { COUNT_BASED: 'Count', DURATION_BASED: 'Duration', HYBRID: 'Hybrid' };
const statusColors: Record<string, string> = { ACTIVE: 'green', EXHAUSTED: 'orange', EXPIRED: 'default', CANCELED: 'red' };

export default function MembershipsPage() {
  const [data, setData] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/memberships');
      setData(res.data.data || res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch() }, []);

  const handleCreate = async () => {
    const values = await form.validateFields();
    try {
      const payload: any = { ...values };
      if (values.startedAt) payload.startedAt = values.startedAt.toISOString();
      if (values.expiredAt) payload.expiredAt = values.expiredAt.toISOString();
      await api.post('/memberships', payload);
      message.success('Created');
      setModalOpen(false);
      form.resetFields();
      fetch();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await api.patch(`/memberships/${id}/cancel`);
      message.success('Canceled');
      fetch();
    } catch { message.error('Cancel failed') }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Client', key: 'client', render: (_: any, r: Membership) => r.client?.nickname || r.client?.phone || '-' },
    { title: 'Type', dataIndex: 'type', render: (t: string) => typeLabels[t] || t },
    { title: 'Remaining', key: 'remaining', render: (_: any, r: Membership) => r.type === 'DURATION_BASED' ? '∞' : `${r.remainingTimes ?? 0}/${r.totalTimes ?? 0}` },
    { title: 'Period', key: 'period', render: (_: any, r: Membership) => r.startedAt ? `${dayjs(r.startedAt).format('MM/DD')} - ${r.expiredAt ? dayjs(r.expiredAt).format('MM/DD') : '∞'}` : '-' },
    { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
    { title: 'Used', key: 'used', render: (_: any, r: Membership) => r._count?.bookings ?? 0 },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, record: Membership) => record.status === 'ACTIVE' && (
        <Popconfirm title="Cancel this membership?" onConfirm={() => handleCancel(record.id)}>
          <Button type="link" danger icon={<XCircle size={14} />}>Cancel</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">LuminaStudio</p>
          <h1>Memberships</h1>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { form.resetFields(); setModalOpen(true) }}>
          Issue Membership
        </Button>
      </div>
      <Card bordered={false}>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>
      <Modal title="Issue Membership" open={modalOpen} onOk={handleCreate} onCancel={() => setModalOpen(false)} width={520}>
        <Form form={form} layout="vertical">
          <Form.Item name="clientId" label="Client ID" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="name" label="Membership Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select options={[
              { value: 'COUNT_BASED', label: 'Count Based' },
              { value: 'DURATION_BASED', label: 'Duration Based' },
              { value: 'HYBRID', label: 'Hybrid' },
            ]} />
          </Form.Item>
          <Form.Item name="totalTimes" label="Total Sessions">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="startedAt" label="Start Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expiredAt" label="Expiry Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
