import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Image, Input, List, Modal, Popconfirm, Row, Select, Space, Switch, Typography, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/api';
import { FileUploadButton, PageHeader } from '@/components/Common';
import type { BlogCategoryDto, BlogCategoryRequest, BlogRequest } from '@/types';
import { absoluteFileUrl, getErrorMessage } from '@/utils';

interface BlogFormValues extends Omit<BlogRequest, 'tags'> { tagsText?: string; }

export function BlogFormPage() {
  const { id } = useParams();
  const blogId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  const client = useQueryClient();
  const [form] = Form.useForm<BlogFormValues>();
  const [categoryForm] = Form.useForm<BlogCategoryRequest>();
  const [categoryModal, setCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategoryDto | null>(null);
  const blog = useQuery({ queryKey: ['blog', blogId], queryFn: () => api.blogs.get(blogId!), enabled: Boolean(blogId) });
  const categories = useQuery({ queryKey: ['blog-categories'], queryFn: api.blogCategories.list });

  useEffect(() => {
    if (!blog.data) return;
    form.setFieldsValue({ categoryId: blog.data.categoryId, title: blog.data.title, slug: blog.data.slug, summary: blog.data.summary, content: blog.data.content, isFeatured: blog.data.isFeatured, tagsText: blog.data.tags.join(', ') });
  }, [blog.data, form]);

  const save = useMutation({
    mutationFn: (values: BlogFormValues) => {
      const request: BlogRequest = { categoryId: values.categoryId, title: values.title, slug: values.slug || null, summary: values.summary || null, content: values.content, isFeatured: values.isFeatured, tags: (values.tagsText ?? '').split(',').map((x) => x.trim()).filter(Boolean) };
      return blogId ? api.blogs.update(blogId, request) : api.blogs.create(request);
    },
    onSuccess(data) { message.success(blogId ? 'Đã cập nhật bài viết.' : 'Đã tạo bài viết.'); client.invalidateQueries({ queryKey: ['blogs'] }); navigate(`/blogs/${data.id}/edit`, { replace: true }); }, onError(error) { message.error(getErrorMessage(error)); }
  });
  const upload = useMutation({ mutationFn: (file: File) => blogId ? api.blogs.uploadThumbnail(blogId, file) : Promise.reject(new Error('Hãy lưu bài viết trước.')), onSuccess() { message.success('Đã cập nhật thumbnail.'); client.invalidateQueries({ queryKey: ['blog', blogId] }); client.invalidateQueries({ queryKey: ['blogs'] }); }, onError(error) { message.error(getErrorMessage(error)); } });
  const saveCategory = useMutation({ mutationFn: (values: BlogCategoryRequest) => editingCategory ? api.blogCategories.update(editingCategory.id, values) : api.blogCategories.create(values), onSuccess() { message.success('Đã lưu danh mục.'); setCategoryModal(false); client.invalidateQueries({ queryKey: ['blog-categories'] }); }, onError(error) { message.error(getErrorMessage(error)); } });
  const removeCategory = useMutation({ mutationFn: api.blogCategories.remove, onSuccess() { message.success('Đã xóa danh mục.'); client.invalidateQueries({ queryKey: ['blog-categories'] }); }, onError(error) { message.error(getErrorMessage(error)); } });

  const showCategory = (item?: BlogCategoryDto) => {
    setEditingCategory(item ?? null);
    categoryForm.setFieldsValue(item ? { name: item.name, slug: item.slug, description: item.description, isActive: item.isActive } : { name: '', slug: '', description: '', isActive: true });
    setCategoryModal(true);
  };

  return <>
    <PageHeader title={blogId ? 'Cập nhật bài viết' : 'Viết bài mới'} description="Soạn nội dung, gắn danh mục, tags và thumbnail." actions={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/blogs')}>Quay lại</Button>} />
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={17}>
        <Card className="page-card" loading={blog.isLoading}>
          <Form form={form} layout="vertical" initialValues={{ categoryId: categories.data?.[0]?.id, isFeatured: false }} onFinish={(values) => save.mutate(values)}>
            <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề.' }, { max: 250 }]}><Input size="large" /></Form.Item>
            <Row gutter={16}>
              <Col xs={24} md={12}><Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục.' }]}><Select options={categories.data?.filter((x) => x.isActive).map((x) => ({ value: x.id, label: x.name }))} /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="slug" label="Slug" extra="Để trống khi tạo để tự sinh."><Input /></Form.Item></Col>
            </Row>
            <Form.Item name="summary" label="Tóm tắt"><Input.TextArea rows={3} maxLength={500} showCount /></Form.Item>
            <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung bài viết.' }]}><Input.TextArea rows={20} /></Form.Item>
            <Form.Item name="tagsText" label="Tags" extra="Phân cách bằng dấu phẩy."><Input placeholder="ASP.NET Core, ReactJS, SQL Server" /></Form.Item>
            <Form.Item name="isFeatured" label="Bài viết nổi bật" valuePropName="checked"><Switch /></Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={save.isPending}>Lưu bài viết</Button>
          </Form>
        </Card>
      </Col>
      <Col xs={24} xl={7}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card title="Thumbnail" className="page-card">
            {blog.data?.thumbnailUrl ? <Image width="100%" src={absoluteFileUrl(blog.data.thumbnailUrl)} /> : <div className="asset-preview" />}
            <div style={{ marginTop: 12 }}><FileUploadButton label={blogId ? 'Thay thumbnail' : 'Lưu bài trước'} accept="image/jpeg,image/png,image/webp" loading={upload.isPending} onFile={(file) => upload.mutate(file)} /></div>
          </Card>
          <Card title="Danh mục Blog" className="page-card" extra={<Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => showCategory()}>Thêm</Button>}>
            <List dataSource={categories.data ?? []} renderItem={(item) => <List.Item actions={[<Button size="small" onClick={() => showCategory(item)}>Sửa</Button>, <Popconfirm title="Chỉ xóa được danh mục chưa có bài viết. Tiếp tục?" onConfirm={() => removeCategory.mutate(item.id)}><Button danger size="small" icon={<DeleteOutlined />} /></Popconfirm>]}><List.Item.Meta title={item.name} description={`${item.blogCount} bài viết · ${item.isActive ? 'Đang hoạt động' : 'Đã ẩn'}`} /></List.Item>} />
          </Card>
        </Space>
      </Col>
    </Row>
    <Modal open={categoryModal} title={editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục'} onCancel={() => setCategoryModal(false)} onOk={() => categoryForm.submit()} okText="Lưu" cancelText="Hủy" confirmLoading={saveCategory.isPending} destroyOnClose>
      <Form form={categoryForm} layout="vertical" onFinish={(values) => saveCategory.mutate({ ...values, slug: values.slug || null, description: values.description || null })}>
        <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục.' }]}><Input /></Form.Item>
        <Form.Item name="slug" label="Slug"><Input /></Form.Item>
        <Form.Item name="description" label="Mô tả"><Input.TextArea rows={4} /></Form.Item>
        <Form.Item name="isActive" label="Đang hoạt động" valuePropName="checked"><Switch /></Form.Item>
      </Form>
    </Modal>
  </>;
}
