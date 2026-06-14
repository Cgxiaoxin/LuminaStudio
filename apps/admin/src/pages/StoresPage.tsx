import { useState } from "react";
import { Button, Card, Table, Tag, Space, Modal, Form, Input, message } from "antd";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Store {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  status: string;
  createdAt: string;
}

const mockStores: Store[] = [
  { id: 1, name: "Main Studio", code: "MAIN", address: "123 Fitness St", phone: "13800138000", status: "ACTIVE", createdAt: "2024-01-15" },
  { id: 2, name: "Branch Studio", code: "BR01", address: "456 Yoga Ave", phone: "13900139000", status: "ACTIVE", createdAt: "2024-02-20" },
];

const columns = [
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Code", dataIndex: "code", key: "code" },
  { title: "Address", dataIndex: "address", key: "address" },
  { title: "Phone", dataIndex: "phone", key: "phone" },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => (
      <Tag color={status === "ACTIVE" ? "green" : "default"}>{status}</Tag>
    ),
  },
  {
    title: "Actions",
    key: "actions",
    render: () => (
      <Space>
        <Button type="link" icon={<Edit size={14} />} size="small">Edit</Button>
        <Button type="link" danger icon={<Trash2 size={14} />} size="small">Delete</Button>
      </Space>
    ),
  },
];

export default function StoresPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = () => {
    form.validateFields().then((values) => {
      message.success("Store created");
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">LuminaStudio</p>
          <h1>Stores</h1>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
          Add Store
        </Button>
      </div>

      <Card bordered={false}>
        <Table columns={columns} dataSource={mockStores} rowKey="id" pagination={false} />
      </Card>

      <Modal
        title="Add Store"
        open={isModalOpen}
        onOk={handleCreate}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Store Name" rules={[{ required: true }]}>
            <Input placeholder="Enter store name" />
          </Form.Item>
          <Form.Item name="code" label="Store Code" rules={[{ required: true }]}>
            <Input placeholder="e.g., MAIN, BR01" />
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
