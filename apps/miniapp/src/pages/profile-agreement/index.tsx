import { useEffect, useState } from 'react';
import { Text, View } from '@tarojs/components';
import { request } from '../../services/api';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { t } from '../../i18n/messages';
import './index.scss';

export default function ProfileAgreementPage() {
  const [content, setContent] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    request('/auth/agreement')
      .then((res: any) => {
        setContent(res.content || t('profileAgreement.content'));
        setUpdatedAt(res.updatedAt ? new Date(res.updatedAt).toLocaleDateString('zh-CN') : '');
      })
      .catch((err: any) => setError(err.message || t('errors.loadFailed')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <View className="profile-sub-page agreement-page">
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <Text className="agreement-updated">
            {updatedAt ? t('profileAgreement.updatedAtDynamic', { date: updatedAt }) : t('profileAgreement.updatedAt')}
          </Text>
          <View className="agreement-card">
            <Text className="agreement-content">{content}</Text>
          </View>
        </>
      )}
    </View>
  );
}
