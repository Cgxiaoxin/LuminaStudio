import { useMemo, useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import { CalendarDays, CheckCircle, CreditCard, Users } from 'lucide-react';
import dayjs from 'dayjs';
import { api } from '../services/api';
import { useI18n } from '../i18n';

const statusColors: Record<string, string> = {
  CREATED: 'default', PENDING_PAYMENT: 'orange', CONFIRMED: 'blue',
  CHECKED_IN: 'green', COMPLETED: 'purple', CANCELED: 'red',
};

export default function DashboardPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState({ todayBookings: 0, checkins: 0, revenue: 0, activeClients: 0 });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = dayjs().format('YYYY-MM-DD');
        const [dashRes, bookingRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/bookings', { params: { dateFrom: today, dateTo: today, limit: 10 } }),
        ]);
        const dash = dashRes.data;
        setStats({
          todayBookings: dash.todayBookings ?? 0,
          checkins: dash.todayCheckins ?? 0,
          revenue: Number(dash.todayRevenue ?? 0),
          activeClients: dash.activeClients ?? 0,
        });
        setRecentBookings(bookingRes.data.data || []);
      } catch {
        // ignore
      }
    };
    fetchData();
  }, []);

  const columns = useMemo(() => [
    { title: t('common.client'), key: 'client', render: (_: any, r: any) => r.client?.nickname || r.client?.phone || '-' },
    { title: t('common.service'), key: 'service', render: (_: any, r: any) => r.service?.name || '-' },
    { title: t('common.time'), key: 'time', render: (_: any, r: any) => r.schedule ? dayjs(r.schedule.startAt).format('MM/DD HH:mm') : '-' },
    { title: t('common.status'), dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{t(`bookingStatus.${s}`)}</Tag> },
  ], [t]);

  const statCards = [
    { title: t('pages.dashboard.todayBookings'), value: stats.todayBookings, icon: CalendarDays, color: '#2e6f57' },
    { title: t('pages.dashboard.checkins'), value: stats.checkins, icon: CheckCircle, color: '#1f8a5b' },
    { title: t('pages.dashboard.revenue'), value: stats.revenue, prefix: '¥', icon: CreditCard, color: '#2f6f9f' },
    { title: t('pages.dashboard.activeClients'), value: stats.activeClients, icon: Users, color: '#c77700' },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t('common.eyebrow')}</p>
          <h1>{t('pages.dashboard.title')}</h1>
        </div>
      </div>
      <Row gutter={[16, 16]}>
        {statCards.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <Card bordered={false} className="stat-card">
              <Statistic title={stat.title} value={stat.value} prefix={stat.prefix} valueStyle={{ color: stat.color }} />
            </Card>
          </Col>
        ))}
      </Row>
      <Card title={t('pages.dashboard.recentBookings')} bordered={false} style={{ marginTop: 16 }}>
        <Table columns={columns} dataSource={recentBookings} rowKey="id" pagination={false} size="small" />
      </Card>
    </section>
  );
}
