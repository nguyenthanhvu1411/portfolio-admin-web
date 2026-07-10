import { AppstoreOutlined, ContactsOutlined, FolderOpenOutlined, StarOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { PageHeader } from '@/components/Common';

export function DashboardPage() {
  const query = useQuery({ queryKey: ['dashboard'], queryFn: api.dashboard });
  const cards = [
    { key: 'projects' as const, title: 'Dự án', icon: <FolderOpenOutlined />, color: '#2563eb' },
    { key: 'skills' as const, title: 'Kỹ năng', icon: <StarOutlined />, color: '#7c3aed' },
    { key: 'blogs' as const, title: 'Bài viết', icon: <AppstoreOutlined />, color: '#059669' },
    { key: 'contacts' as const, title: 'Tin nhắn', icon: <ContactsOutlined />, color: '#d97706' }
  ];

  return (
    <>
      <PageHeader title="Bảng điều khiển" description="Tổng quan dữ liệu nội dung của website Portfolio." />
      <Row gutter={[16, 16]}>
        {cards.map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.key}>
            <Card className="page-card">
              <Statistic
                title={item.title}
                value={query.data?.[item.key] ?? 0}
                loading={query.isLoading}
                prefix={<span style={{ color: item.color }}>{item.icon}</span>}
              />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Quy trình quản trị nội dung" className="page-card">
            <Row gutter={16}>
              {[
                ['01', 'Cập nhật dữ liệu', 'Nhập và chỉnh sửa nội dung trong trang quản trị.'],
                ['02', 'Kiểm tra trạng thái', 'Xác nhận Active, Featured và trạng thái xuất bản.'],
                ['03', 'Hiển thị public', 'Website công khai chỉ đọc nội dung đã được bật.']
              ].map(([step, title, desc]) => (
                <Col xs={24} md={8} key={step}>
                  <Card size="small" style={{ height: '100%' }}>
                    <Typography.Text strong style={{ color: '#2563eb' }}>{step}</Typography.Text>
                    <Typography.Title level={5} style={{ marginTop: 8 }}>{title}</Typography.Title>
                    <Typography.Paragraph type="secondary">{desc}</Typography.Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Trạng thái hệ thống" className="page-card">
            <p><b>Backend:</b> ASP.NET Core</p>
            <p><b>Xác thực:</b> JWT + Refresh Cookie</p>
            <p><b>Frontend:</b> React + TypeScript + Ant Design</p>
            <p><b>Môi trường:</b> {import.meta.env.MODE}</p>
          </Card>
        </Col>
      </Row>
    </>
  );
}
