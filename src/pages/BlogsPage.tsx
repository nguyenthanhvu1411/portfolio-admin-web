import { DeleteOutlined, EditOutlined, PlusOutlined, SendOutlined, StarOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Popconfirm, Row, Select, Space, Table, Tag, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { PageHeader } from '@/components/Common';
import { BlogStatus, type BlogDto } from '@/types';
import { formatDateTime, getErrorMessage } from '@/utils';

export function BlogsPage() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<BlogStatus | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const categories = useQuery({ queryKey: ['blog-categories'], queryFn: api.blogCategories.list });
  const query = useQuery({ queryKey: ['blogs', { page, pageSize, keyword, status, categoryId }], queryFn: () => api.blogs.list({ page, pageSize, keyword: keyword || undefined, status, categoryId }) });
  const refresh = () => client.invalidateQueries({ queryKey: ['blogs'] });
  const action = useMutation<unknown, unknown, { id: number; type: 'delete' | 'publish' | 'unpublish' | 'featured' }>({
    mutationFn: ({ id, type }: { id: number; type: 'delete' | 'publish' | 'unpublish' | 'featured' }) => {
      if (type === 'delete') return api.blogs.remove(id);
      if (type === 'publish') return api.blogs.publish(id);
      if (type === 'unpublish') return api.blogs.unpublish(id);
      return api.blogs.toggleFeatured(id);
    },
    onSuccess() { message.success('Thao tác thành công.'); refresh(); }, onError(error) { message.error(getErrorMessage(error)); }
  });

  const columns = [
    { title: 'STT', width: 70, render: (_: unknown, __: BlogDto, index: number) => (page - 1) * pageSize + index + 1 },
    { title: 'Bài viết', width: 360, render: (_: unknown, row: BlogDto) => <div><b>{row.title}</b><div style={{ color: '#64748b', fontSize: 12 }}>{row.categoryName} · /{row.slug}</div></div> },
    { title: 'Trạng thái', render: (_: unknown, row: BlogDto) => <Tag color={row.status === BlogStatus.Published ? 'success' : row.status === BlogStatus.Hidden ? 'default' : 'warning'}>{row.statusName}</Tag> },
    { title: 'Ngày đăng', dataIndex: 'publishedAt', render: (value?: string) => formatDateTime(value) },
    { title: 'Lượt xem', dataIndex: 'viewCount', width: 100 },
    { title: 'Nổi bật', dataIndex: 'isFeatured', render: (value: boolean) => value ? <Tag color="purple">Nổi bật</Tag> : '—' },
    {
      title: 'Thao tác', fixed: 'right' as const, width: 190,
      render: (_: unknown, row: BlogDto) => <Space>
        <Button title="Chỉnh sửa" size="small" icon={<EditOutlined />} onClick={() => navigate(`/blogs/${row.id}/edit`)} />
        <Button size="small" icon={<SendOutlined />} title={row.status === BlogStatus.Published ? 'Ẩn bài' : 'Đăng bài'} onClick={() => action.mutate({ id: row.id, type: row.status === BlogStatus.Published ? 'unpublish' : 'publish' })} />
        <Button title="Nổi bật" size="small" icon={<StarOutlined />} onClick={() => action.mutate({ id: row.id, type: 'featured' })} />
        <Popconfirm title="Ẩn bài viết này?" onConfirm={() => action.mutate({ id: row.id, type: 'delete' })}><Button title="Xóa" danger size="small" icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    }
  ];

  return <>
    <PageHeader title="Quản lý bài viết" description="Soạn thảo, xuất bản và quản lý nội dung Blog." actions={<Button title="Thêm mới" type="primary" icon={<PlusOutlined />} onClick={() => navigate('/blogs/new')}>Viết bài</Button>} />
    <Card className="page-card" style={{ marginBottom: 16 }}><Row gutter={[12, 12]}>
      <Col xs={24} md={10}><Input.Search allowClear placeholder="Tìm tiêu đề, slug hoặc nội dung..." onSearch={(value) => { setKeyword(value); setPage(1); }} /></Col>
      <Col xs={24} md={7}><Select allowClear style={{ width: '100%' }} placeholder="Tất cả trạng thái" options={[{ value: BlogStatus.Draft, label: 'Bản nháp' }, { value: BlogStatus.Published, label: 'Đã xuất bản' }, { value: BlogStatus.Hidden, label: 'Đã ẩn' }]} onChange={(value) => { setStatus(value); setPage(1); }} /></Col>
      <Col xs={24} md={7}><Select allowClear style={{ width: '100%' }} placeholder="Tất cả danh mục" options={categories.data?.map((x) => ({ value: x.id, label: x.name }))} onChange={(value) => { setCategoryId(value); setPage(1); }} /></Col>
    </Row></Card>
    <Table rowKey="id" className="page-card" loading={query.isLoading} dataSource={query.data?.items ?? []} columns={columns} scroll={{ x: 1050 }} pagination={{ current: page, pageSize, total: query.data?.totalCount ?? 0, showSizeChanger: true, onChange: (p, size) => { setPage(p); setPageSize(size); } }} />
  </>;
}
