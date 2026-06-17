import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, Modal, Form, Input, InputNumber, DatePicker, message, Popconfirm } from 'antd';
import { Plus, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { api } from '../services/api';
import { useI18n } from '../i18n';

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
  const { t } = useI18n();
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
      message.success(t('common.created'));
      setModalOpen(false);
      form.resetFields();
      fetch();
    } catch (err: any) {
      message.error(err.response?.data?.message || t('common.operationFailed'));
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await api.delete(`/schedules/${id}`);
      message.success(t('pages.schedules.canceled'));
      fetch();
    } catch { message.error(t('common.cancelFailed')) }
  };

  const columns = [
    { title: t('common.service'), key: 'service', render: (_: any, r: Schedule) => r.service?.name || '-' },
    { title: t('common.coach'), key: 'coach', render: (_: any, r: Schedule) => r.coach?.displayName || '-' },
    { title: t('common.start'), dataIndex: 'startAt', render: (v: string) => dayjs(v).format('MM/DD HH:mm') },
    { title: t('common.end'), dataIndex: 'endAt', render: (v: string) => dayjs(v).format('HH:mm') },
    { title: t('pages.schedules.spots'), key: 'capacity', render: (_: any, r: Schedule) => `${r.bookedCount}/${r.capacity}` },
    { title: t('common.status'), dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{t(`scheduleStatus.${s}`)}</Tag> },
    {
      title: t('common.actions'), key: 'actions',
      render: (_: any, record: Schedule) => record.status !== 'CANCELED' && (
        <Popconfirm title={t('pages.schedules.cancelConfirm')} onConfirm={() => handleCancel(record.id)}>
          <Button type="link" danger icon={<Trash2 size={14} />}>{t('common.cancel')}</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t('common.eyebrow')}</p>
          <h1>{t('pages.schedules.title')}</h1>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { form.resetFields(); setModalOpen(true) }}>
          {t('pages.schedules.add')}
        </Button>
      </div>
      <Card bordered={false}>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>
      <Modal title={t('pages.schedules.add')} open={modalOpen} onOk={handleCreate} onCancel={() => setModalOpen(false)} width={520} okText={t('common.confirm')} cancelText={t('common.cancel')}>
        <Form form={form} layout="vertical">
          <Form.Item name="storeId" label={t('common.storeId')} rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="serviceId" label={t('common.serviceId')} rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="coachId" label={t('common.coachId')} rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="timeRange" label={t('pages.schedules.timeRange')} rules={[{ required: true }]}>
            <RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="capacity" label={t('common.capacity')} rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label={t('common.note')}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
