import { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { request } from '../../services/api';
import { apiBaseUrl } from '../../services/config';
import { t } from '../../i18n/messages';
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
        throw new Error(t('errors.wechatLoginFailed'));
      }
      Taro.setStorageSync('tenantId', '1');
      const res = await request('/auth/weapp-login', {
        method: 'POST',
        data: { code },
        auth: false,
      });
      Taro.setStorageSync('token', res.accessToken);
      Taro.setStorageSync('tenantId', String(res.client?.tenantId || 1));
      Taro.showToast({ title: t('login.success'), icon: 'success' });
      setTimeout(() => Taro.switchTab({ url: '/pages/home/index' }), 500);
    } catch (err: any) {
      Taro.showToast({ title: err.message || t('errors.loginFailed'), icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="login-page">
      <View className="login-card">
        <Text className="brand">{t('common.brand')}</Text>
        <Text className="subtitle">{t('login.subtitle')}</Text>
        <Text className="api-hint">API: {apiBaseUrl}</Text>
        <Button className="login-btn" loading={loading} onClick={handleLogin}>
          {t('login.submit')}
        </Button>
      </View>
    </View>
  );
}
