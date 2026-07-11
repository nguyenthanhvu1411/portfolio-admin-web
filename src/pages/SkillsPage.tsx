import { DeleteOutlined, EditOutlined, PlusOutlined, StarOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Switch, Table, Tabs, Tag, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/api';
import { ActiveTag, PageHeader } from '@/components/Common';
import { SkillLevel, type SkillCategoryDto, type SkillCategoryRequest, type SkillDto, type SkillRequest } from '@/types';
import { getErrorMessage } from '@/utils';

const skillLevelOptions = [
  { value: SkillLevel.Beginner, label: 'Mới bắt đầu' },
  { value: SkillLevel.Intermediate, label: 'Trung bình' },
  { value: SkillLevel.Advanced, label: 'Nâng cao' }
];

export function SkillsPage() {
  const client = useQueryClient();
  const [skillForm] = Form.useForm<SkillRequest>();
  const [categoryForm] = Form.useForm<SkillCategoryRequest>();
  const [skillModal, setSkillModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillDto | null>(null);
  const [editingCategory, setEditingCategory] = useState<SkillCategoryDto | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [isActive, setIsActive] = useState<boolean | undefined>();

  const categories = useQuery({ queryKey: ['skill-categories'], queryFn: api.skillCategories.list });
  const skills = useQuery({
    queryKey: ['skills', { page, pageSize, keyword, categoryId, isActive }],
    queryFn: () => api.skills.list({
      page,
      pageSize,
      keyword: keyword || undefined,
      categoryId,
      isActive
    })
  });

  const refresh = () => {
    client.invalidateQueries({ queryKey: ['skills'] });
    client.invalidateQueries({ queryKey: ['skill-categories'] });
  };

  const saveSkill = useMutation({
    mutationFn: (values: SkillRequest) => editingSkill ? api.skills.update(editingSkill.id, values) : api.skills.create(values),
    onSuccess() { message.success(editingSkill ? 'Đã cập nhật kỹ năng.' : 'Đã tạo kỹ năng.'); setSkillModal(false); refresh(); },
    onError(error) { message.error(getErrorMessage(error)); }
  });
  const saveCategory = useMutation({
    mutationFn: (values: SkillCategoryRequest) => editingCategory ? api.skillCategories.update(editingCategory.id, values) : api.skillCategories.create(values),
    onSuccess() { message.success(editingCategory ? 'Đã cập nhật nhóm kỹ năng.' : 'Đã tạo nhóm kỹ năng.'); setCategoryModal(false); refresh(); },
    onError(error) { message.error(getErrorMessage(error)); }
  });
  const removeSkill = useMutation({
    mutationFn: api.skills.remove,
    onSuccess() { message.success('Đã xử lý xóa kỹ năng.'); refresh(); },
    onError(error) { message.error(getErrorMessage(error)); }
  });
  const removeCategory = useMutation({
    mutationFn: api.skillCategories.remove,
    onSuccess() { message.success('Đã xóa nhóm kỹ năng.'); refresh(); },
    onError(error) { message.error(getErrorMessage(error)); }
  });
  const toggle = useMutation({
    mutationFn: ({ id, type }: { id: number; type: 'active' | 'featured' }) => type === 'active' ? api.skills.toggleActive(id) : api.skills.toggleFeatured(id),
    onSuccess() { message.success('Đã cập nhật trạng thái.'); refresh(); },
    onError(error) { message.error(getErrorMessage(error)); }
  });

  const openSkill = (item?: SkillDto) => {
    setEditingSkill(item ?? null);
    skillForm.setFieldsValue(item ? {
      categoryId: item.categoryId,
      name: item.name,
      level: item.level,
      iconUrl: item.iconUrl,
      description: item.description,
      displayOrder: item.displayOrder,
      isFeatured: item.isFeatured,
      isActive: item.isActive
    } : {
      categoryId: categories.data?.[0]?.id,
      name: '', level: undefined, iconUrl: '', description: '', displayOrder: 0, isFeatured: false, isActive: true
    });
    setSkillModal(true);
  };

  const openCategory = (item?: SkillCategoryDto) => {
    setEditingCategory(item ?? null);
    categoryForm.setFieldsValue(item ? {
      name: item.name,
      description: item.description,
      displayOrder: item.displayOrder,
      isActive: item.isActive
    } : { name: '', description: '', displayOrder: 0, isActive: true });
    setCategoryModal(true);
  };

  const skillColumns = [
    { title: 'STT', width: 70, render: (_: unknown, __: SkillDto, index: number) => (page - 1) * pageSize + index + 1 },
    { title: 'Kỹ năng', dataIndex: 'name', render: (value: string, row: SkillDto) => <div><b>{value}</b><div style={{ color: '#64748b', fontSize: 12 }}>{row.description || 'Không có mô tả'}</div></div> },
    { title: 'Nhóm', dataIndex: 'categoryName' },
    { title: 'Trình độ', dataIndex: 'levelName', render: (value?: string) => value ? <Tag color="blue">{value}</Tag> : '—' },
    { title: 'Dự án', dataIndex: 'projectCount', width: 90 },
    { title: 'Hiển thị', dataIndex: 'isActive', render: (value: boolean) => <ActiveTag active={value} /> },
    { title: 'Nổi bật', dataIndex: 'isFeatured', render: (value: boolean) => value ? <Tag color="purple">Nổi bật</Tag> : '—' },
    {
      title: 'Thao tác', fixed: 'right' as const, width: 170,
      render: (_: unknown, row: SkillDto) => <Space>
        <Button title="Chỉnh sửa" size="small" icon={<EditOutlined />} onClick={() => openSkill(row)} />
        <Button title="Nổi bật" size="small" icon={<StarOutlined />} onClick={() => toggle.mutate({ id: row.id, type: 'featured' })} />
        <Button size="small" onClick={() => toggle.mutate({ id: row.id, type: 'active' })}>{row.isActive ? 'Ẩn' : 'Bật'}</Button>
        <Popconfirm title="Xóa kỹ năng này?" onConfirm={() => removeSkill.mutate(row.id)}><Button title="Xóa" danger size="small" icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    }
  ];

  const categoryColumns = [
    { title: 'STT', width: 70, render: (_: unknown, __: SkillCategoryDto, index: number) => index + 1 },
    { title: 'Tên nhóm', dataIndex: 'name' },
    { title: 'Mô tả', dataIndex: 'description', render: (value?: string) => value || '—' },
    { title: 'Thứ tự', dataIndex: 'displayOrder', width: 100 },
    { title: 'Số kỹ năng', dataIndex: 'skillCount', width: 110 },
    { title: 'Trạng thái', dataIndex: 'isActive', render: (value: boolean) => <ActiveTag active={value} /> },
    {
      title: 'Thao tác', width: 120,
      render: (_: unknown, row: SkillCategoryDto) => <Space>
        <Button title="Chỉnh sửa" size="small" icon={<EditOutlined />} onClick={() => openCategory(row)} />
        <Popconfirm title="Chỉ xóa được nhóm chưa có kỹ năng. Tiếp tục?" onConfirm={() => removeCategory.mutate(row.id)}><Button title="Xóa" danger size="small" icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    }
  ];

  return (
    <>
      <PageHeader title="Quản lý kỹ năng" description="Quản lý nhóm, trình độ, thứ tự và trạng thái hiển thị kỹ năng." actions={<Space><Button title="Thêm mới" icon={<PlusOutlined />} onClick={() => openCategory()}>Thêm nhóm</Button><Button title="Thêm mới" type="primary" icon={<PlusOutlined />} onClick={() => openSkill()}>Thêm kỹ năng</Button></Space>} />
      <Tabs items={[
        {
          key: 'skills', label: 'Danh sách kỹ năng', children: <>
            <Card className="page-card" style={{ marginBottom: 16 }}>
              <Row gutter={[12, 12]}>
                <Col xs={24} md={10}><Input.Search allowClear placeholder="Tìm tên hoặc mô tả kỹ năng..." onSearch={(value) => { setKeyword(value); setPage(1); }} /></Col>
                <Col xs={24} md={7}><Select allowClear style={{ width: '100%' }} placeholder="Tất cả nhóm" options={categories.data?.map((x) => ({ value: x.id, label: x.name }))} onChange={(value) => { setCategoryId(value); setPage(1); }} /></Col>
                <Col xs={24} md={7}><Select allowClear style={{ width: '100%' }} placeholder="Tất cả trạng thái" options={[{ value: true, label: 'Đang hiển thị' }, { value: false, label: 'Đã ẩn' }]} onChange={(value) => { setIsActive(value); setPage(1); }} /></Col>
              </Row>
            </Card>
            <Table rowKey="id" className="page-card" loading={skills.isLoading} dataSource={skills.data?.items ?? []} columns={skillColumns} scroll={{ x: 1050 }} pagination={{ current: page, pageSize, total: skills.data?.totalCount ?? 0, showSizeChanger: true, onChange: (p, size) => { setPage(p); setPageSize(size); } }} />
          </>
        },
        {
          key: 'categories', label: `Nhóm kỹ năng (${categories.data?.length ?? 0})`, children: <Table rowKey="id" className="page-card" loading={categories.isLoading} dataSource={categories.data ?? []} columns={categoryColumns} pagination={false} />
        }
      ]} />

      <Modal open={skillModal} title={editingSkill ? 'Cập nhật kỹ năng' : 'Thêm kỹ năng'} onCancel={() => setSkillModal(false)} onOk={() => skillForm.submit()} confirmLoading={saveSkill.isPending} okText="Lưu" cancelText="Hủy" width={720} destroyOnClose>
        <Form form={skillForm} layout="vertical" onFinish={(values) => saveSkill.mutate(values)}>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item name="categoryId" label="Nhóm kỹ năng" rules={[{ required: true, message: 'Vui lòng chọn nhóm.' }]}><Select options={categories.data?.map((x) => ({ value: x.id, label: x.name }))} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="name" label="Tên kỹ năng" rules={[{ required: true, message: 'Vui lòng nhập tên kỹ năng.' }, { max: 100 }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="level" label="Trình độ"><Select allowClear options={skillLevelOptions} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="displayOrder" label="Thứ tự" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={24}><Form.Item name="iconUrl" label="Icon URL"><Input /></Form.Item></Col>
            <Col span={24}><Form.Item name="description" label="Mô tả"><Input.TextArea rows={4} maxLength={1000} showCount /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="isActive" label="Đang hiển thị" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="isFeatured" label="Nổi bật" valuePropName="checked"><Switch /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal open={categoryModal} title={editingCategory ? 'Cập nhật nhóm kỹ năng' : 'Thêm nhóm kỹ năng'} onCancel={() => setCategoryModal(false)} onOk={() => categoryForm.submit()} confirmLoading={saveCategory.isPending} okText="Lưu" cancelText="Hủy" destroyOnClose>
        <Form form={categoryForm} layout="vertical" onFinish={(values) => saveCategory.mutate(values)}>
          <Form.Item name="name" label="Tên nhóm" rules={[{ required: true, message: 'Vui lòng nhập tên nhóm.' }, { max: 100 }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={4} maxLength={500} showCount /></Form.Item>
          <Form.Item name="displayOrder" label="Thứ tự" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="isActive" label="Đang hoạt động" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
