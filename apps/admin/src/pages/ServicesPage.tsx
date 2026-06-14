import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, Space, Modal, Form, Input, InputNumber, Select, message, Popconfirm } from 'antd';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '../services/api';

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
      message.success(editing ? 'Updated' : 'Created');
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      fetch();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/services/${id}`);
      message.success('Deleted');
      fetch();
    } catch { message.error('Delete failed') }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={typeColors[t]}>{t}</Tag> },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: 'Duration', dataIndex: 'durationMinutes', key: 'duration', render: (v: number) => `${v}min` },
    { title: 'Coach', key: 'coach', render: (_: any, r: Service) => r.coach?.displayName || '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'ACTIVE' ? 'green' : 'default'}>{s}</Tag> },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, record: Service) => (
        <Space>
          <Button type="link" icon={<Edit size={14} />} onClick={() => { setEditing(record); form.setFieldsValue(record); setModalOpen(true) }}>Edit</Button>
          <Popconfirm title="Disable this service?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<Trash2 size={14} />}>Disable</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">LuminaStudio</p>
          <h1>Services</h1>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true) }}>
          Add Service
        </Button>
      </div>
      <Card bordered={false}>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>
      <Modal title={editing ? 'Edit Service' : 'Add Service'} open={modalOpen} onOk={handleSave} onCancel={() => { setModalOpen(false); setEditing(null) }} width={520}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select options={[
              { value: 'GROUP_CLASS', label: 'Group Class' },
              { value: 'PRIVATE_SESSION', label: 'Private Session' },
              { value: 'PACKAGE', label: 'Package' },
            ]} />
          </Form.Item>
          <Form.Item name="price" label="Price (¥)" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="durationMinutes" label="Duration (min)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
