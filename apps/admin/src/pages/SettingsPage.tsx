import { useState, useEffect } from "react";
import { Button, Card, Form, Input, Upload, message, Typography, Image } from "antd";
import type { UploadProps } from "antd";
import { Upload as UploadIcon } from "lucide-react";
import { api } from "../services/api";
import { resolveAssetUrl, uploadImage } from "../services/upload";
import { useI18n } from "../i18n";

const { Title, Text } = Typography;

export default function SettingsPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>();
  const [form] = Form.useForm();
  const tenantId = localStorage.getItem("tenantId") || "1";

  const load = () => {
    setLoading(true);
    api.get(`/tenants/${tenantId}`)
      .then((res) => {
        form.setFieldsValue(res.data);
        setLogoPreview(resolveAssetUrl(res.data.logoUrl));
      })
      .catch(() => message.error(t("common.loadFailed")))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [form, tenantId, t]);

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await api.patch(`/tenants/${tenantId}`, values);
      message.success(t("pages.settings.saved"));
      window.dispatchEvent(new CustomEvent("tenant-branding-updated"));
    } catch (err: any) {
      message.error(err.response?.data?.message || t("common.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const uploadProps: UploadProps = {
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: async (file) => {
      setUploading(true);
      try {
        const url = await uploadImage(file as File);
        form.setFieldValue('logoUrl', url);
        setLogoPreview(resolveAssetUrl(url));
        message.success(t("pages.settings.uploadSuccess"));
      } catch (err: any) {
        message.error(err.message || t("pages.settings.uploadFailed"));
      } finally {
        setUploading(false);
      }
      return false;
    },
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
          <Form.Item label={t("pages.settings.logoUpload")}>
            <div className="logo-upload-row">
              <div className="logo-preview-box">
                {logoPreview ? (
                  <Image src={logoPreview} alt="logo" width={72} height={72} style={{ objectFit: 'cover', borderRadius: 12 }} />
                ) : (
                  <span className="logo-placeholder">LS</span>
                )}
              </div>
              <div className="logo-upload-actions">
                <Upload {...uploadProps}>
                  <Button icon={<UploadIcon size={16} />} loading={uploading}>
                    {t("pages.settings.uploadLogo")}
                  </Button>
                </Upload>
                <Text type="secondary" className="upload-hint">{t("pages.settings.uploadHint")}</Text>
              </div>
            </div>
          </Form.Item>
          <Form.Item name="logoUrl" label={t("pages.settings.logoUrl")}>
            <Input placeholder="/api/uploads/..." />
          </Form.Item>
          <Form.Item name="contactPhone" label={t("pages.settings.contactPhone")}>
            <Input />
          </Form.Item>
          <Form.Item name="agreementText" label={t("pages.settings.agreementText")}>
            <Input.TextArea rows={8} placeholder={t("pages.settings.agreementText")} />
          </Form.Item>
          <Button type="primary" onClick={handleSave} loading={saving}>
            {t("common.save")}
          </Button>
        </Form>
      </Card>
    </section>
  );
}
