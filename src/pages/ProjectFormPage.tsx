import { ArrowLeftOutlined, DeleteOutlined, SaveOutlined, StarOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Col, DatePicker, Form, Image, Input, InputNumber, Popconfirm, Row, Select, Space, Switch, Typography, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/api';
import { FileUploadButton, PageHeader } from '@/components/Common';
import { ProjectStatus, type ProjectRequest } from '@/types';
import { absoluteFileUrl, getErrorMessage } from '@/utils';

interface ProjectFormValues extends Omit<ProjectRequest, 'startDate' | 'endDate'> {
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
}

export function ProjectFormPage() {
  const { id } = useParams();
  const projectId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  const client = useQueryClient();
  const [form] = Form.useForm<ProjectFormValues>();
  const project = useQuery({ queryKey: ['project', projectId], queryFn: () => api.projects.get(projectId!), enabled: Boolean(projectId) });
  const skills = useQuery({ queryKey: ['skills', 'all'], queryFn: () => api.skills.list({ page: 1, pageSize: 100, isActive: true }) });

  useEffect(() => {
    if (!project.data) return;
    form.setFieldsValue({
      projectName: project.data.projectName,
      slug: project.data.slug,
      shortDescription: project.data.shortDescription,
      fullDescription: project.data.fullDescription,
      role: project.data.role,
      projectType: project.data.projectType,
      githubUrl: project.data.githubUrl,
      demoUrl: project.data.demoUrl,
      startDate: project.data.startDate ? dayjs(project.data.startDate) : null,
      endDate: project.data.endDate ? dayjs(project.data.endDate) : null,
      status: project.data.status,
      isFeatured: project.data.isFeatured,
      isActive: project.data.isActive,
      skillIds: project.data.skills.map((x) => x.id)
    });
  }, [project.data, form]);

  const save = useMutation({
    mutationFn: (values: ProjectFormValues) => {
      const request: ProjectRequest = {
        ...values,
        slug: values.slug || null,
        shortDescription: values.shortDescription || null,
        fullDescription: values.fullDescription || null,
        role: values.role || null,
        projectType: values.projectType || null,
        githubUrl: values.githubUrl || null,
        demoUrl: values.demoUrl || null,
        startDate: values.startDate?.format('YYYY-MM-DD') ?? null,
        endDate: values.endDate?.format('YYYY-MM-DD') ?? null,
        skillIds: values.skillIds ?? []
      };
      return projectId ? api.projects.update(projectId, request) : api.projects.create(request);
    },
    onSuccess(data) { message.success(projectId ? 'Đã cập nhật dự án.' : 'Đã tạo dự án.'); client.invalidateQueries({ queryKey: ['projects'] }); navigate(`/projects/${data.id}/edit`, { replace: true }); },
    onError(error) { message.error(getErrorMessage(error)); }
  });
  const gallery = useMutation<unknown, unknown, { action: 'upload' | 'delete' | 'thumbnail'; imageId?: number; file?: File }>({
    mutationFn: ({ action, imageId, file }: { action: 'upload' | 'delete' | 'thumbnail'; imageId?: number; file?: File }) => {
      if (!projectId) return Promise.reject(new Error('Hãy lưu dự án trước.'));
      if (action === 'upload' && file) return api.projects.uploadImage(projectId, file);
      if (action === 'delete' && imageId) return api.projects.removeImage(imageId);
      if (action === 'thumbnail' && imageId) return api.projects.setThumbnail(imageId);
      return Promise.reject(new Error('Thao tác ảnh không hợp lệ.'));
    },
    onSuccess() { message.success('Đã cập nhật thư viện ảnh.'); client.invalidateQueries({ queryKey: ['project', projectId] }); client.invalidateQueries({ queryKey: ['projects'] }); },
    onError(error) { message.error(getErrorMessage(error)); }
  });

  return (
    <>
      <PageHeader title={projectId ? 'Cập nhật dự án' : 'Thêm dự án'} description="Thông tin chi tiết, công nghệ và ảnh minh họa." actions={<Button title="Quay lại" icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>Quay lại</Button>} />
      <Card className="page-card" loading={project.isLoading}>
        <Form form={form} layout="vertical" initialValues={{ status: ProjectStatus.Planning, isActive: true, isFeatured: false, skillIds: [] }} onFinish={(values) => save.mutate(values)}>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="projectName" label="Tên dự án" rules={[{ required: true, message: 'Vui lòng nhập tên dự án.' }, { max: 200 }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="slug" label="Slug" extra="Để trống khi tạo để hệ thống tự sinh."><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="role" label="Vai trò"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="projectType" label="Loại dự án"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="githubUrl" label="GitHub URL" rules={[{ type: 'url', message: 'URL không hợp lệ.' }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="demoUrl" label="Demo URL" rules={[{ type: 'url', message: 'URL không hợp lệ.' }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="startDate" label="Ngày bắt đầu"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="endDate" label="Ngày kết thúc" dependencies={['startDate']} rules={[({ getFieldValue }) => ({ validator(_, value) { const start = getFieldValue('startDate'); return !start || !value || value.isAfter(start) || value.isSame(start, 'day') ? Promise.resolve() : Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu.')); } })]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}><Select options={[{ value: ProjectStatus.Planning, label: 'Đang lên kế hoạch' }, { value: ProjectStatus.InProgress, label: 'Đang thực hiện' }, { value: ProjectStatus.Completed, label: 'Đã hoàn thành' }]} /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item name="isActive" label="Hiển thị" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item name="isFeatured" label="Nổi bật" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col span={24}><Form.Item name="shortDescription" label="Mô tả ngắn"><Input.TextArea rows={3} maxLength={500} showCount /></Form.Item></Col>
            <Col span={24}><Form.Item name="fullDescription" label="Mô tả chi tiết"><Input.TextArea rows={8} maxLength={20000} showCount /></Form.Item></Col>
            <Col span={24}><Form.Item name="skillIds" label="Công nghệ sử dụng"><Checkbox.Group style={{ width: '100%' }}><Row gutter={[8, 8]}>{skills.data?.items.map((skill) => <Col xs={24} sm={12} lg={8} key={skill.id}><Checkbox value={skill.id}>{skill.name} <Typography.Text type="secondary">({skill.categoryName})</Typography.Text></Checkbox></Col>)}</Row></Checkbox.Group></Form.Item></Col>
          </Row>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={save.isPending}>Lưu dự án</Button>
        </Form>
      </Card>

      {projectId ? <Card title="Thư viện ảnh dự án" className="page-card" style={{ marginTop: 16 }} extra={<FileUploadButton label="Thêm ảnh" accept="image/jpeg,image/png,image/webp" loading={gallery.isPending} onFile={(file) => gallery.mutate({ action: 'upload', file })} />}>
        <Row gutter={[16, 16]}>
          {project.data?.images.map((image) => <Col xs={24} sm={12} lg={8} key={image.id}>
            <Card size="small" cover={<Image preview src={absoluteFileUrl(image.imageUrl)} style={{ aspectRatio: '16/9', objectFit: 'cover' }} />} actions={[
              <Button type="text" icon={<StarOutlined />} title="Đặt thumbnail" onClick={() => gallery.mutate({ action: 'thumbnail', imageId: image.id })} />,
              <Popconfirm title="Xóa ảnh này?" onConfirm={() => gallery.mutate({ action: 'delete', imageId: image.id })}><Button title="Xóa" type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
            ]}>
              <Card.Meta title={image.isThumbnail ? <Space>Thumbnail <StarOutlined style={{ color: '#d97706' }} /></Space> : `Ảnh #${image.id}`} description={image.caption || 'Không có chú thích'} />
            </Card>
          </Col>)}
          {!project.data?.images.length ? <Col span={24}><Typography.Text type="secondary">Chưa có ảnh dự án.</Typography.Text></Col> : null}
        </Row>
      </Card> : null}
    </>
  );
}
