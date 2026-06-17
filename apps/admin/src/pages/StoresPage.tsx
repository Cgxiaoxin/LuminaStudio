import { useState, useEffect } from "react";
import { Button, Card, Table, Tag, Space, Modal, Form, Input, message, Popconfirm } from "antd";
import { Plus, Edit, Trash2 } from "lucide-react";
import { api } from "../services/api";

interface Store {
  id: number;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
}

export default function StoresPage() {
  const [data, setData] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);
  const [form] = Form.useForm();

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get("/stores");
      setData(res.data.data || res.data);
    } catch {
      message.error("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api.patch(`/stores/${editing.id}`, values);
      } else {
        await api.post("/stores", values);
      }
      message.success(editing ? "Store updated" : "Store created");
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      fetch();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/stores/${id}`);
      message.success("Store deactivated");
      fetch();
    } catch {
      message.error("Delete failed");
    }
  };

  const openEdit = (record: Store) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Code", dataIndex: "code", key: "code" },
    { title: "Address", dataIndex: "address", key: "address", render: (v: string) => v || "-" },
    { title: "Phone", dataIndex: "phone", key: "phone", render: (v: string) => v || "-" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "default"}>{status}</Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Store) => (
        <Space>
          <Button type="link" icon={<Edit size={14} />} size="small" onClick={() => openEdit(record)}>Edit</Button>
          <Popconfirm title="Deactivate this store?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<Trash2 size={14} />} size="small">Delete</Button>
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
          <h1>Stores</h1>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          Add Store
        </Button>
      </div>

      <Card bordered={false}>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>

      <Modal
        title={editing ? "Edit Store" : "Add Store"}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); setEditing(null); }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Store Name" rules={[{ required: true }]}>
            <Input placeholder="Enter store name" />
          </Form.Item>
          <Form.Item name="code" label="Store Code" rules={[{ required: true }]}>
            <Input placeholder="e.g., MAIN, BR01" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input placeholder="Enter address" />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input placeholder="Enter phone number" />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
