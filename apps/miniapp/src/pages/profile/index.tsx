import { Text, View } from "@tarojs/components";

export default function ProfilePage() {
  return (
    <View className="page">
      <Text className="section-title">Profile</Text>
      <View className="panel">
        <Text>Memberships, coupons, and training history will appear here.</Text>
      </View>
    </View>
  );
}
