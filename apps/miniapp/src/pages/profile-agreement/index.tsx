import { Text, View } from '@tarojs/components';
import { t } from '../../i18n/messages';
import './index.scss';

export default function ProfileAgreementPage() {
  return (
    <View className="profile-sub-page agreement-page">
      <Text className="agreement-updated">{t('profileAgreement.updatedAt')}</Text>
      <View className="agreement-card">
        <Text className="agreement-content">{t('profileAgreement.content')}</Text>
      </View>
    </View>
  );
}
