import { SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Image, Input, Row, Space, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/api';
import { FileUploadButton, PageHeader } from '@/components/Common';
import type { SettingRequest } from '@/types';
import { absoluteFileUrl, getErrorMessage } from '@/utils';

export function SettingsPage() {
  const client = useQueryClient();
  const [form] = Form.useForm<SettingRequest>();
  const query = useQuery({ queryKey: ['settings'], queryFn: api.settings.get });
  useEffect(() => { if (query.data) form.setFieldsValue(query.data); }, [query.data, form]);
  const update = useMutation({ mutationFn: api.settings.update, onSuccess(data) { client.setQueryData(['settings'], data); message.success('Đã cập nhật cấu hình.'); }, onError(error) { message.error(getErrorMessage(error)); } });
  const upload = useMutation({ mutationFn: ({ type, file }: { type: 'logo' | 'favicon'; file: File }) => api.settings.upload(type, file), onSuccess() { message.success('Đã tải file cấu hình.'); client.invalidateQueries({ queryKey: ['settings'] }); }, onError(error) { message.error(getErrorMessage(error)); } });

  return <>
    <PageHeader title="Cấu hình website" description="Quản lý SEO, thông tin liên hệ, logo và favicon." />
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={16}>
        <Card className="page-card" loading={query.isLoading}>
          <Form form={form} layout="vertical" onFinish={(values) => update.mutate(values)}>
            <Form.Item name="siteName" label="Tên website" rules={[{ required: true, message: 'Vui lòng nhập tên website.' }]}><Input /></Form.Item>
            <Row gutter={16}>
              <Col xs={24} md={12}><Form.Item name="themeColor" label="Màu chủ đạo"><Input type="color" style={{ height: 40 }} /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="contactEmail" label="Email liên hệ" rules={[{ type: 'email', message: 'Email không hợp lệ.' }]}><Input /></Form.Item></Col>
            </Row>
            <Form.Item name="seoTitle" label="SEO title"><Input maxLength={250} showCount /></Form.Item>
            <Form.Item name="seoDescription" label="SEO description"><Input.TextArea rows={4} maxLength={500} showCount /></Form.Item>
            <Form.Item name="footerText" label="Nội dung footer"><Input.TextArea rows={3} maxLength={500} showCount /></Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={update.isPending}>Lưu cấu hình</Button>
          </Form>
        </Card>
      </Col>
      <Col xs={24} xl={8}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card title="Logo website" className="page-card">
            <div className="asset-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{query.data?.logoUrl ? <Image preview={false} src={absoluteFileUrl(query.data.logoUrl)} style={{ maxHeight: 150, objectFit: 'contain' }} /> : 'Chưa có logo'}</div>
            <div style={{ marginTop: 12 }}><FileUploadButton label="Tải logo" accept="image/jpeg,image/png,image/webp" loading={upload.isPending} onFile={(file) => upload.mutate({ type: 'logo', file })} /></div>
          </Card>
          <Card title="Favicon" className="page-card">
            <div className="asset-preview" style={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{query.data?.faviconUrl ? <Image preview={false} src={absoluteFileUrl(query.data.faviconUrl)} width={64} height={64} style={{ objectFit: 'contain' }} /> : 'Chưa có favicon'}</div>
            <div style={{ marginTop: 12 }}><FileUploadButton label="Tải favicon" accept=".ico,image/jpeg,image/png,image/webp" loading={upload.isPending} onFile={(file) => upload.mutate({ type: 'favicon', file })} /></div>
          </Card>
        </Space>
      </Col>
    </Row>
  </>;
}
