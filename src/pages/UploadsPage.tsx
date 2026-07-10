import { DeleteOutlined, FileImageOutlined, FileOutlined, FilePdfOutlined } from '@ant-design/icons';
import { Button, Card, Col, List, Popconfirm, Row, Space, Typography, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/api';
import { FileUploadButton, PageHeader } from '@/components/Common';
import type { UploadedFileDto } from '@/types';
import { absoluteFileUrl, formatFileSize, getErrorMessage } from '@/utils';

export function UploadsPage() {
  const [files, setFiles] = useState<UploadedFileDto[]>([]);
  const upload = useMutation({
    mutationFn: ({ type, file }: { type: 'image' | 'file' | 'cv'; file: File }) => type === 'image' ? api.uploads.image(file) : type === 'cv' ? api.uploads.cv(file) : api.uploads.file(file),
    onSuccess(data) { setFiles((current) => [data, ...current]); message.success('Đã tải file thành công.'); }, onError(error) { message.error(getErrorMessage(error)); }
  });
  const remove = useMutation({ mutationFn: api.uploads.remove, onSuccess(_, id) { setFiles((current) => current.filter((file) => file.id !== id)); message.success('Đã xóa file.'); }, onError(error) { message.error(getErrorMessage(error)); } });

  const uploadCards = [
    { type: 'image' as const, title: 'Tải ảnh dùng chung', description: 'JPG, PNG hoặc WEBP tối đa 10 MB.', accept: 'image/jpeg,image/png,image/webp', icon: <FileImageOutlined style={{ fontSize: 30, color: '#2563eb' }} /> },
    { type: 'file' as const, title: 'Tải tài liệu', description: 'PDF hoặc DOCX tối đa 15 MB.', accept: '.pdf,.docx', icon: <FileOutlined style={{ fontSize: 30, color: '#7c3aed' }} /> },
    { type: 'cv' as const, title: 'Tải CV', description: 'PDF hoặc DOCX tối đa 10 MB.', accept: '.pdf,.docx', icon: <FilePdfOutlined style={{ fontSize: 30, color: '#059669' }} /> }
  ];

  return <>
    <PageHeader title="Kho file dùng chung" description="Tải ảnh, tài liệu và CV để sử dụng trong nội dung Portfolio." />
    <Row gutter={[16, 16]}>
      {uploadCards.map((item) => <Col xs={24} md={8} key={item.type}><Card className="page-card" style={{ height: '100%' }}><Space direction="vertical" size={12}>{item.icon}<Typography.Title level={4} style={{ margin: 0 }}>{item.title}</Typography.Title><Typography.Text type="secondary">{item.description}</Typography.Text><FileUploadButton label="Chọn file" accept={item.accept} loading={upload.isPending} onFile={(file) => upload.mutate({ type: item.type, file })} /></Space></Card></Col>)}
    </Row>
    <Card title="File vừa tải trong phiên này" className="page-card" style={{ marginTop: 16 }}>
      <List dataSource={files} locale={{ emptyText: 'Chưa tải file nào trong phiên làm việc này.' }} renderItem={(file) => <List.Item actions={[<Popconfirm title="Xóa file này?" description="Không thể xóa nếu file đang được dữ liệu khác sử dụng." onConfirm={() => remove.mutate(file.id)}><Button danger size="small" icon={<DeleteOutlined />} /></Popconfirm>]}><List.Item.Meta avatar={<FileOutlined style={{ fontSize: 24, color: '#64748b' }} />} title={<a href={absoluteFileUrl(file.fileUrl)} target="_blank" rel="noreferrer">{file.originalFileName}</a>} description={`${file.contentType} · ${formatFileSize(file.fileSize)}`} /></List.Item>} />
    </Card>
  </>;
}
