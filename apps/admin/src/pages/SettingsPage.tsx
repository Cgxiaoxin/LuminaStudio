import { useState, useEffect } from "react";
import { Button, Card, Form, Input, message, Typography } from "antd";
import { api } from "../services/api";
import { useI18n } from "../i18n";

const { Title, Text } = Typography;

export default function SettingsPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const tenantId = localStorage.getItem("tenantId") || "1";

  useEffect(() => {
    setLoading(true);
    api.get(`/tenants/${tenantId}`)
      .then((res) => form.setFieldsValue(res.data))
      .catch(() => message.error(t("common.loadFailed")))
      .finally(() => setLoading(false));
  }, [form, tenantId, t]);

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await api.patch(`/tenants/${tenantId}`, values);
      message.success(t("pages.settings.saved"));
    } catch (err: any) {
      message.error(err.response?.data?.message || t("common.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t("common.eyebrow")}</p>
          <Title level={2} style={{ margin: 0 }}>{t("pages.settings.title")}</Title>
          <Text type="secondary">{t("pages.settings.subtitle")}</Text>
        </div>
      </div>
      <Card bordered={false} loading={loading}>
        <Form form={form} layout="vertical" style={{ maxWidth: 520 }}>
          <Form.Item name="name" label={t("pages.settings.studioName")} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label={t("pages.settings.tenantCode")}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="brandName" label={t("pages.settings.brandName")}>
            <Input />
          </Form.Item>
          <Form.Item name="logoUrl" label={t("pages.settings.logoUrl")}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="contactPhone" label={t("pages.settings.contactPhone")}>
            <Input />
          </Form.Item>
          <Button type="primary" onClick={handleSave} loading={saving}>
            {t("common.save")}
          </Button>
        </Form>
      </Card>
    </section>
  );
}
