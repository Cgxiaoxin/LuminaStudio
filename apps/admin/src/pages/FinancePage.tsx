import { useState, useEffect } from 'react';
import { Card, Table, Tabs, Tag, Statistic, Row, Col } from 'antd';
import dayjs from 'dayjs';
import { api } from '../services/api';

const statusColors: Record<string, string> = {
  PENDING: 'orange', PAID: 'green', REFUNDED: 'red', CANCELED: 'default', FAILED: 'default',
};

export default function FinancePage() {
  const [orders, setOrders] = useState([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [ledgerTotal, setLedgerTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [oRes, lRes] = await Promise.all([
        api.get('/orders', { params: { limit: 50 } }),
        api.get('/ledger', { params: { limit: 50 } }),
      ]);
      setOrders(oRes.data.data || []);
      setLedger(lRes.data.data || []);
      setLedgerTotal(Number(lRes.data.totalAmount || 0));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders() }, []);

  const orderColumns = [
    { title: 'Order No', dataIndex: 'orderNo', key: 'no' },
    { title: 'Type', dataIndex: 'orderType', key: 'type' },
    { title: 'Amount', dataIndex: 'originalAmount', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: 'Paid', dataIndex: 'paidAmount', render: (v: number) => v ? `¥${Number(v).toFixed(2)}` : '-' },
    { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
    { title: 'Paid At', dataIndex: 'paidAt', render: (v: string) => v ? dayjs(v).format('MM/DD HH:mm') : '-' },
  ];

  const ledgerColumns = [
    { title: 'Type', dataIndex: 'type', render: (t: string) => <Tag>{t}</Tag> },
    { title: 'Amount', dataIndex: 'amount', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: 'Client', key: 'client', render: (_: any, r: any) => r.client?.nickname || '-' },
    { title: 'Date', dataIndex: 'occurredAt', render: (v: string) => dayjs(v).format('MM/DD HH:mm') },
    { title: 'Remark', dataIndex: 'remark' },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">LuminaStudio</p>
          <h1>Finance</h1>
        </div>
      </div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card><Statistic title="Total Ledger" value={ledgerTotal} prefix="¥" precision={2} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="Orders" value={orders.length} /></Card>
        </Col>
      </Row>
      <Card bordered={false}>
        <Tabs items={[
          { key: 'orders', label: 'Orders', children: <Table columns={orderColumns} dataSource={orders} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} /> },
          { key: 'ledger', label: 'Ledger', children: <Table columns={ledgerColumns} dataSource={ledger} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} /> },
        ]} />
      </Card>
    </section>
  );
}
