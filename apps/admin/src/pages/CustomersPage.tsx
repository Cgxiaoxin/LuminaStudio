import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Table, Tag, Space, Modal, Form, Input, message } from 'antd';
import { Search } from 'lucide-react';
import { api } from '../services/api';
import { useI18n } from '../i18n';

interface Customer {
  id: number;
  nickname: string | null;
  phone: string | null;
  openid: string | null;
  status: string;
  createdAt: string;
  _count?: { bookings: number; memberships: number };
}

export default function CustomersPage() {
  const { t } = useI18n();
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Customer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetch = useCallback(async (keyword = search) => {
    setLoading(true);
    try {
      const res = await api.get('/customers', { params: { search: keyword || undefined, limit: 50 } });
      setData(res.data.data || res.data);
    } catch {
      message.error(t('common.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [search, t]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async () => {
    const values = await form.validateFields();
    if (!editing) return;
    try {
      await api.patch(`/customers/${editing.id}`, values);
      message.success(t('common.updated'));
      setModalOpen(false);
      setEditing(null);
      fetch();
    } catch (err: any) {
      message.error(err.response?.data?.message || t('common.operationFailed'));
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: t('common.name'), dataIndex: 'nickname', render: (v: string) => v || '-' },
    { title: t('common.phone'), dataIndex: 'phone', render: (v: string) => v || '-' },
    { title: t('pages.customers.bookings'), key: 'bookings', render: (_: unknown, r: Customer) => r._count?.bookings ?? 0 },
    { title: t('pages.customers.memberships'), key: 'memberships', render: (_: unknown, r: Customer) => r._count?.memberships ?? 0 },
    { title: t('common.status'), dataIndex: 'status', render: (s: string) => <Tag color={s === 'ACTIVE' ? 'green' : 'default'}>{t(`userStatus.${s}`)}</Tag> },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: unknown, r: Customer) => (
        <Button type="link" onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); }}>
          {t('common.edit')}
        </Button>
      ),
    },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div><p className="eyebrow">{t('common.eyebrow')}</p><h1>{t('pages.customers.title')}</h1></div>
        <Space>
          <Input
            prefix={<Search size={16} />}
            placeholder={t('pages.customers.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={() => fetch(search)}
            style={{ width: 260 }}
          />
          <Button onClick={() => fetch(search)}>{t('common.search')}</Button>
        </Space>
      </div>
      <Card bordered={false}>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>
      <Modal
        title={t('pages.customers.edit')}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); setEditing(null); }}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="nickname" label={t('common.name')}><Input /></Form.Item>
          <Form.Item name="phone" label={t('common.phone')}><Input /></Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
