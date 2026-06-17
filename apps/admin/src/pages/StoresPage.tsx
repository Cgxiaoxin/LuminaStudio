import { useMemo, useState, useEffect } from "react";
import { Button, Card, Table, Tag, Space, Modal, Form, Input, message, Popconfirm } from "antd";
import { Plus, Edit, Trash2 } from "lucide-react";
import { api } from "../services/api";
import { useI18n } from "../i18n";

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
  const { t } = useI18n();
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
      message.error(t("common.loadFailed"));
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
        message.success(t("common.updated"));
      } else {
        await api.post("/stores", values);
        message.success(t("pages.stores.created"));
      }
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      fetch();
    } catch (err: any) {
      message.error(err.response?.data?.message || t("common.operationFailed"));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/stores/${id}`);
      message.success(t("pages.stores.deactivated"));
      fetch();
    } catch {
      message.error(t("common.deleteFailed"));
    }
  };

  const columns = useMemo(() => [
    { title: t("common.name"), dataIndex: "name", key: "name" },
    { title: t("common.code"), dataIndex: "code", key: "code" },
    { title: t("common.address"), dataIndex: "address", key: "address", render: (v: string) => v || "-" },
    { title: t("common.phone"), dataIndex: "phone", key: "phone", render: (v: string) => v || "-" },
    {
      title: t("common.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={status === "ACTIVE" ? "green" : "default"}>{status}</Tag>,
    },
    {
      title: t("common.created"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      title: t("common.actions"),
      key: "actions",
      render: (_: unknown, record: Store) => (
        <Space>
          <Button type="link" icon={<Edit size={14} />} size="small" onClick={() => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); }}>
            {t("common.edit")}
          </Button>
          <Popconfirm title={t("pages.stores.deleteConfirm")} onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<Trash2 size={14} />} size="small">{t("common.delete")}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], [t, form]);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t("common.eyebrow")}</p>
          <h1>{t("pages.stores.title")}</h1>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          {t("pages.stores.add")}
        </Button>
      </div>
      <Card bordered={false}>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>
      <Modal
        title={editing ? t("pages.stores.edit") : t("pages.stores.add")}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); setEditing(null); }}
        okText={t("common.confirm")}
        cancelText={t("common.cancel")}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t("common.name")} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label={t("common.code")} rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="address" label={t("common.address")}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label={t("common.phone")}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
