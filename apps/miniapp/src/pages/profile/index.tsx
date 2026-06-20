import { useState, useEffect } from 'react';
import { Text, View, Button } from '@tarojs/components';
import Taro, { showToast } from '@tarojs/taro';
import { request } from '../../services/api';
import { MembershipCardVisual } from '../../components/MembershipCardVisual';
import { t } from '../../i18n/messages';
import type { ClientStats } from '../../types/profile';
import type { Membership } from '../../types';
import './index.scss';

const menuItems = [
  { key: 'stats', labelKey: 'profile.menuStats', url: '/pages/profile-stats/index' },
  { key: 'agreement', labelKey: 'profile.menuAgreement', url: '/pages/profile-agreement/index' },
  { key: 'orders', labelKey: 'profile.menuOrders', url: '/pages/profile-orders/index' },
  { key: 'profile', labelKey: 'profile.menuProfile', url: '/pages/profile-edit/index' },
] as const;

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [bindingPhone, setBindingPhone] = useState(false);

  const loadProfile = () => {
    request('/auth/me').then(setUser).catch(() => setUser(null));
    request('/auth/me/stats').then(setStats).catch(() => setStats(null));
    request('/memberships?status=ACTIVE').then((res: any) => {
      setMemberships(res.data || []);
    }).catch(() => {});
  };

  useEffect(() => { loadProfile(); }, []);

  useEffect(() => {
    const handler = () => loadProfile();
    Taro.eventCenter.on('profile:refresh', handler);
    return () => Taro.eventCenter.off('profile:refresh', handler);
  }, []);

  const handleLogin = async () => {
    try {
      const { code } = await Taro.login();
      Taro.setStorageSync('tenantId', '1');
      const res = await request('/auth/weapp-login', { method: 'POST', data: { code } });
      Taro.setStorageSync('token', res.accessToken);
      showToast({ title: t('login.success'), icon: 'success' });
      loadProfile();
    } catch (err: any) {
      showToast({ title: err.message || t('errors.loginFailed'), icon: 'none' });
    }
  };

  const handleBindPhone = async (e: any) => {
    if (bindingPhone) return;
    const phoneCode = e?.detail?.code;
    if (!phoneCode) {
      showToast({ title: t('profile.bindPhone'), icon: 'none' });
      return;
    }
    setBindingPhone(true);
    try {
      const updated = await request('/auth/bind-phone-code', {
        method: 'POST',
        data: { code: phoneCode },
      });
      setUser(updated);
      showToast({ title: t('profile.bindPhoneSuccess'), icon: 'success' });
    } catch (err: any) {
      showToast({ title: err.message || t('common.failed'), icon: 'none' });
    } finally {
      setBindingPhone(false);
    }
  };

  const handleLogout = () => {
    Taro.removeStorageSync('token');
    setUser(null);
    setStats(null);
    setMemberships([]);
    Taro.reLaunch({ url: '/pages/login/index' });
  };

  const statItems = [
    { label: t('profile.totalClasses'), value: stats?.totalClasses ?? 0 },
    { label: t('profile.monthClasses'), value: stats?.monthClasses ?? 0 },
    { label: t('profile.monthAbsences'), value: stats?.monthAbsences ?? 0 },
    {
      label: t('profile.monthRank'),
      value: stats?.monthRank
        ? t('profile.rankValue', { n: stats.monthRank })
        : t('profile.rankEmpty'),
    },
  ];

  return (
    <View className="profile-page">
      {!user ? (
        <View className="login-prompt">
          <View className="avatar-placeholder" />
          <Text className="login-text">{t('profile.loginPrompt')}</Text>
          <Button className="login-btn" onClick={handleLogin}>{t('login.submit')}</Button>
        </View>
      ) : (
        <>
          <View className="user-card">
            <View className="avatar">{user.avatarUrl ? '' : user.nickname?.[0] || '?'}</View>
            <View className="user-info">
              <Text className="user-name">{user.nickname || t('common.user')}</Text>
              <Text className="user-phone">{user.phone || t('profile.bindPhone')}</Text>
            </View>
          </View>

          {!user.phone && (
            <Button
              className="bind-phone-btn"
              openType="getPhoneNumber"
              onGetPhoneNumber={handleBindPhone}
              loading={bindingPhone}
            >
              {t('profile.bindPhoneAction')}
            </Button>
          )}

          <View className="stats-grid">
            {statItems.map(item => (
              <View key={item.label} className="stats-item">
                <Text className="stats-value">{item.value}</Text>
                <Text className="stats-label">{item.label}</Text>
              </View>
            ))}
          </View>

          <View className="menu-list">
            {menuItems.map(item => (
              <View
                key={item.key}
                className="menu-item"
                onClick={() => Taro.navigateTo({ url: item.url })}
              >
                <Text className="menu-item__label">{t(item.labelKey)}</Text>
                <Text className="menu-item__arrow">›</Text>
              </View>
            ))}
          </View>

          <View className="section">
            <Text className="section-title">{t('profile.myMemberships')}</Text>
            {memberships.length === 0 ? (
              <Text className="empty-text">{t('profile.noMemberships')}</Text>
            ) : (
              memberships.slice(0, 2).map(m => (
                <MembershipCardVisual key={m.id} membership={m} />
              ))
            )}
          </View>

          <Button className="logout-btn" onClick={handleLogout}>{t('profile.logout')}</Button>
        </>
      )}
    </View>
  );
}
