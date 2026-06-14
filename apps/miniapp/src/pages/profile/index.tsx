import { useState, useEffect } from 'react';
import { Text, View, Button } from '@tarojs/components';
import { useNavigate, showToast } from '@tarojs/taro';
import { request, apiBaseUrl } from '../../services/api';
import './index.scss';
import type { Membership } from '../../types';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);

  useEffect(() => {
    request('/auth/me').then(setUser).catch(() => {});
    request('/memberships?limit=10').then((res: any) => {
      setMemberships(res.data || []);
    }).catch(() => {});
  }, []);

  const handleLogin = () => {
    // In a real app, this would call wx.login() and then weapp-login
    showToast({ title: 'WeChat login not configured', icon: 'none' });
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
                      : `${m.remainingTimes ?? 0}/${m.totalTimes ?? 0} sessions remaining`
                    }
                  </Text>
                  {m.expiredAt && (
                    <Text className="membership-expiry">Valid until {new Date(m.expiredAt).toLocaleDateString('zh-CN')}</Text>
                  )}
                </View>
              ))
            )}
          </View>
        </>
      )}
    </View>
  );
}
