import { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useLoad, useRouter } from '@tarojs/taro';
import { request } from '../../services/api';
import { apiBaseUrl } from '../../services/config';
import { t } from '../../i18n/messages';
import './index.scss';

const TAB_PAGES = new Set([
  '/pages/home/index',
  '/pages/classes/index',
  '/pages/bookings/index',
  '/pages/venue/index',
]);

function goAfterLogin(redirect?: string) {
  const target = redirect ? decodeURIComponent(redirect) : '/pages/home/index';
  if (TAB_PAGES.has(target.split('?')[0])) {
    Taro.switchTab({ url: target.split('?')[0] });
    return;
  }
  if (target.startsWith('/pages/')) {
    Taro.redirectTo({ url: target });
    return;
  }
  Taro.switchTab({ url: '/pages/home/index' });
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isDev = process.env.NODE_ENV !== 'production';

  useLoad(() => {
    const token = Taro.getStorageSync('token');
    if (token) {
      goAfterLogin(router.params.redirect);
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
      setTimeout(() => goAfterLogin(router.params.redirect), 500);
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
        {isDev ? <Text className="api-hint">API: {apiBaseUrl}</Text> : null}
        <Button className="login-btn" loading={loading} onClick={handleLogin}>
          {t('login.submit')}
        </Button>
        <Button className="browse-btn" onClick={() => Taro.switchTab({ url: '/pages/home/index' })}>
          {t('login.browseFirst')}
        </Button>
      </View>
    </View>
  );
}
