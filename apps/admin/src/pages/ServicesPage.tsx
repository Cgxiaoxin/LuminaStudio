import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, Space, Modal, Form, Input, InputNumber, Select, message, Popconfirm } from 'antd';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { useI18n } from '../i18n';

interface Service {
  id: number;
  name: string;
  type: string;
  price: number;
  durationMinutes: number;
  status: string;
  sortOrder: number;
  createdAt: string;
  coach?: { id: number; displayName: string };
}

const typeColors: Record<string, string> = { GROUP_CLASS: 'green', PRIVATE_SESSION: 'blue', PACKAGE: 'orange', PRODUCT: 'purple' };

export default function ServicesPage() {
  const { t } = useI18n();
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form] = Form.useForm();

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services');
      setData(res.data.data || res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch() }, []);

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api.patch(`/services/${editing.id}`, values);
      } else {
        await api.post('/services', values);
      }
      message.success(editing ? t('common.updated') : t('common.created'));
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      fetch();
    } catch (err: any) {
      message.error(err.response?.data?.message || t('common.operationFailed'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/services/${id}`);
      message.success(t('common.deleted'));
      fetch();
    } catch { message.error(t('common.deleteFailed')) }
  };

  const columns = [
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    { title: t('common.type'), dataIndex: 'type', key: 'type', render: (type: string) => <Tag color={typeColors[type]}>{t(`serviceType.${type}`)}</Tag> },
    { title: t('common.price'), dataIndex: 'price', key: 'price', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: t('common.duration'), dataIndex: 'durationMinutes', key: 'duration', render: (v: number) => `${v}min` },
    { title: t('common.coach'), key: 'coach', render: (_: any, r: Service) => r.coach?.displayName || '-' },
    { title: t('common.status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'ACTIVE' ? 'green' : 'default'}>{t(`userStatus.${s}`)}</Tag> },
    {
      title: t('common.actions'), key: 'actions',
      render: (_: any, record: Service) => (
        <Space>
          <Button type="link" icon={<Edit size={14} />} onClick={() => { setEditing(record); form.setFieldsValue(record); setModalOpen(true) }}>{t('common.edit')}</Button>
          <Popconfirm title={t('pages.services.deleteConfirm')} onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<Trash2 size={14} />}>{t('pages.services.disable')}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t('common.eyebrow')}</p>
          <h1>{t('pages.services.title')}</h1>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true) }}>
          {t('pages.services.add')}
        </Button>
      </div>
      <Card bordered={false}>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>
      <Modal title={editing ? t('pages.services.edit') : t('pages.services.add')} open={modalOpen} onOk={handleSave} onCancel={() => { setModalOpen(false); setEditing(null) }} width={520} okText={t('common.confirm')} cancelText={t('common.cancel')}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('common.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label={t('common.type')} rules={[{ required: true }]}>
            <Select options={[
              { value: 'GROUP_CLASS', label: t('serviceType.GROUP_CLASS') },
              { value: 'PRIVATE_SESSION', label: t('serviceType.PRIVATE_SESSION') },
              { value: 'PACKAGE', label: t('serviceType.PACKAGE') },
            ]} />
          </Form.Item>
          <Form.Item name="price" label={t('common.price')} rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="durationMinutes" label={t('pages.services.durationMin')} rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label={t('common.description')}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
