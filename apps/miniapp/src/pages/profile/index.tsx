import { useState, useEffect } from 'react';
import { Text, View, Button } from '@tarojs/components';
import Taro, { showToast } from '@tarojs/taro';
import { request } from '../../services/api';
import { membershipStatusLabel, t } from '../../i18n/messages';
import './index.scss';
import type { Membership } from '../../types';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);

  const loadProfile = () => {
    request('/auth/me').then(setUser).catch(() => setUser(null));
    request('/memberships?status=ACTIVE').then((res: any) => {
      setMemberships(res.data || []);
    }).catch(() => {});
  };

  useEffect(() => { loadProfile(); }, []);

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

  const handleLogout = () => {
    Taro.removeStorageSync('token');
    setUser(null);
    setMemberships([]);
    Taro.reLaunch({ url: '/pages/login/index' });
  };

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

          <View className="section">
            <Text className="section-title">{t('profile.myMemberships')}</Text>
            {memberships.length === 0 ? (
              <Text className="empty-text">{t('profile.noMemberships')}</Text>
            ) : (
              memberships.map(m => (
                <View key={m.id} className="membership-card">
                  <View className="membership-header">
                    <Text className="membership-name">{m.name}</Text>
                    <Text className="membership-status">{membershipStatusLabel(m.status)}</Text>
                  </View>
                  <Text className="membership-info">
                    {m.type === 'DURATION_BASED'
                      ? t('profile.unlimitedSessions')
                      : t('profile.sessionsLeft', { remaining: m.remainingTimes ?? 0, total: m.totalTimes ?? 0 })}
                  </Text>
                </View>
              ))
            )}
          </View>

          <Button className="logout-btn" onClick={handleLogout}>{t('profile.logout')}</Button>
        </>
      )}
    </View>
  );
}
