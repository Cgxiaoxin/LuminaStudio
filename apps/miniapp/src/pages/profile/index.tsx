import { useState, useEffect } from 'react';
import { Text, View, Button } from '@tarojs/components';
import Taro, { useNavigate, showToast } from '@tarojs/taro';
import { request } from '../../services/api';
import './index.scss';
import type { Membership } from '../../types';

export default function ProfilePage() {
  const navigate = useNavigate();
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
      showToast({ title: 'Signed in', icon: 'success' });
      loadProfile();
    } catch {
      showToast({ title: 'Login failed', icon: 'none' });
    }
  };

  const handleLogout = () => {
    Taro.removeStorageSync('token');
    setUser(null);
    setMemberships([]);
    navigate({ url: '/pages/login/index' });
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: 'Active', EXHAUSTED: 'Exhausted', EXPIRED: 'Expired', CANCELED: 'Canceled',
  };

  return (
    <View className="profile-page">
      {!user ? (
        <View className="login-prompt">
          <View className="avatar-placeholder" />
          <Text className="login-text">Sign in to view your profile</Text>
          <Button className="login-btn" onClick={handleLogin}>Sign In with WeChat</Button>
        </View>
      ) : (
        <>
          <View className="user-card">
            <View className="avatar">{user.avatarUrl ? '' : user.nickname?.[0] || '?'}</View>
            <View className="user-info">
              <Text className="user-name">{user.nickname || 'User'}</Text>
              <Text className="user-phone">{user.phone || 'Bind phone number'}</Text>
            </View>
          </View>

          <View className="section">
            <Text className="section-title">My Memberships</Text>
            {memberships.length === 0 ? (
              <Text className="empty-text">No memberships yet</Text>
            ) : (
              memberships.map(m => (
                <View key={m.id} className="membership-card">
                  <View className="membership-header">
                    <Text className="membership-name">{m.name}</Text>
                    <Text className="membership-status">{statusLabels[m.status] || m.status}</Text>
                  </View>
                  <Text className="membership-info">
                    {m.type === 'DURATION_BASED'
                      ? 'Unlimited sessions'
                      : `${m.remainingTimes ?? 0} / ${m.totalTimes ?? 0} sessions left`}
                  </Text>
                </View>
              ))
            )}
          </View>

          <Button className="logout-btn" onClick={handleLogout}>Sign Out</Button>
        </>
      )}
    </View>
  );
}
