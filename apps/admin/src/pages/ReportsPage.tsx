import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { api } from '../services/api';

const { RangePicker } = DatePicker;

export default function ReportsPage() {
  const [dashboard, setDashboard] = useState<any>({});

  useEffect(() => {
    api.get('/reports/dashboard').then(res => setDashboard(res.data || {})).catch(() => {});
  }, []);

  const stats = [
    { title: "Today's Bookings", value: dashboard.todayBookings },
    { title: 'Check-ins', value: dashboard.todayCheckins },
    { title: 'Revenue', value: dashboard.todayRevenue, prefix: '¥' },
    { title: 'Active Clients', value: dashboard.activeClients },
    { title: 'Services', value: dashboard.totalServices },
    { title: 'Upcoming', value: dashboard.upcomingSchedules },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">LuminaStudio</p>
          <h1>Reports</h1>
        </div>
      </div>
      <Row gutter={[16, 16]}>
        {stats.map(s => (
          <Col xs={12} lg={8} key={s.title}>
            <Card bordered={false}>
              <Statistic title={s.title} value={s.value} prefix={s.prefix} />
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
}
