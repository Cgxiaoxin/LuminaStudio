import { Card, Col, Row, Statistic, Table, Tag } from "antd";
import { CalendarDays, CheckCircle, CreditCard, Users } from "lucide-react";

const todayStats = [
  { title: "Today's Bookings", value: 12, icon: CalendarDays, color: "#2e6f57" },
  { title: "Check-ins", value: 8, icon: CheckCircle, color: "#1f8a5b" },
  { title: "Revenue", value: 2480, prefix: "¥", icon: CreditCard, color: "#2f6f9f" },
  { title: "Active Clients", value: 45, icon: Users, color: "#c77700" },
];

const recentBookings = [
  { key: "1", client: "Alice Wang", class: "Morning Pilates", time: "09:00", status: "CONFIRMED" },
  { key: "2", client: "Bob Li", class: "Yoga Flow", time: "10:30", status: "CHECKED_IN" },
  { key: "3", client: "Carol Zhang", class: "Private Session", time: "14:00", status: "PENDING" },
];

const statusColors: Record<string, string> = {
  CONFIRMED: "green",
  CHECKED_IN: "blue",
  PENDING: "orange",
  CANCELED: "red",
};

const columns = [
  { title: "Client", dataIndex: "client" },
  { title: "Class", dataIndex: "class" },
  { title: "Time", dataIndex: "time" },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
  },
];

export default function DashboardPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">LuminaStudio</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {todayStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Col xs={24} sm={12} lg={6} key={stat.title}>
              <Card bordered={false} className="stat-card">
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={stat.prefix}
                  valueStyle={{ color: stat.color }}
                />
              </Card>
            </Col>
          );
        })}
      </Row>

      <Card title="Recent Bookings" bordered={false} style={{ marginTop: 16 }}>
        <Table columns={columns} dataSource={recentBookings} pagination={false} size="small" />
      </Card>
    </section>
  );
}
