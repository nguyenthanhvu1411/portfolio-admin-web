import type { ReactNode } from 'react';
import { Button, Space, Tag, Typography, Upload, type UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <Title level={2} className="page-title">{title}</Title>
        {description ? <div className="page-description">{description}</div> : null}
      </div>
      {actions ? <Space wrap>{actions}</Space> : null}
    </div>
  );
}

export function ActiveTag({ active }: { active: boolean }) {
  return <Tag color={active ? 'success' : 'default'}>{active ? 'Đang hiển thị' : 'Đã ẩn'}</Tag>;
}

export function StatusTag({ label, tone = 'blue' }: { label: string; tone?: string }) {
  return <Tag color={tone}>{label}</Tag>;
}

export function FileUploadButton({
  label,
  accept,
  loading,
  onFile
}: {
  label: string;
  accept?: string;
  loading?: boolean;
  onFile: (file: File) => void;
}) {
  const props: UploadProps = {
    accept,
    showUploadList: false,
    beforeUpload(file) {
      onFile(file as File);
      return false;
    }
  };

  return (
    <Upload {...props}>
      <Button icon={<UploadOutlined />} loading={loading}>{label}</Button>
    </Upload>
  );
}

export function EmptyText({ children = 'Chưa có dữ liệu.' }: { children?: ReactNode }) {
  return <Text type="secondary">{children}</Text>;
}

export type AntUploadFile = UploadFile;
