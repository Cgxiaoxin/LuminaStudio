import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { api } from '../services/api';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      message.success('Login successful');
      navigate('/dashboard');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card bordered={false} className="login-card">
        <div className="login-header">
          <span className="brand-mark">LS</span>
          <Title level={3}>LuminaStudio</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>
        <Form layout="vertical" onFinish={handleLogin} autoComplete="off">
          <Form.Item label="Tenant ID" name="tenantId" initialValue="1">
            <Input placeholder="Tenant ID" />
          </Form.Item>
          <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Please enter username' }]}>
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter password' }]}>
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign In
          </Button>
        </Form>
      </Card>
    </div>
  );
}
