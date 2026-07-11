import { EditOutlined, KeyOutlined, LockOutlined, PlusOutlined, UnlockOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Form, Input, Modal, Row, Select, Space, Table, Tag, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/api';
import { PageHeader } from '@/components/Common';
import { useAuthStore } from '@/stores/authStore';
import { UserStatus, type UserCreateRequest, type UserDto, type UserUpdateRequest } from '@/types';
import { absoluteFileUrl, formatDateTime, getErrorMessage } from '@/utils';

interface UserFormValues {
  email: string;
  fullName: string;
  password?: string;
  status: UserStatus;
  roleId: number;
}
interface ResetPasswordValues { newPassword: string; confirmPassword: string; }

export function UsersPage() {
  const client = useQueryClient();
  const currentAdmin = useAuthStore((state) => state.admin);
  const isSuperAdmin = currentAdmin?.roles.includes('SuperAdmin') ?? false;
  const [form] = Form.useForm<UserFormValues>();
  const [passwordForm] = Form.useForm<ResetPasswordValues>();
  const [open, setOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [editing, setEditing] = useState<UserDto | null>(null);
  const [resetUser, setResetUser] = useState<UserDto | null>(null);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<UserStatus | undefined>();
  const query = useQuery({ queryKey: ['users', { keyword, status }], queryFn: () => api.users.list({ keyword: keyword || undefined, status }) });
  const refresh = () => client.invalidateQueries({ queryKey: ['users'] });

  const save = useMutation({
    mutationFn: (values: UserFormValues) => {
      if (editing) {
        const request: UserUpdateRequest = { email: values.email, fullName: values.fullName, avatarUrl: editing.avatarUrl ?? null, status: values.status, roleIds: [values.roleId] };
        return api.users.update(editing.id, request);
      }
      const request: UserCreateRequest = { email: values.email, fullName: values.fullName, password: values.password ?? '', status: values.status, roleIds: [values.roleId] };
      return api.users.create(request);
    },
    onSuccess() { message.success('Đã lưu tài khoản.'); setOpen(false); refresh(); }, onError(error) { message.error(getErrorMessage(error)); }
  });
  const toggle = useMutation({
    mutationFn: ({ id, locked }: { id: number; locked: boolean }) => locked ? api.users.unlock(id) : api.users.lock(id),
    onSuccess() { message.success('Đã cập nhật trạng thái tài khoản.'); refresh(); }, onError(error) { message.error(getErrorMessage(error)); }
  });
  const resetPassword = useMutation({
    mutationFn: (values: ResetPasswordValues) => api.users.resetPassword(resetUser!.id, values),
    onSuccess() { message.success('Đã đặt lại mật khẩu và thu hồi phiên cũ.'); setPasswordOpen(false); passwordForm.resetFields(); }, onError(error) { message.error(getErrorMessage(error)); }
  });

  const showForm = (item?: UserDto) => {
    setEditing(item ?? null);
    form.setFieldsValue(item ? { email: item.email, fullName: item.fullName, password: '', status: item.status, roleId: item.roles[0]?.id ?? 2 } : { email: '', fullName: '', password: '', status: UserStatus.Active, roleId: 2 });
    setOpen(true);
  };

  const columns = [
    { title: 'STT', width: 70, render: (_: unknown, __: UserDto, index: number) => index + 1 },
    { title: 'Tài khoản', width: 300, render: (_: unknown, row: UserDto) => <Space><Avatar src={row.avatarUrl ? absoluteFileUrl(row.avatarUrl) : undefined}>{row.fullName.charAt(0)}</Avatar><div><b>{row.fullName}</b><div style={{ color: '#64748b', fontSize: 12 }}>{row.email}</div></div></Space> },
    { title: 'Vai trò', render: (_: unknown, row: UserDto) => row.roles.map((role) => <Tag color={role.name === 'SuperAdmin' ? 'purple' : 'blue'} key={role.id}>{role.name}</Tag>) },
    { title: 'Trạng thái', render: (_: unknown, row: UserDto) => <Tag color={row.status === UserStatus.Active ? 'success' : row.status === UserStatus.Locked ? 'error' : 'default'}>{row.statusName}</Tag> },
    { title: 'Đăng nhập cuối', dataIndex: 'lastLoginAt', render: (value?: string) => formatDateTime(value) },
    {
      title: 'Thao tác', fixed: 'right' as const, width: 155,
      render: (_: unknown, row: UserDto) => isSuperAdmin ? <Space>
        <Button title="Chỉnh sửa" size="small" icon={<EditOutlined />} onClick={() => showForm(row)} />
        <Button title="Khóa/Mở khóa" size="small" icon={row.status === UserStatus.Locked ? <UnlockOutlined /> : <LockOutlined />} onClick={() => toggle.mutate({ id: row.id, locked: row.status === UserStatus.Locked })} />
        <Button title="Đổi mật khẩu" size="small" icon={<KeyOutlined />} onClick={() => { setResetUser(row); setPasswordOpen(true); }} />
      </Space> : <TypographyText />
    }
  ];

  return <>
    <PageHeader title="Tài khoản quản trị" description="Quản lý Admin, SuperAdmin và trạng thái đăng nhập." actions={isSuperAdmin ? <Button title="Thêm mới" type="primary" icon={<PlusOutlined />} onClick={() => showForm()}>Thêm tài khoản</Button> : undefined} />
    <Card className="page-card" style={{ marginBottom: 16 }}><Row gutter={[12, 12]}><Col xs={24} md={16}><Input.Search allowClear placeholder="Tìm họ tên hoặc email..." onSearch={setKeyword} /></Col><Col xs={24} md={8}><Select allowClear style={{ width: '100%' }} placeholder="Tất cả trạng thái" options={[{ value: UserStatus.Active, label: 'Hoạt động' }, { value: UserStatus.Locked, label: 'Bị khóa' }, { value: UserStatus.Inactive, label: 'Ngưng hoạt động' }]} onChange={setStatus} /></Col></Row></Card>
    <Table rowKey="id" className="page-card" loading={query.isLoading} dataSource={query.data ?? []} columns={columns} scroll={{ x: 900 }} pagination={false} />

    <Modal open={open} title={editing ? 'Cập nhật tài khoản' : 'Tạo tài khoản quản trị'} onCancel={() => setOpen(false)} onOk={() => form.submit()} okText="Lưu" cancelText="Hủy" confirmLoading={save.isPending} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={(values) => save.mutate(values)}>
        <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên.' }]}><Input /></Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email.' }, { type: 'email', message: 'Email không hợp lệ.' }]}><Input /></Form.Item>
        {!editing ? <Form.Item name="password" label="Mật khẩu ban đầu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu.' }, { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự.' }, { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, message: 'Cần chữ hoa, chữ thường, số và ký tự đặc biệt.' }]}><Input.Password /></Form.Item> : null}
        <Row gutter={16}>
          <Col span={12}><Form.Item name="roleId" label="Vai trò" rules={[{ required: true }]}><Select options={[{ value: 2, label: 'Admin' }, { value: 1, label: 'SuperAdmin' }]} /></Form.Item></Col>
          <Col span={12}><Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}><Select options={[{ value: UserStatus.Active, label: 'Hoạt động' }, { value: UserStatus.Locked, label: 'Bị khóa' }, { value: UserStatus.Inactive, label: 'Ngưng hoạt động' }]} /></Form.Item></Col>
        </Row>
      </Form>
    </Modal>

    <Modal open={passwordOpen} title={`Đặt lại mật khẩu: ${resetUser?.fullName ?? ''}`} onCancel={() => setPasswordOpen(false)} onOk={() => passwordForm.submit()} okText="Đặt lại" cancelText="Hủy" confirmLoading={resetPassword.isPending} destroyOnClose>
      <Form form={passwordForm} layout="vertical" onFinish={(values) => resetPassword.mutate(values)}>
        <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới.' }, { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự.' }, { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, message: 'Cần chữ hoa, chữ thường, số và ký tự đặc biệt.' }]}><Input.Password /></Form.Item>
        <Form.Item name="confirmPassword" label="Xác nhận mật khẩu" dependencies={['newPassword']} rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu.' }, ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue('newPassword') === value ? Promise.resolve() : Promise.reject(new Error('Mật khẩu xác nhận không khớp.')); } })]}><Input.Password /></Form.Item>
      </Form>
    </Modal>
  </>;
}

function TypographyText() {
  return <span style={{ color: '#94a3b8', fontSize: 12 }}>Chỉ SuperAdmin</span>;
}
