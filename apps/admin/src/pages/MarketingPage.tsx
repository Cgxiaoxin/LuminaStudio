import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, Space, Modal, Form, Input, InputNumber, DatePicker, Select, message, Popconfirm } from 'antd';
import { Plus, Edit, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { api } from '../services/api';
import { useI18n } from '../i18n';

interface CouponTemplate {
  id: number;
  name: string;
  couponType: string;
  discountValue: number;
  minimumSpend: number | null;
  quota: number | null;
  perUserLimit: number | null;
  status: string;
  validFrom: string | null;
  validTo: string | null;
  createdAt: string;
}

export default function MarketingPage() {
  const { t } = useI18n();
  const [data, setData] = useState<CouponTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CouponTemplate | null>(null);
  const [form] = Form.useForm();

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/marketing/templates');
      setData(res.data.data || []);
    } catch {} finally { setLoading(false) }
  };

  useEffect(() => { fetch() }, []);

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      const payload: any = { ...values };
      if (values.validRange) {
        payload.validFrom = values.validRange[0].toISOString();
        payload.validTo = values.validRange[1].toISOString();
        delete payload.validRange;
      }
      if (editing) {
        await api.patch(`/marketing/templates/${editing.id}`, payload);
      } else {
        await api.post('/marketing/templates', payload);
      }
      message.success(editing ? t('common.updated') : t('common.created'));
      setModalOpen(false); form.resetFields(); setEditing(null); fetch();
    } catch (err: any) {
      message.error(err.response?.data?.message || t('common.operationFailed'));
    }
  };

  const handleDelete = async (id: number) => {
    try { await api.delete(`/marketing/templates/${id}`); message.success(t('pages.marketing.disabled')); fetch() }
    catch { message.error(t('common.operationFailed')) }
  };

  const columns = [
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    { title: t('common.type'), dataIndex: 'couponType', key: 'type', render: (type: string) => <Tag>{t(`couponType.${type}`)}</Tag> },
    { title: t('pages.marketing.discount'), dataIndex: 'discountValue', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: t('common.minSpend'), dataIndex: 'minimumSpend', render: (v: number | null) => v ? `¥${v}` : '-' },
    { title: t('pages.marketing.quota'), dataIndex: 'quota', render: (v: number | null) => v ?? '∞' },
    { title: t('common.perUser'), dataIndex: 'perUserLimit', render: (v: number | null) => v ?? '∞' },
    { title: t('common.valid'), key: 'valid', render: (_: any, r: CouponTemplate) => r.validFrom ? `${dayjs(r.validFrom).format('MM/DD')} - ${r.validTo ? dayjs(r.validTo).format('MM/DD') : '∞'}` : '-' },
    { title: t('common.status'), dataIndex: 'status', render: (s: string) => <Tag color={s === 'ACTIVE' ? 'green' : 'default'}>{t(`userStatus.${s}`)}</Tag> },
    {
      title: t('common.actions'), key: 'actions',
      render: (_: any, r: CouponTemplate) => (
        <Space>
          <Button type="link" icon={<Edit size={14} />} onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true) }}>{t('common.edit')}</Button>
          <Popconfirm title={t('pages.marketing.deleteConfirm')} onConfirm={() => handleDelete(r.id)}>
            <Button type="link" danger icon={<Trash2 size={14} />}>{t('common.disable')}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div><p className="eyebrow">{t('common.eyebrow')}</p><h1>{t('pages.marketing.title')}</h1></div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true) }}>
          {t('pages.marketing.add')}
        </Button>
      </div>
      <Card bordered={false}>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>
      <Modal title={editing ? t('pages.marketing.edit') : t('pages.marketing.add')} open={modalOpen} onOk={handleSave} onCancel={() => { setModalOpen(false); setEditing(null) }} width={520} okText={t('common.confirm')} cancelText={t('common.cancel')}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t('pages.marketing.couponName')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="couponType" label={t('common.type')} rules={[{ required: true }]}>
            <Select options={[
              { value: 'FIXED', label: t('couponType.FIXED') },
              { value: 'PERCENT', label: t('couponType.PERCENT') },
            ]} />
          </Form.Item>
          <Form.Item name="discountValue" label={t('pages.marketing.discountValue')} rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="minimumSpend" label={t('common.minSpend')}><InputNumber min={0} precision={2} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="quota" label={t('pages.marketing.totalQuota')}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="perUserLimit" label={t('pages.marketing.perUserLimit')}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="validRange" label={t('pages.marketing.validPeriod')}><DatePicker.RangePicker style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
