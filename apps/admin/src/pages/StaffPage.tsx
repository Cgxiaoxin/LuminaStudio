import { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, Space, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { useI18n } from '../i18n';

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
  const { t } = useI18n();
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
      message.error(t('common.loadFailed'));
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
      await api.delete(`/admin-users/${id}`);
      message.success(t('common.deleted'));
      fetch();
    } catch { message.error(t('common.deleteFailed')) }
  };

  const openEdit = (record: Staff) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const columns = [
    { title: t('common.name'), dataIndex: 'displayName', key: 'name' },
    { title: t('common.username'), dataIndex: 'username', key: 'username' },
    { title: t('common.role'), dataIndex: 'role', key: 'role', render: (r: string) => <Tag color={roleColors[r]}>{t(`roles.${r}`)}</Tag> },
    { title: t('common.phone'), dataIndex: 'phone', key: 'phone', render: (v: string) => v || '-' },
    { title: t('common.status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'ACTIVE' ? 'green' : 'default'}>{t(`userStatus.${s}`)}</Tag> },
    { title: t('common.createdAt'), dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => new Date(v).toLocaleDateString() },
    {
      title: t('common.actions'), key: 'actions',
      render: (_: any, record: Staff) => (
        <Space>
          <Button type="link" icon={<Edit size={14} />} onClick={() => openEdit(record)}>{t('common.edit')}</Button>
          <Popconfirm title={t('pages.staff.deleteConfirm')} onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<Trash2 size={14} />}>{t('common.delete')}</Button>
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
          <h1>{t('pages.staff.title')}</h1>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true) }}>
          {t('pages.staff.add')}
        </Button>
      </div>
      <Card bordered={false}>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>
      <Modal title={editing ? t('pages.staff.edit') : t('pages.staff.add')} open={modalOpen} onOk={handleSave} onCancel={() => { setModalOpen(false); setEditing(null) }} width={520} okText={t('common.confirm')} cancelText={t('common.cancel')}>
        <Form form={form} layout="vertical">
          <Form.Item name="username" label={t('common.username')} rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          {!editing && (
            <Form.Item name="password" label={t('common.password')} rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="displayName" label={t('pages.staff.displayName')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label={t('common.role')} rules={[{ required: true }]}>
            <Select options={[
              { value: 'OWNER', label: t('roles.OWNER') },
              { value: 'ADMIN', label: t('roles.ADMIN') },
              { value: 'STAFF', label: t('roles.STAFF') },
              { value: 'COACH', label: t('roles.COACH') },
            ]} />
          </Form.Item>
          <Form.Item name="phone" label={t('common.phone')}>
            <Input />
          </Form.Item>
          <Form.Item name="bio" label={t('pages.staff.bio')}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
