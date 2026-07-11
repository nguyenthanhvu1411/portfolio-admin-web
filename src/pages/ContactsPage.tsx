import { CheckCircleOutlined, DeleteOutlined, EyeOutlined, InboxOutlined } from '@ant-design/icons';
import { Button, Card, Col, Descriptions, Drawer, Input, Popconfirm, Row, Select, Space, Table, Tag, Typography, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/api';
import { PageHeader } from '@/components/Common';
import { ContactStatus, type ContactMessageDto } from '@/types';
import { formatDateTime, getErrorMessage } from '@/utils';

const tone: Record<ContactStatus, string> = { [ContactStatus.New]: 'blue', [ContactStatus.Read]: 'warning', [ContactStatus.Replied]: 'success', [ContactStatus.Archived]: 'default' };

export function ContactsPage() {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<ContactStatus | undefined>();
  const [selected, setSelected] = useState<ContactMessageDto | null>(null);
  const query = useQuery({ queryKey: ['contacts', { page, pageSize, keyword, status }], queryFn: () => api.contacts.list({ page, pageSize, keyword: keyword || undefined, status }) });
  const refresh = () => client.invalidateQueries({ queryKey: ['contacts'] });
  const action = useMutation<unknown, unknown, { id: number; type: 'replied' | 'archive' | 'delete' }>({
    mutationFn: ({ id, type }: { id: number; type: 'replied' | 'archive' | 'delete' }) => type === 'replied' ? api.contacts.markReplied(id) : type === 'archive' ? api.contacts.archive(id) : api.contacts.remove(id),
    onSuccess() { message.success('Đã cập nhật tin nhắn.'); refresh(); }, onError(error) { message.error(getErrorMessage(error)); }
  });
  const view = async (row: ContactMessageDto) => {
    try { const detail = await api.contacts.get(row.id); setSelected(detail); refresh(); }
    catch (error) { message.error(getErrorMessage(error)); }
  };
  const columns = [
    { title: 'STT', width: 70, render: (_: unknown, __: ContactMessageDto, index: number) => (page - 1) * pageSize + index + 1 },
    { title: 'Người gửi', width: 250, render: (_: unknown, row: ContactMessageDto) => <div><b>{row.fullName}</b><div style={{ color: '#64748b', fontSize: 12 }}>{row.email}</div></div> },
    { title: 'Tiêu đề', dataIndex: 'subject', ellipsis: true },
    { title: 'Trạng thái', render: (_: unknown, row: ContactMessageDto) => <Tag color={tone[row.status]}>{row.statusName}</Tag> },
    { title: 'Ngày gửi', dataIndex: 'createdAt', render: (value: string) => formatDateTime(value) },
    { title: 'Thao tác', fixed: 'right' as const, width: 170, render: (_: unknown, row: ContactMessageDto) => <Space><Button title="Xem chi tiết" size="small" icon={<EyeOutlined />} onClick={() => view(row)} /><Button title="Đã phản hồi" size="small" icon={<CheckCircleOutlined />} onClick={() => action.mutate({ id: row.id, type: 'replied' })} /><Button title="Lưu trữ" size="small" icon={<InboxOutlined />} onClick={() => action.mutate({ id: row.id, type: 'archive' })} /><Popconfirm title="Xóa vĩnh viễn tin nhắn này?" onConfirm={() => action.mutate({ id: row.id, type: 'delete' })}><Button title="Xóa" danger size="small" icon={<DeleteOutlined />} /></Popconfirm></Space> }
  ];
  return <>
    <PageHeader title="Tin nhắn liên hệ" description="Xem và xử lý tin nhắn từ khách truy cập website." />
    <Card className="page-card" style={{ marginBottom: 16 }}><Row gutter={[12, 12]}><Col xs={24} md={16}><Input.Search allowClear placeholder="Tìm người gửi, email, tiêu đề hoặc nội dung..." onSearch={(value) => { setKeyword(value); setPage(1); }} /></Col><Col xs={24} md={8}><Select allowClear style={{ width: '100%' }} placeholder="Tất cả trạng thái" options={[{ value: ContactStatus.New, label: 'Tin nhắn mới' }, { value: ContactStatus.Read, label: 'Đã đọc' }, { value: ContactStatus.Replied, label: 'Đã phản hồi' }, { value: ContactStatus.Archived, label: 'Đã lưu trữ' }]} onChange={(value) => { setStatus(value); setPage(1); }} /></Col></Row></Card>
    <Table rowKey="id" className="page-card" loading={query.isLoading} dataSource={query.data?.items ?? []} columns={columns} scroll={{ x: 900 }} pagination={{ current: page, pageSize, total: query.data?.totalCount ?? 0, showSizeChanger: true, onChange: (p, size) => { setPage(p); setPageSize(size); } }} />
    <Drawer open={Boolean(selected)} title={selected?.subject ?? 'Chi tiết tin nhắn'} width={640} onClose={() => setSelected(null)} extra={selected ? <Button title="Đã phản hồi" type="primary" icon={<CheckCircleOutlined />} onClick={() => action.mutate({ id: selected.id, type: 'replied' })}>Đã phản hồi</Button> : null}>
      {selected ? <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <Descriptions bordered column={1} size="small" items={[{ key: 'name', label: 'Người gửi', children: selected.fullName }, { key: 'email', label: 'Email', children: selected.email }, { key: 'phone', label: 'Điện thoại', children: selected.phone || '—' }, { key: 'company', label: 'Công ty', children: selected.company || '—' }, { key: 'date', label: 'Ngày gửi', children: formatDateTime(selected.createdAt) }, { key: 'status', label: 'Trạng thái', children: <Tag color={tone[selected.status]}>{selected.statusName}</Tag> }]} />
        <div><Typography.Title level={5}>Nội dung</Typography.Title><Card size="small"><Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>{selected.message}</Typography.Paragraph></Card></div>
      </Space> : null}
    </Drawer>
  </>;
}
