import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { api } from '../services/api';
import { useI18n } from '../i18n';

export default function ReportsPage() {
  const { t } = useI18n();
  const [dashboard, setDashboard] = useState<any>({});

  useEffect(() => {
    api.get('/reports/dashboard').then(res => setDashboard(res.data || {})).catch(() => {});
  }, []);

  const stats = [
    { title: t('pages.dashboard.todayBookings'), value: dashboard.todayBookings },
    { title: t('pages.dashboard.checkins'), value: dashboard.todayCheckins },
    { title: t('pages.dashboard.revenue'), value: dashboard.todayRevenue, prefix: '¥' },
    { title: t('pages.dashboard.activeClients'), value: dashboard.activeClients },
    { title: t('pages.reports.services'), value: dashboard.totalServices },
    { title: t('pages.reports.upcoming'), value: dashboard.upcomingSchedules },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t('common.eyebrow')}</p>
          <h1>{t('pages.reports.title')}</h1>
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
