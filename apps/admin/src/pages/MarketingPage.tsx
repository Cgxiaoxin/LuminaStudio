import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, Space, Modal, Form, Input, InputNumber, DatePicker, Select, message, Popconfirm } from 'antd';
import { Plus, Edit, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { api } from '../services/api';

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
      message.success(editing ? 'Updated' : 'Created');
      setModalOpen(false); form.resetFields(); setEditing(null); fetch();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    try { await api.delete(`/marketing/templates/${id}`); message.success('Disabled'); fetch() }
    catch { message.error('Failed') }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Type', dataIndex: 'couponType', key: 'type', render: (t: string) => <Tag>{t}</Tag> },
    { title: 'Value', dataIndex: 'discountValue', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: 'Min Spend', dataIndex: 'minimumSpend', render: (v: number | null) => v ? `¥${v}` : '-' },
    { title: 'Quota', dataIndex: 'quota', render: (v: number | null) => v ?? '∞' },
    { title: 'Per User', dataIndex: 'perUserLimit', render: (v: number | null) => v ?? '∞' },
    { title: 'Valid', key: 'valid', render: (_: any, r: CouponTemplate) => r.validFrom ? `${dayjs(r.validFrom).format('MM/DD')} - ${r.validTo ? dayjs(r.validTo).format('MM/DD') : '∞'}` : '-' },
    { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={s === 'ACTIVE' ? 'green' : 'default'}>{s}</Tag> },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, r: CouponTemplate) => (
        <Space>
          <Button type="link" icon={<Edit size={14} />} onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true) }}>Edit</Button>
          <Popconfirm title="Disable this template?" onConfirm={() => handleDelete(r.id)}>
            <Button type="link" danger icon={<Trash2 size={14} />}>Disable</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div><p className="eyebrow">LuminaStudio</p><h1>Marketing</h1></div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true) }}>
          Add Coupon
        </Button>
      </div>
      <Card bordered={false}>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>
      <Modal title={editing ? 'Edit Coupon' : 'Add Coupon'} open={modalOpen} onOk={handleSave} onCancel={() => { setModalOpen(false); setEditing(null) }} width={520}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="couponType" label="Type" rules={[{ required: true }]}>
            <Select options={[{ value: 'FIXED', label: 'Fixed Amount' }, { value: 'PERCENT', label: 'Percentage' }]} />
          </Form.Item>
          <Form.Item name="discountValue" label="Discount Value" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="minimumSpend" label="Minimum Spend"><InputNumber min={0} precision={2} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="quota" label="Total Quota"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="perUserLimit" label="Per User Limit"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="validRange" label="Valid Period"><DatePicker.RangePicker style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
