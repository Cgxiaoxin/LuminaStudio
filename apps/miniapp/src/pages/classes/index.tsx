import { Text, View } from "@tarojs/components";
import { useNavigate } from "@tarojs/taro";
import "./index.scss";

const classes = [
  {
    id: 1,
    name: "Morning Pilates",
    type: "GROUP_CLASS",
    coach: "Coach Li",
    duration: 60,
    price: 128,
    spots: 3,
    totalSpots: 12,
  },
  {
    id: 2,
    name: "Yoga Flow",
    type: "GROUP_CLASS",
    coach: "Coach Wang",
    duration: 75,
    price: 148,
    spots: 5,
    totalSpots: 15,
  },
  {
    id: 3,
    name: "Core Training",
    type: "GROUP_CLASS",
    coach: "Coach Zhang",
    duration: 45,
    price: 98,
    spots: 2,
    totalSpots: 10,
  },
  {
    id: 4,
    name: "Private Pilates",
    type: "PRIVATE_SESSION",
    coach: "Coach Li",
    duration: 60,
    price: 298,
    spots: 1,
    totalSpots: 1,
  },
];

const typeLabels: Record<string, string> = {
  GROUP_CLASS: "Group",
  PRIVATE_SESSION: "Private",
};

export default function ClassesPage() {
  const navigate = useNavigate();

  const goToDetail = (id: number) => {
    // Navigate to class detail (not yet implemented)
    console.log("Navigate to class detail:", id);
  };

  return (
    <View className="classes-page">
      <View className="header">
        <Text className="title">Classes</Text>
        <Text className="subtitle">{classes.length} classes available</Text>
      </View>

      <View className="filter-bar">
        <View className="filter-item active">
          <Text>All</Text>
        </View>
        <View className="filter-item">
          <Text>Group</Text>
        </View>
        <View className="filter-item">
          <Text>Private</Text>
        </View>
      </View>

      <View className="class-list">
        {classes.map((cls) => (
          <View key={cls.id} className="class-card" onClick={() => goToDetail(cls.id)}>
            <View className="class-header">
              <Text className="class-name">{cls.name}</Text>
              <View className="class-type">
                <Text>{typeLabels[cls.type]}</Text>
              </View>
            </View>
            <View className="class-details">
              <Text className="detail-item">Coach: {cls.coach}</Text>
              <Text className="detail-item">{cls.duration} min</Text>
            </View>
            <View className="class-footer">
              <Text className="class-price">¥{cls.price}</Text>
              <Text className={cls.spots <= 2 ? "spots-low" : "spots"}>
                {cls.spots} spots left
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
