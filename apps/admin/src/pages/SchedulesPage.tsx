import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, Space, Modal, Form, Input, InputNumber, DatePicker, Select, message, Popconfirm } from 'antd';
import { Plus, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { api } from '../services/api';

const { RangePicker } = DatePicker;

interface Schedule {
  id: number;
  storeId: number;
  serviceId: number;
  coachId: number;
  startAt: string;
  endAt: string;
  capacity: number;
  bookedCount: number;
  status: string;
  service?: { id: number; name: string; type: string };
  coach?: { id: number; displayName: string };
}

const statusColors: Record<string, string> = { OPEN: 'green', FULL: 'orange', CANCELED: 'red', ARCHIVED: 'default' };

export default function SchedulesPage() {
  const [data, setData] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/schedules');
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
      await api.post('/schedules', {
        ...values,
        startAt: values.timeRange[0].toISOString(),
        endAt: values.timeRange[1].toISOString(),
      });
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
      await api.delete(`/schedules/${id}`);
      message.success('Canceled');
      fetch();
    } catch { message.error('Cancel failed') }
  };

  const columns = [
    { title: 'Service', key: 'service', render: (_: any, r: Schedule) => r.service?.name || '-' },
    { title: 'Coach', key: 'coach', render: (_: any, r: Schedule) => r.coach?.displayName || '-' },
    { title: 'Start', dataIndex: 'startAt', render: (v: string) => dayjs(v).format('MM/DD HH:mm') },
    { title: 'End', dataIndex: 'endAt', render: (v: string) => dayjs(v).format('HH:mm') },
    { title: 'Capacity', key: 'capacity', render: (_: any, r: Schedule) => `${r.bookedCount}/${r.capacity}` },
    { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, record: Schedule) => record.status !== 'CANCELED' && (
        <Popconfirm title="Cancel this schedule?" onConfirm={() => handleCancel(record.id)}>
          <Button type="link" danger icon={<Trash2 size={14} />}>Cancel</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">LuminaStudio</p>
          <h1>Schedules</h1>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { form.resetFields(); setModalOpen(true) }}>
          Add Schedule
        </Button>
      </div>
      <Card bordered={false}>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>
      <Modal title="Add Schedule" open={modalOpen} onOk={handleCreate} onCancel={() => setModalOpen(false)} width={520}>
        <Form form={form} layout="vertical">
          <Form.Item name="storeId" label="Store ID" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="serviceId" label="Service ID" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="coachId" label="Coach ID" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="timeRange" label="Time Range" rules={[{ required: true }]}>
            <RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="capacity" label="Capacity" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="Note">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
