import { Button, Card, Space, Table, Tag } from "antd";
import { Plus } from "lucide-react";

type PlaceholderPageProps = {
  title: string;
};

const columns = [
  { title: "Name", dataIndex: "name" },
  { title: "Status", dataIndex: "status", render: (status: string) => <Tag color="green">{status}</Tag> },
  { title: "Updated", dataIndex: "updatedAt" },
];

const data = [
  { key: "1", name: "Initial v1 workflow", status: "Ready", updatedAt: "Today" },
];

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">LuminaStudio</p>
          <h1>{title}</h1>
        </div>
        <Space>
          <Button icon={<Plus size={16} />} type="primary">Create</Button>
        </Space>
      </div>
      <Card className="work-card" bordered={false}>
        <Table columns={columns} dataSource={data} pagination={false} />
      </Card>
    </section>
  );
}
