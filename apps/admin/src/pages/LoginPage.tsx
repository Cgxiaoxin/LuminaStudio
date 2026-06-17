import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { api } from '../services/api';
import { useI18n } from '../i18n';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleLogin = async (values: { username: string; password: string; tenantId: string }) => {
    setLoading(true);
    try {
      const tenantId = values.tenantId || '1';
      const res = await api.post('/auth/admin-login', {
        username: values.username,
        password: values.password,
      }, {
        headers: { 'X-Tenant-Id': tenantId },
      });
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('tenantId', tenantId);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      message.success(t('login.success'));
      navigate('/dashboard');
    } catch (err: any) {
      message.error(err.response?.data?.message || t('login.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-toolbar">
        <LanguageSwitcher size="small" />
      </div>
      <Card bordered={false} className="login-card">
        <div className="login-header">
          <span className="brand-mark">LS</span>
          <Title level={3}>{t('common.brand')}</Title>
          <Text type="secondary">{t('login.subtitle')}</Text>
        </div>
        <Form layout="vertical" onFinish={handleLogin} autoComplete="off">
          <Form.Item label={t('login.tenantId')} name="tenantId" initialValue="1">
            <Input placeholder={t('login.tenantIdPlaceholder')} />
          </Form.Item>
          <Form.Item label={t('login.username')} name="username" rules={[{ required: true, message: t('login.usernameRequired') }]}>
            <Input placeholder={t('login.usernamePlaceholder')} />
          </Form.Item>
          <Form.Item label={t('login.password')} name="password" rules={[{ required: true, message: t('login.passwordRequired') }]}>
            <Input.Password placeholder={t('login.passwordPlaceholder')} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {t('login.submit')}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
