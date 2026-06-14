import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, Space, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '../services/api';

interface Staff {
  id: number;
  username: string;
  displayName: string;
  role: string;
  status: string;
  storeId: number | null;
  bio: string | null;
  avatarUrl: string | null;
  phone: string | null;
  createdAt: string;
}

const roleColors: Record<string, string> = { OWNER: 'red', ADMIN: 'orange', STAFF: 'blue', COACH: 'green' };

export default function StaffPage() {
  const [data, setData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form] = Form.useForm();

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin-users');
      setData(res.data.data || res.data);
    } catch {
      // Mock fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch() }, []);

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api.patch(`/admin-users/${editing.id}`, values);
      } else {
        await api.post('/admin-users', values);
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
      await api.delete(`/admin-users/${id}`);
      message.success('Deleted');
      fetch();
    } catch { message.error('Delete failed') }
  };

  const openEdit = (record: Staff) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const columns = [
    { title: 'Name', dataIndex: 'displayName', key: 'name' },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (r: string) => <Tag color={roleColors[r]}>{r}</Tag> },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (v: string) => v || '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'ACTIVE' ? 'green' : 'default'}>{s}</Tag> },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => new Date(v).toLocaleDateString() },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, record: Staff) => (
        <Space>
          <Button type="link" icon={<Edit size={14} />} onClick={() => openEdit(record)}>Edit</Button>
          <Popconfirm title="Delete this staff?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<Trash2 size={14} />}>Delete</Button>
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
          <h1>Staff & Coaches</h1>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true) }}>
          Add Staff
        </Button>
      </div>
      <Card bordered={false}>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>
      <Modal title={editing ? 'Edit Staff' : 'Add Staff'} open={modalOpen} onOk={handleSave} onCancel={() => { setModalOpen(false); setEditing(null) }} width={520}>
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          {!editing && (
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="displayName" label="Display Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select options={[
              { value: 'OWNER', label: 'Owner' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'STAFF', label: 'Staff' },
              { value: 'COACH', label: 'Coach' },
            ]} />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="bio" label="Bio">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
