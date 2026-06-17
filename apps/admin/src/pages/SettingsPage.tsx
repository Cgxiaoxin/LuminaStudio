import { useState, useEffect } from "react";
import { Button, Card, Form, Input, message, Typography } from "antd";
import { api } from "../services/api";

const { Title, Text } = Typography;

interface TenantSettings {
  id: number;
  name: string;
  code: string;
  brandName: string | null;
  logoUrl: string | null;
  contactPhone: string | null;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const tenantId = localStorage.getItem("tenantId") || "1";

  useEffect(() => {
    setLoading(true);
    api.get(`/tenants/${tenantId}`)
      .then((res) => form.setFieldsValue(res.data))
      .catch(() => message.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, [form, tenantId]);

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await api.patch(`/tenants/${tenantId}`, values);
      message.success("Settings saved");
    } catch (err: any) {
      message.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">LuminaStudio</p>
          <Title level={2} style={{ margin: 0 }}>Settings</Title>
          <Text type="secondary">Studio profile and branding</Text>
        </div>
      </div>

      <Card bordered={false} loading={loading}>
        <Form form={form} layout="vertical" style={{ maxWidth: 520 }}>
          <Form.Item name="name" label="Studio Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Tenant Code">
            <Input disabled />
          </Form.Item>
          <Form.Item name="brandName" label="Brand Name">
            <Input />
          </Form.Item>
          <Form.Item name="logoUrl" label="Logo URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="contactPhone" label="Contact Phone">
            <Input />
          </Form.Item>
          <Button type="primary" onClick={handleSave} loading={saving}>
            Save Settings
          </Button>
        </Form>
      </Card>
    </section>
  );
}
