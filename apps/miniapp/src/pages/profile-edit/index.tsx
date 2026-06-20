import { useState, useEffect } from 'react';
import { Text, View, Input, Button } from '@tarojs/components';
import Taro, { showToast } from '@tarojs/taro';
import { request } from '../../services/api';
import { LoadingState } from '../../components/LoadingState';
import { t } from '../../i18n/messages';
import './index.scss';

export default function ProfileEditPage() {
  const [user, setUser] = useState<any>(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    request('/auth/me')
      .then((res) => {
        setUser(res);
        setNickname(res.nickname || '');
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!nickname.trim()) {
      showToast({ title: t('profileEdit.nickname'), icon: 'none' });
      return;
    }
    setSaving(true);
    try {
      await request('/auth/me', { method: 'PATCH', data: { nickname: nickname.trim() } });
      showToast({ title: t('profileEdit.saved'), icon: 'success' });
      Taro.eventCenter.trigger('profile:refresh');
      setTimeout(() => Taro.navigateBack(), 500);
    } catch (err: any) {
      showToast({ title: err.message || t('common.failed'), icon: 'none' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <View className="profile-sub-page edit-page">
      <View className="form-card">
        <View className="form-item">
          <Text className="form-label">{t('profileEdit.nickname')}</Text>
          <Input
            className="form-input"
            value={nickname}
            onInput={(e) => setNickname(e.detail.value)}
            placeholder={t('profileEdit.nickname')}
          />
        </View>
        <View className="form-item">
          <Text className="form-label">{t('profileEdit.phone')}</Text>
          <Text className="form-readonly">{user?.phone || t('profile.bindPhone')}</Text>
        </View>
        {user?.createdAt && (
          <View className="form-item">
            <Text className="form-label">{t('profileEdit.memberSince')}</Text>
            <Text className="form-readonly">
              {new Date(user.createdAt).toLocaleDateString('zh-CN')}
            </Text>
          </View>
        )}
      </View>
      <Button className="save-btn" loading={saving} onClick={handleSave}>
        {t('profileEdit.save')}
      </Button>
    </View>
  );
}
