import { LockOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '@/api';
import { useAuthStore } from '@/stores/authStore';
import { getErrorMessage } from '@/utils';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess(data) {
      setSession(data.accessToken, data.accessTokenExpiresAt, data.admin);
      const destination = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(destination, { replace: true });
    }
  });

  return (
    <div className="login-page">
      <section className="login-hero">
        <div style={{ maxWidth: 620 }}>
          <SafetyCertificateOutlined style={{ fontSize: 52, color: '#60a5fa' }} />
          <Typography.Title style={{ color: '#fff', fontSize: 52, marginTop: 28 }}>
            Quản trị Portfolio chuyên nghiệp
          </Typography.Title>
          <Typography.Paragraph style={{ color: '#cbd5e1', fontSize: 18, lineHeight: 1.8 }}>
            Quản lý hồ sơ, kỹ năng, dự án, bài viết, chứng chỉ và tin nhắn liên hệ trong một giao diện thống nhất.
          </Typography.Paragraph>
        </div>
      </section>
      <section className="login-panel">
        <Card className="login-card page-card" styles={{ body: { padding: 32 } }}>
          <Typography.Title level={2}>Đăng nhập quản trị</Typography.Title>
          <Typography.Paragraph type="secondary">
            Sử dụng tài khoản Admin hoặc SuperAdmin.
          </Typography.Paragraph>
          {mutation.error ? <Alert style={{ marginBottom: 18 }} type="error" showIcon message={getErrorMessage(mutation.error)} /> : null}
          <Form
            layout="vertical"
            initialValues={{ email: 'admin@portfolio.com' }}
            onFinish={(values: { email: string; password: string }) => mutation.mutate(values)}
          >
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email.' }, { type: 'email', message: 'Email không hợp lệ.' }]}>
              <Input size="large" prefix={<MailOutlined />} placeholder="admin@portfolio.com" />
            </Form.Item>
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu.' }]}>
              <Input.Password size="large" prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
            </Form.Item>
            <Button block size="large" type="primary" htmlType="submit" loading={mutation.isPending}>
              Đăng nhập
            </Button>
          </Form>
        </Card>
      </section>
    </div>
  );
}
