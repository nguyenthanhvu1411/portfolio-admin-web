import { DeleteOutlined, EditOutlined, PlusOutlined, StarOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Image, Input, Popconfirm, Row, Select, Space, Table, Tag, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { ActiveTag, FileUploadButton, PageHeader } from '@/components/Common';
import { ProjectStatus, type ProjectDto } from '@/types';
import { absoluteFileUrl, formatDate, getErrorMessage } from '@/utils';

export function ProjectsPage() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<ProjectStatus | undefined>();
  const [isActive, setIsActive] = useState<boolean | undefined>();

  const query = useQuery({
    queryKey: ['projects', { page, pageSize, keyword, status, isActive }],
    queryFn: () => api.projects.list({ page, pageSize, keyword: keyword || undefined, status, isActive })
  });
  const refresh = () => client.invalidateQueries({ queryKey: ['projects'] });
  const remove = useMutation({ mutationFn: api.projects.remove, onSuccess() { message.success('Đã ẩn dự án.'); refresh(); }, onError(error) { message.error(getErrorMessage(error)); } });
  const toggle = useMutation({
    mutationFn: ({ id, type }: { id: number; type: 'active' | 'featured' }) => type === 'active' ? api.projects.toggleActive(id) : api.projects.toggleFeatured(id),
    onSuccess() { message.success('Đã cập nhật trạng thái.'); refresh(); }, onError(error) { message.error(getErrorMessage(error)); }
  });
  const upload = useMutation({ mutationFn: ({ id, file }: { id: number; file: File }) => api.projects.uploadThumbnail(id, file), onSuccess() { message.success('Đã cập nhật thumbnail.'); refresh(); }, onError(error) { message.error(getErrorMessage(error)); } });

  const columns = [
    { title: 'STT', width: 70, render: (_: unknown, __: ProjectDto, index: number) => (page - 1) * pageSize + index + 1 },
    {
      title: 'Dự án', width: 330,
      render: (_: unknown, row: ProjectDto) => <Space>
        {row.thumbnailUrl ? <Image preview={false} src={absoluteFileUrl(row.thumbnailUrl)} className="thumbnail" /> : <div className="thumbnail" />}
        <div><b>{row.projectName}</b><div style={{ color: '#64748b', fontSize: 12, maxWidth: 220 }}>{row.shortDescription || row.slug}</div></div>
      </Space>
    },
    { title: 'Loại', dataIndex: 'projectType', render: (value?: string) => value || '—' },
    { title: 'Thời gian', render: (_: unknown, row: ProjectDto) => `${formatDate(row.startDate)} – ${formatDate(row.endDate)}` },
    { title: 'Trạng thái', render: (_: unknown, row: ProjectDto) => <Tag color={row.status === ProjectStatus.Completed ? 'success' : row.status === ProjectStatus.InProgress ? 'processing' : 'default'}>{row.statusName}</Tag> },
    { title: 'Hiển thị', dataIndex: 'isActive', render: (value: boolean) => <ActiveTag active={value} /> },
    { title: 'Nổi bật', dataIndex: 'isFeatured', render: (value: boolean) => value ? <Tag color="purple">Nổi bật</Tag> : '—' },
    {
      title: 'Thao tác', fixed: 'right' as const, width: 210,
      render: (_: unknown, row: ProjectDto) => <Space>
        <Button title="Chỉnh sửa" size="small" icon={<EditOutlined />} onClick={() => navigate(`/projects/${row.id}/edit`)} />
        <FileUploadButton label="" accept="image/jpeg,image/png,image/webp" loading={upload.isPending} onFile={(file) => upload.mutate({ id: row.id, file })} />
        <Button title="Nổi bật" size="small" icon={<StarOutlined />} onClick={() => toggle.mutate({ id: row.id, type: 'featured' })} />
        <Button size="small" onClick={() => toggle.mutate({ id: row.id, type: 'active' })}>{row.isActive ? 'Ẩn' : 'Bật'}</Button>
        <Popconfirm title="Ẩn dự án này?" onConfirm={() => remove.mutate(row.id)}><Button title="Xóa" danger size="small" icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    }
  ];

  return (
    <>
      <PageHeader title="Quản lý dự án" description="Quản lý nội dung, công nghệ, ảnh và trạng thái dự án." actions={<Button title="Thêm mới" type="primary" icon={<PlusOutlined />} onClick={() => navigate('/projects/new')}>Thêm dự án</Button>} />
      <Card className="page-card" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={10}><Input.Search allowClear placeholder="Tìm tên, slug hoặc mô tả..." onSearch={(value) => { setKeyword(value); setPage(1); }} /></Col>
          <Col xs={24} md={7}><Select allowClear placeholder="Tất cả trạng thái" style={{ width: '100%' }} options={[{ value: ProjectStatus.Planning, label: 'Đang lên kế hoạch' }, { value: ProjectStatus.InProgress, label: 'Đang thực hiện' }, { value: ProjectStatus.Completed, label: 'Đã hoàn thành' }]} onChange={(value) => { setStatus(value); setPage(1); }} /></Col>
          <Col xs={24} md={7}><Select allowClear placeholder="Tất cả hiển thị" style={{ width: '100%' }} options={[{ value: true, label: 'Đang hiển thị' }, { value: false, label: 'Đã ẩn' }]} onChange={(value) => { setIsActive(value); setPage(1); }} /></Col>
        </Row>
      </Card>
      <Table rowKey="id" className="page-card" loading={query.isLoading} dataSource={query.data?.items ?? []} columns={columns} scroll={{ x: 1250 }} pagination={{ current: page, pageSize, total: query.data?.totalCount ?? 0, showSizeChanger: true, onChange: (p, size) => { setPage(p); setPageSize(size); } }} />
    </>
  );
}
