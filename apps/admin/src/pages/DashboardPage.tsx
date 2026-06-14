import { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import { CalendarDays, CheckCircle, CreditCard, Users } from 'lucide-react';
import dayjs from 'dayjs';
import { api } from '../services/api';

const statusColors: Record<string, string> = {
  CREATED: 'default', PENDING_PAYMENT: 'orange', CONFIRMED: 'blue',
  CHECKED_IN: 'green', COMPLETED: 'purple', CANCELED: 'red',
};

const columns = [
  { title: 'Client', key: 'client', render: (_: any, r: any) => r.client?.nickname || r.client?.phone || '-' },
  { title: 'Service', key: 'service', render: (_: any, r: any) => r.service?.name || '-' },
  { title: 'Time', key: 'time', render: (_: any, r: any) => r.schedule ? dayjs(r.schedule.startAt).format('MM/DD HH:mm') : '-' },
  { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({ todayBookings: 0, checkins: 0, revenue: 0, activeClients: 0 });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = dayjs().format('YYYY-MM-DD');
        const [bookingRes] = await Promise.all([
          api.get('/bookings', { params: { dateFrom: today, dateTo: today, limit: 10 } }),
        ]);
        const bookings = bookingRes.data.data || [];
        setRecentBookings(bookings);
        setStats({
          todayBookings: bookings.length,
          checkins: bookings.filter((b: any) => b.status === 'CHECKED_IN' || b.status === 'COMPLETED').length,
          revenue: bookings.reduce((s: number, b: any) => s + Number(b.paidAmount || 0), 0),
          activeClients: new Set(bookings.map((b: any) => b.clientId)).size,
        });
      } catch {
        // Fallback to mock defaults
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: "Today's Bookings", value: stats.todayBookings, icon: CalendarDays, color: '#2e6f57' },
    { title: 'Check-ins', value: stats.checkins, icon: CheckCircle, color: '#1f8a5b' },
    { title: 'Revenue', value: stats.revenue, prefix: '¥', icon: CreditCard, color: '#2f6f9f' },
    { title: 'Active Clients', value: stats.activeClients, icon: Users, color: '#c77700' },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">LuminaStudio</p>
          <h1>Dashboard</h1>
        </div>
      </div>
      <Row gutter={[16, 16]}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Col xs={24} sm={12} lg={6} key={stat.title}>
              <Card bordered={false} className="stat-card">
                <Statistic title={stat.title} value={stat.value} prefix={stat.prefix} valueStyle={{ color: stat.color }} />
              </Card>
            </Col>
          );
        })}
      </Row>
      <Card title="Recent Bookings" bordered={false} style={{ marginTop: 16 }}>
        <Table columns={columns} dataSource={recentBookings} rowKey="id" pagination={false} size="small" />
      </Card>
    </section>
  );
}
