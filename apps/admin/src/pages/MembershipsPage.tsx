import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, Modal, Form, Input, InputNumber, Select, DatePicker, message, Popconfirm } from 'antd';
import { Plus, XCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { api } from '../services/api';
import { useI18n } from '../i18n';

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

interface MembershipTemplate {
  id: number;
  name: string;
  type: string;
}

interface CustomerOption {
  id: number;
  nickname: string | null;
  phone: string | null;
}

const statusColors: Record<string, string> = { ACTIVE: 'green', EXHAUSTED: 'orange', EXPIRED: 'default', CANCELED: 'red' };

export default function MembershipsPage() {
  const { t } = useI18n();
  const [data, setData] = useState<Membership[]>([]);
  const [templates, setTemplates] = useState<MembershipTemplate[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [form] = Form.useForm();
  const [issueForm] = Form.useForm();

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

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/membership-templates?status=ACTIVE');
      setTemplates(res.data.data || res.data);
    } catch {
      setTemplates([]);
    }
  };

  useEffect(() => {
    fetch();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (!issueOpen && !modalOpen) return;
    api.get('/customers', { params: { limit: 100 } })
      .then((res) => setCustomers(res.data.data || []))
      .catch(() => setCustomers([]));
  }, [issueOpen, modalOpen]);

  const handleCreate = async () => {
    const values = await form.validateFields();
    try {
      const payload: any = { ...values };
      if (values.startedAt) payload.startedAt = values.startedAt.toISOString();
      if (values.expiredAt) payload.expiredAt = values.expiredAt.toISOString();
      await api.post('/memberships', payload);
      message.success(t('common.created'));
      setModalOpen(false);
      form.resetFields();
      fetch();
    } catch (err: any) {
      message.error(err.response?.data?.message || t('common.operationFailed'));
    }
  };

  const handleIssueFromTemplate = async () => {
    const values = await issueForm.validateFields();
    try {
      await api.post(`/membership-templates/${values.templateId}/issue`, {
        clientId: values.clientId,
      });
      message.success(t('common.created'));
      setIssueOpen(false);
      issueForm.resetFields();
      fetch();
    } catch (err: any) {
      message.error(err.response?.data?.message || t('common.operationFailed'));
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await api.patch(`/memberships/${id}/cancel`);
      message.success(t('pages.memberships.canceled'));
      fetch();
    } catch { message.error(t('common.cancelFailed')) }
  };

  const columns = [
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    { title: t('common.client'), key: 'client', render: (_: any, r: Membership) => r.client?.nickname || r.client?.phone || '-' },
    { title: t('common.type'), dataIndex: 'type', render: (type: string) => t(`membershipType.${type}`) },
    { title: t('pages.memberships.remaining'), key: 'remaining', render: (_: any, r: Membership) => r.type === 'DURATION_BASED' ? '∞' : r.type === 'STORED_VALUE' ? '-' : `${r.remainingTimes ?? 0}/${r.totalTimes ?? 0}` },
    { title: t('pages.memberships.period'), key: 'period', render: (_: any, r: Membership) => r.startedAt ? `${dayjs(r.startedAt).format('MM/DD')} - ${r.expiredAt ? dayjs(r.expiredAt).format('MM/DD') : '∞'}` : '-' },
    { title: t('common.status'), dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{t(`membershipStatus.${s}`)}</Tag> },
    { title: t('common.used'), key: 'used', render: (_: any, r: Membership) => r._count?.bookings ?? 0 },
    {
      title: t('common.actions'), key: 'actions',
      render: (_: any, record: Membership) => record.status === 'ACTIVE' && (
        <Popconfirm title={t('pages.memberships.cancelConfirm')} onConfirm={() => handleCancel(record.id)}>
          <Button type="link" danger icon={<XCircle size={14} />}>{t('pages.memberships.cancelCard')}</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t('common.eyebrow')}</p>
          <h1>{t('pages.memberships.title')}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => { issueForm.resetFields(); setIssueOpen(true); }}>
            {t('pages.memberships.issueFromTemplate')}
          </Button>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => { form.resetFields(); setModalOpen(true) }}>
            {t('pages.memberships.add')}
          </Button>
        </div>
      </div>
      <Card bordered={false}>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>
      <Modal title={t('pages.memberships.issueFromTemplate')} open={issueOpen} onOk={handleIssueFromTemplate} onCancel={() => setIssueOpen(false)} width={480} okText={t('common.confirm')} cancelText={t('common.cancel')}>
        <Form form={issueForm} layout="vertical">
          <Form.Item name="clientId" label={t('common.client')} rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={customers.map((c) => ({
                value: c.id,
                label: `${c.nickname || '-'} (${c.phone || c.id})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="templateId" label={t('pages.membershipTemplates.title')} rules={[{ required: true }]}>
            <Select options={templates.map(tpl => ({ value: tpl.id, label: `${tpl.name} (${t(`membershipType.${tpl.type}`)})` }))} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal title={t('pages.memberships.add')} open={modalOpen} onOk={handleCreate} onCancel={() => setModalOpen(false)} width={520} okText={t('common.confirm')} cancelText={t('common.cancel')}>
        <Form form={form} layout="vertical">
          <Form.Item name="clientId" label={t('common.client')} rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={customers.map((c) => ({
                value: c.id,
                label: `${c.nickname || '-'} (${c.phone || c.id})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="name" label={t('pages.memberships.membershipName')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label={t('common.type')} rules={[{ required: true }]}>
            <Select options={[
              { value: 'COUNT_BASED', label: t('membershipType.COUNT_BASED') },
              { value: 'DURATION_BASED', label: t('membershipType.DURATION_BASED') },
              { value: 'STORED_VALUE', label: t('membershipType.STORED_VALUE') },
              { value: 'HYBRID', label: t('membershipType.HYBRID') },
            ]} />
          </Form.Item>
          <Form.Item name="totalTimes" label={t('pages.memberships.totalSessions')}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="startedAt" label={t('common.startDate')}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expiredAt" label={t('common.expiryDate')}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
