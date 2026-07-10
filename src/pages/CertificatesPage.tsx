import { DeleteOutlined, EditOutlined, LinkOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Form, Image, Input, Modal, Popconfirm, Row, Space, Switch, Table, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { api } from '@/api';
import { ActiveTag, FileUploadButton, PageHeader } from '@/components/Common';
import type { CertificateDto, CertificateRequest } from '@/types';
import { absoluteFileUrl, formatDate, getErrorMessage } from '@/utils';

interface FormValues extends Omit<CertificateRequest, 'issueDate' | 'expiryDate'> {
  issueDate?: dayjs.Dayjs | null;
  expiryDate?: dayjs.Dayjs | null;
}

export function CertificatesPage() {
  const client = useQueryClient();
  const [form] = Form.useForm<FormValues>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CertificateDto | null>(null);
  const [keyword, setKeyword] = useState('');
  const query = useQuery({ queryKey: ['certificates', keyword], queryFn: () => api.certificates.list({ keyword: keyword || undefined }) });
  const refresh = () => client.invalidateQueries({ queryKey: ['certificates'] });
  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const request: CertificateRequest = { ...values, issueDate: values.issueDate?.format('YYYY-MM-DD') ?? null, expiryDate: values.expiryDate?.format('YYYY-MM-DD') ?? null, credentialId: values.credentialId || null, credentialUrl: values.credentialUrl || null, description: values.description || null };
      return editing ? api.certificates.update(editing.id, request) : api.certificates.create(request);
    },
    onSuccess() { message.success('Đã lưu chứng chỉ.'); setOpen(false); refresh(); }, onError(error) { message.error(getErrorMessage(error)); }
  });
  const remove = useMutation({ mutationFn: api.certificates.remove, onSuccess() { message.success('Đã ẩn chứng chỉ.'); refresh(); }, onError(error) { message.error(getErrorMessage(error)); } });
  const upload = useMutation({ mutationFn: ({ id, file }: { id: number; file: File }) => api.certificates.uploadImage(id, file), onSuccess() { message.success('Đã cập nhật ảnh chứng chỉ.'); refresh(); }, onError(error) { message.error(getErrorMessage(error)); } });

  const showForm = (item?: CertificateDto) => {
    setEditing(item ?? null);
    form.setFieldsValue(item ? { name: item.name, organization: item.organization, issueDate: item.issueDate ? dayjs(item.issueDate) : null, expiryDate: item.expiryDate ? dayjs(item.expiryDate) : null, credentialId: item.credentialId, credentialUrl: item.credentialUrl, description: item.description, isActive: item.isActive } : { name: '', organization: '', issueDate: null, expiryDate: null, credentialId: '', credentialUrl: '', description: '', isActive: true });
    setOpen(true);
  };

  const columns = [
    { title: 'STT', width: 70, render: (_: unknown, __: CertificateDto, index: number) => index + 1 },
    { title: 'Chứng chỉ', width: 330, render: (_: unknown, row: CertificateDto) => <Space>{row.imageUrl ? <Image preview={false} src={absoluteFileUrl(row.imageUrl)} className="thumbnail" /> : <div className="thumbnail" />}<div><b>{row.name}</b><div style={{ color: '#64748b', fontSize: 12 }}>{row.organization}</div></div></Space> },
    { title: 'Ngày cấp', dataIndex: 'issueDate', render: (value?: string) => formatDate(value) },
    { title: 'Ngày hết hạn', dataIndex: 'expiryDate', render: (value?: string) => formatDate(value) },
    { title: 'Credential', render: (_: unknown, row: CertificateDto) => row.credentialUrl ? <a href={row.credentialUrl} target="_blank" rel="noreferrer"><LinkOutlined /> Xem</a> : row.credentialId || '—' },
    { title: 'Hiển thị', dataIndex: 'isActive', render: (value: boolean) => <ActiveTag active={value} /> },
    { title: 'Thao tác', fixed: 'right' as const, width: 190, render: (_: unknown, row: CertificateDto) => <Space><Button size="small" icon={<EditOutlined />} onClick={() => showForm(row)} /><FileUploadButton label="Ảnh" accept="image/jpeg,image/png,image/webp" loading={upload.isPending} onFile={(file) => upload.mutate({ id: row.id, file })} /><Popconfirm title="Ẩn chứng chỉ này?" onConfirm={() => remove.mutate(row.id)}><Button danger size="small" icon={<DeleteOutlined />} /></Popconfirm></Space> }
  ];

  return <>
    <PageHeader title="Chứng chỉ" description="Quản lý chứng chỉ, credential và hình ảnh minh chứng." actions={<Button type="primary" icon={<PlusOutlined />} onClick={() => showForm()}>Thêm chứng chỉ</Button>} />
    <Card className="page-card" style={{ marginBottom: 16 }}><Input.Search allowClear placeholder="Tìm tên chứng chỉ hoặc tổ chức..." style={{ maxWidth: 420 }} onSearch={setKeyword} /></Card>
    <Table rowKey="id" className="page-card" loading={query.isLoading} dataSource={query.data ?? []} columns={columns} scroll={{ x: 1050 }} pagination={false} locale={{ emptyText: 'Chưa có chứng chỉ.' }} />
    <Modal open={open} title={editing ? 'Cập nhật chứng chỉ' : 'Thêm chứng chỉ'} onCancel={() => setOpen(false)} onOk={() => form.submit()} okText="Lưu" cancelText="Hủy" confirmLoading={save.isPending} width={720} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={(values) => save.mutate(values)}>
        <Row gutter={16}>
          <Col xs={24} md={12}><Form.Item name="name" label="Tên chứng chỉ" rules={[{ required: true, message: 'Vui lòng nhập tên chứng chỉ.' }]}><Input /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="organization" label="Tổ chức cấp" rules={[{ required: true, message: 'Vui lòng nhập tổ chức cấp.' }]}><Input /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="issueDate" label="Ngày cấp"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="expiryDate" label="Ngày hết hạn" dependencies={['issueDate']} rules={[({ getFieldValue }) => ({ validator(_, value) { const issue = getFieldValue('issueDate'); return !issue || !value || value.isAfter(issue) || value.isSame(issue, 'day') ? Promise.resolve() : Promise.reject(new Error('Ngày hết hạn phải sau ngày cấp.')); } })]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="credentialId" label="Credential ID"><Input /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="credentialUrl" label="Credential URL" rules={[{ type: 'url', message: 'URL không hợp lệ.' }]}><Input /></Form.Item></Col>
          <Col span={24}><Form.Item name="description" label="Mô tả"><Input.TextArea rows={5} maxLength={10000} showCount /></Form.Item></Col>
          <Col span={24}><Form.Item name="isActive" label="Đang hiển thị" valuePropName="checked"><Switch /></Form.Item></Col>
        </Row>
      </Form>
    </Modal>
  </>;
}
