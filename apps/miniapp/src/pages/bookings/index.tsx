import { Text, View } from "@tarojs/components";

export default function BookingsPage() {
  return (
    <View className="page">
      <Text className="section-title">My Bookings</Text>
      <View className="panel">
        <Text>Upcoming, completed, and canceled bookings will appear here.</Text>
      </View>
    </View>
  );
}
