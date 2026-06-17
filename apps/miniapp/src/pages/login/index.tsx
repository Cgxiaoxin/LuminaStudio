import { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { request } from '../../services/api';
import './index.scss';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  useLoad(() => {
    const token = Taro.getStorageSync('token');
    if (token) {
      Taro.switchTab({ url: '/pages/home/index' });
    }
  });

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { code } = await Taro.login();
      if (!code) {
        throw new Error('WeChat login failed');
      }
      Taro.setStorageSync('tenantId', '1');
      const res = await request('/auth/weapp-login', {
        method: 'POST',
        data: { code },
      });
      Taro.setStorageSync('token', res.accessToken);
      Taro.setStorageSync('tenantId', String(res.client?.tenantId || 1));
      Taro.showToast({ title: 'Signed in', icon: 'success' });
      setTimeout(() => Taro.switchTab({ url: '/pages/home/index' }), 500);
    } catch (err: any) {
      Taro.showToast({ title: err.message || 'Login failed', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="login-page">
      <View className="login-card">
        <Text className="brand">LuminaStudio</Text>
        <Text className="subtitle">Sign in to book classes and manage memberships</Text>
        <Button className="login-btn" loading={loading} onClick={handleLogin}>
          Sign In with WeChat
        </Button>
      </View>
    </View>
  );
}
