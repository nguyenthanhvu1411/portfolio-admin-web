import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Row, Space, Switch, Table, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { api } from '@/api';
import { ActiveTag, PageHeader } from '@/components/Common';
import type { ExperienceDto, ExperienceRequest } from '@/types';
import { formatDate, getErrorMessage } from '@/utils';

interface FormValues extends Omit<ExperienceRequest, 'startDate' | 'endDate'> {
  startDate: dayjs.Dayjs;
  endDate?: dayjs.Dayjs | null;
}

export function ExperiencesPage() {
  const client = useQueryClient();
  const [form] = Form.useForm<FormValues>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExperienceDto | null>(null);
  const query = useQuery({ queryKey: ['experiences'], queryFn: () => api.experiences.list() });
  const refresh = () => client.invalidateQueries({ queryKey: ['experiences'] });
  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const request: ExperienceRequest = {
        ...values,
        companyLogoUrl: values.companyLogoUrl || null,
        location: values.location || null,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.isCurrent ? null : values.endDate?.format('YYYY-MM-DD') ?? null,
        description: values.description || null,
        technologies: values.technologies || null
      };
      return editing ? api.experiences.update(editing.id, request) : api.experiences.create(request);
    },
    onSuccess() { message.success('Đã lưu kinh nghiệm.'); setOpen(false); refresh(); },
    onError(error) { message.error(getErrorMessage(error)); }
  });
  const remove = useMutation({ mutationFn: api.experiences.remove, onSuccess() { message.success('Đã ẩn kinh nghiệm.'); refresh(); }, onError(error) { message.error(getErrorMessage(error)); } });

  const showForm = (item?: ExperienceDto) => {
    setEditing(item ?? null);
    form.setFieldsValue(item ? {
      position: item.position,
      company: item.company,
      companyLogoUrl: item.companyLogoUrl,
      location: item.location,
      startDate: dayjs(item.startDate),
      endDate: item.endDate ? dayjs(item.endDate) : null,
      isCurrent: item.isCurrent,
      description: item.description,
      technologies: item.technologies,
      displayOrder: item.displayOrder,
      isActive: item.isActive
    } : { position: '', company: '', companyLogoUrl: '', location: '', startDate: dayjs(), endDate: null, isCurrent: false, description: '', technologies: '', displayOrder: 0, isActive: true });
    setOpen(true);
  };

  const columns = [
    { title: 'STT', width: 70, render: (_: unknown, __: ExperienceDto, index: number) => index + 1 },
    { title: 'Vị trí', dataIndex: 'position', render: (value: string, row: ExperienceDto) => <div><b>{value}</b><div style={{ color: '#64748b', fontSize: 12 }}>{row.company}</div></div> },
    { title: 'Địa điểm', dataIndex: 'location', render: (value?: string) => value || '—' },
    { title: 'Thời gian', render: (_: unknown, row: ExperienceDto) => `${formatDate(row.startDate)} – ${row.isCurrent ? 'Hiện tại' : formatDate(row.endDate)}` },
    { title: 'Công nghệ', dataIndex: 'technologies', ellipsis: true, render: (value?: string) => value || '—' },
    { title: 'Hiển thị', dataIndex: 'isActive', render: (value: boolean) => <ActiveTag active={value} /> },
    { title: 'Thao tác', width: 110, render: (_: unknown, row: ExperienceDto) => <Space><Button title="Chỉnh sửa" size="small" icon={<EditOutlined />} onClick={() => showForm(row)} /><Popconfirm title="Ẩn kinh nghiệm này?" onConfirm={() => remove.mutate(row.id)}><Button title="Xóa" danger size="small" icon={<DeleteOutlined />} /></Popconfirm></Space> }
  ];

  return <>
    <PageHeader title="Kinh nghiệm làm việc" description="Quản lý quá trình làm việc, thực tập và công nghệ sử dụng." actions={<Button title="Thêm mới" type="primary" icon={<PlusOutlined />} onClick={() => showForm()}>Thêm kinh nghiệm</Button>} />
    <Table rowKey="id" className="page-card" loading={query.isLoading} dataSource={query.data ?? []} columns={columns} scroll={{ x: 900 }} pagination={false} />
    <Modal open={open} title={editing ? 'Cập nhật kinh nghiệm' : 'Thêm kinh nghiệm'} onCancel={() => setOpen(false)} onOk={() => form.submit()} okText="Lưu" cancelText="Hủy" confirmLoading={save.isPending} width={760} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={(values) => save.mutate(values)}>
        <Row gutter={16}>
          <Col xs={24} md={12}><Form.Item name="position" label="Vị trí" rules={[{ required: true, message: 'Vui lòng nhập vị trí.' }]}><Input /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="company" label="Công ty" rules={[{ required: true, message: 'Vui lòng nhập công ty.' }]}><Input /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="location" label="Địa điểm"><Input /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="companyLogoUrl" label="Logo công ty URL"><Input /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu.' }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item noStyle shouldUpdate={(prev, next) => prev.isCurrent !== next.isCurrent}>{({ getFieldValue }) => <Form.Item name="endDate" label="Ngày kết thúc"><DatePicker disabled={getFieldValue('isCurrent')} style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item>}</Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="displayOrder" label="Thứ tự"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="isCurrent" label="Công việc hiện tại" valuePropName="checked"><Switch /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="isActive" label="Đang hiển thị" valuePropName="checked"><Switch /></Form.Item></Col>
          <Col span={24}><Form.Item name="description" label="Mô tả"><Input.TextArea rows={5} maxLength={10000} showCount /></Form.Item></Col>
          <Col span={24}><Form.Item name="technologies" label="Công nghệ"><Input placeholder="C#, ASP.NET Core, ReactJS..." /></Form.Item></Col>
        </Row>
      </Form>
    </Modal>
  </>;
}
