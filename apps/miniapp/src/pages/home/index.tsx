import { Text, View, Image } from "@tarojs/components";
import { useNavigate } from "@tarojs/taro";
import "./index.scss";

const recommendedClasses = [
  { id: 1, name: "Morning Pilates", coach: "Coach Li", time: "09:00", spots: 3 },
  { id: 2, name: "Yoga Flow", coach: "Coach Wang", time: "10:30", spots: 5 },
  { id: 3, name: "Core Training", coach: "Coach Zhang", time: "14:00", spots: 2 },
];

export default function HomePage() {
  const navigate = useNavigate();

  const goToClassDetail = (id: number) => {
    navigate({ url: `/pages/classes/index?id=${id}` });
  };

  return (
    <View className="home-page">
      <View className="header">
        <Text className="brand">LuminaStudio</Text>
        <Text className="subtitle">Pilates & Yoga Studio</Text>
      </View>

      <View className="section">
        <Text className="section-title">Recommended Classes</Text>
        <View className="class-list">
          {recommendedClasses.map((cls) => (
            <View
              key={cls.id}
              className="class-card"
              onClick={() => goToClassDetail(cls.id)}
            >
              <View className="class-info">
                <Text className="class-name">{cls.name}</Text>
                <Text className="class-coach">{cls.coach}</Text>
                <Text className="class-time">{cls.time}</Text>
              </View>
              <View className="class-spots">
                <Text className={cls.spots <= 2 ? "spots-low" : "spots"}>
                  {cls.spots} spots left
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="section">
        <Text className="section-title">Quick Actions</Text>
        <View className="action-grid">
          <View className="action-item" onClick={() => navigate({ url: "/pages/classes/index" })}>
            <Text className="action-icon">📚</Text>
            <Text className="action-text">Browse Classes</Text>
          </View>
          <View className="action-item" onClick={() => navigate({ url: "/pages/bookings/index" })}>
            <Text className="action-icon">📅</Text>
            <Text className="action-text">My Bookings</Text>
          </View>
          <View className="action-item" onClick={() => navigate({ url: "/pages/profile/index" })}>
            <Text className="action-icon">👤</Text>
            <Text className="action-text">Profile</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
