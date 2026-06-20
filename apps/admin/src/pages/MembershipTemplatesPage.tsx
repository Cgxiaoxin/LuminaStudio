import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Tabs } from 'antd';
import { Plus, XCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { api } from '../services/api';
import { useI18n } from '../i18n';

interface MembershipTemplate {
  id: number;
  name: string;
  type: string;
  description?: string;
  price: string | number;
  totalTimes?: number | null;
  validDays?: number | null;
  balanceAmount?: string | number;
  status: string;
}

const typeColors: Record<string, string> = {
  COUNT_BASED: 'green',
  DURATION_BASED: 'blue',
  STORED_VALUE: 'gold',
  HYBRID: 'purple',
};

export default function MembershipTemplatesPage() {
  const { t } = useI18n();
  const [data, setData] = useState<MembershipTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [form] = Form.useForm();
  const selectedType = Form.useWatch('type', form);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = typeFilter === 'ALL' ? '' : `&type=${typeFilter}`;
      const res = await api.get(`/membership-templates?status=ACTIVE${query}`);
      setData(res.data.data || res.data);
    } catch {
      message.error(t('common.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [typeFilter]);

  const handleCreate = async () => {
    const values = await form.validateFields();
    try {
      await api.post('/membership-templates', values);
      message.success(t('common.created'));
      setModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.message || t('common.operationFailed'));
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await api.delete(`/membership-templates/${id}`);
      message.success(t('common.deleted'));
      fetchData();
    } catch {
      message.error(t('common.operationFailed'));
    }
  };

  const columns = [
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    {
      title: t('common.type'),
      dataIndex: 'type',
      render: (type: string) => <Tag color={typeColors[type]}>{t(`membershipType.${type}`)}</Tag>,
    },
    {
      title: t('pages.membershipTemplates.price'),
      dataIndex: 'price',
      render: (v: string | number) => `¥${Number(v).toFixed(0)}`,
    },
    {
      title: t('pages.membershipTemplates.detail'),
      key: 'detail',
      render: (_: unknown, r: MembershipTemplate) => {
        if (r.type === 'COUNT_BASED') return `${r.totalTimes ?? '-'} ${t('pages.memberships.totalSessions')}`;
        if (r.type === 'STORED_VALUE') return `¥${Number(r.balanceAmount ?? 0).toFixed(0)}`;
        if (r.type === 'DURATION_BASED') return `${r.validDays ?? '-'} ${t('common.days')}`;
        return '-';
      },
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: unknown, record: MembershipTemplate) => (
        <Popconfirm title={t('common.deleteConfirm')} onConfirm={() => handleDeactivate(record.id)}>
          <Button type="link" danger icon={<XCircle size={14} />}>{t('common.deactivate')}</Button>
        </Popconfirm>
      ),
    },
  ];

  const tabItems = [
    { key: 'ALL', label: t('common.all') },
    { key: 'COUNT_BASED', label: t('membershipType.COUNT_BASED') },
    { key: 'DURATION_BASED', label: t('membershipType.DURATION_BASED') },
    { key: 'STORED_VALUE', label: t('membershipType.STORED_VALUE') },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t('common.eyebrow')}</p>
          <h1>{t('pages.membershipTemplates.title')}</h1>
          <p className="page-desc">{t('pages.membershipTemplates.subtitle')}</p>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
          {t('pages.membershipTemplates.create')}
        </Button>
      </div>

      <Card bordered={false}>
        <Tabs activeKey={typeFilter} items={tabItems} onChange={setTypeFilter} style={{ marginBottom: 16 }} />
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>

      <Modal
        title={t('pages.membershipTemplates.create')}
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => setModalOpen(false)}
        width={560}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical" initialValues={{ type: 'COUNT_BASED' }}>
          <Form.Item name="name" label={t('common.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label={t('common.type')} rules={[{ required: true }]}>
            <Select options={[
              { value: 'COUNT_BASED', label: t('membershipType.COUNT_BASED') },
              { value: 'DURATION_BASED', label: t('membershipType.DURATION_BASED') },
              { value: 'STORED_VALUE', label: t('membershipType.STORED_VALUE') },
            ]} />
          </Form.Item>
          <Form.Item name="description" label={t('common.description')}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="price" label={t('pages.membershipTemplates.price')} rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
          {(selectedType === 'COUNT_BASED' || selectedType === 'HYBRID') && (
            <Form.Item name="totalTimes" label={t('pages.memberships.totalSessions')} rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          )}
          {selectedType === 'STORED_VALUE' && (
            <Form.Item name="balanceAmount" label={t('pages.membershipTemplates.balance')} rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} prefix="¥" />
            </Form.Item>
          )}
          <Form.Item name="validDays" label={t('pages.membershipTemplates.validDays')}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
