import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Modal, Popconfirm, Row, Space, Switch, Table, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/api';
import { ActiveTag, PageHeader } from '@/components/Common';
import type { EducationDto, EducationRequest } from '@/types';
import { getErrorMessage } from '@/utils';

export function EducationPage() {
  const client = useQueryClient();
  const [form] = Form.useForm<EducationRequest>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EducationDto | null>(null);
  const query = useQuery({ queryKey: ['education'], queryFn: api.education.list });
  const refresh = () => client.invalidateQueries({ queryKey: ['education'] });
  const save = useMutation({ mutationFn: (values: EducationRequest) => editing ? api.education.update(editing.id, values) : api.education.create(values), onSuccess() { message.success('Đã lưu học vấn.'); setOpen(false); refresh(); }, onError(error) { message.error(getErrorMessage(error)); } });
  const remove = useMutation({ mutationFn: api.education.remove, onSuccess() { message.success('Đã ẩn học vấn.'); refresh(); }, onError(error) { message.error(getErrorMessage(error)); } });

  const showForm = (item?: EducationDto) => {
    setEditing(item ?? null);
    form.setFieldsValue(item ? { ...item } : { schoolName: '', major: '', degree: '', startYear: undefined, endYear: undefined, gpa: '', description: '', logoUrl: '', isActive: true });
    setOpen(true);
  };

  const columns = [
    { title: 'STT', width: 70, render: (_: unknown, __: EducationDto, index: number) => index + 1 },
    { title: 'Trường', dataIndex: 'schoolName', render: (value: string, row: EducationDto) => <div><b>{value}</b><div style={{ color: '#64748b', fontSize: 12 }}>{row.major}</div></div> },
    { title: 'Bằng cấp', dataIndex: 'degree', render: (value?: string) => value || '—' },
    { title: 'Thời gian', render: (_: unknown, row: EducationDto) => `${row.startYear ?? '—'} – ${row.endYear ?? 'Hiện tại'}` },
    { title: 'GPA', dataIndex: 'gpa', render: (value?: string) => value || '—' },
    { title: 'Hiển thị', dataIndex: 'isActive', render: (value: boolean) => <ActiveTag active={value} /> },
    { title: 'Thao tác', width: 110, render: (_: unknown, row: EducationDto) => <Space><Button title="Chỉnh sửa" size="small" icon={<EditOutlined />} onClick={() => showForm(row)} /><Popconfirm title="Ẩn học vấn này?" onConfirm={() => remove.mutate(row.id)}><Button title="Xóa" danger size="small" icon={<DeleteOutlined />} /></Popconfirm></Space> }
  ];

  return <>
    <PageHeader title="Học vấn" description="Quản lý trường học, chuyên ngành, bằng cấp và GPA." actions={<Button title="Thêm mới" type="primary" icon={<PlusOutlined />} onClick={() => showForm()}>Thêm học vấn</Button>} />
    <Table rowKey="id" className="page-card" loading={query.isLoading} dataSource={query.data ?? []} columns={columns} pagination={false} />
    <Modal open={open} title={editing ? 'Cập nhật học vấn' : 'Thêm học vấn'} onCancel={() => setOpen(false)} onOk={() => form.submit()} okText="Lưu" cancelText="Hủy" confirmLoading={save.isPending} width={720} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={(values) => save.mutate(values)}>
        <Row gutter={16}>
          <Col xs={24} md={12}><Form.Item name="schoolName" label="Tên trường" rules={[{ required: true, message: 'Vui lòng nhập tên trường.' }]}><Input /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="major" label="Chuyên ngành" rules={[{ required: true, message: 'Vui lòng nhập chuyên ngành.' }]}><Input /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="degree" label="Bằng cấp"><Input /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="gpa" label="GPA"><Input /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="startYear" label="Năm bắt đầu"><InputNumber min={1900} max={2100} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="endYear" label="Năm kết thúc" dependencies={['startYear']} rules={[({ getFieldValue }) => ({ validator(_, value) { const start = getFieldValue('startYear'); return !start || !value || value >= start ? Promise.resolve() : Promise.reject(new Error('Năm kết thúc phải lớn hơn hoặc bằng năm bắt đầu.')); } })]}><InputNumber min={1900} max={2100} style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={24}><Form.Item name="logoUrl" label="Logo URL"><Input /></Form.Item></Col>
          <Col span={24}><Form.Item name="description" label="Mô tả"><Input.TextArea rows={5} maxLength={10000} showCount /></Form.Item></Col>
          <Col span={24}><Form.Item name="isActive" label="Đang hiển thị" valuePropName="checked"><Switch /></Form.Item></Col>
        </Row>
      </Form>
    </Modal>
  </>;
}
