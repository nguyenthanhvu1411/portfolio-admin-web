import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  SaveOutlined,
  UserOutlined,
} from '@ant-design/icons';

import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Image,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Switch,
  Typography,
  message,
} from 'antd';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  useEffect,
  useState,
} from 'react';
import { api } from '@/api';
import { FileUploadButton, PageHeader } from '@/components/Common';
import type { ProfileRequest } from '@/types';
import { absoluteFileUrl, getErrorMessage } from '@/utils';

const { TextArea } = Input;

type CvFileType =
  | 'pdf'
  | 'image'
  | 'word'
  | 'unknown';

function getFileExtension(
  fileUrl?: string | null,
): string {
  if (!fileUrl) {
    return '';
  }

  const cleanUrl = fileUrl
    .split('?')[0]
    .split('#')[0];

  return cleanUrl
    .split('.')
    .pop()
    ?.toLowerCase() ?? '';
}

function getCvFileType(
  fileUrl?: string | null,
): CvFileType {
  const extension =
    getFileExtension(fileUrl);

  if (extension === 'pdf') {
    return 'pdf';
  }

  if (
    ['jpg', 'jpeg', 'png', 'webp'].includes(
      extension,
    )
  ) {
    return 'image';
  }

  if (
    ['doc', 'docx'].includes(extension)
  ) {
    return 'word';
  }

  return 'unknown';
}

function getFileName(
  fileUrl?: string | null,
): string {
  if (!fileUrl) {
    return 'CV hiện tại';
  }

  try {
    const cleanUrl = fileUrl
      .split('?')[0]
      .split('#')[0];

    return decodeURIComponent(
      cleanUrl.split('/').pop() ||
        'CV hiện tại',
    );
  } catch {
    return 'CV hiện tại';
  }
}

export function ProfilePage() {
  const [form] = Form.useForm<ProfileRequest>();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['profile'], queryFn: api.profile.get });
  
  const [cvPreviewOpen, setCvPreviewOpen] = useState(false);

  useEffect(() => { if (query.data) form.setFieldsValue(query.data); }, [query.data, form]);

  const update = useMutation({
    mutationFn: api.profile.update,
    onSuccess(data) {
      client.setQueryData(['profile'], data);
      message.success('Đã cập nhật hồ sơ.');
    },
    onError(error) { message.error(getErrorMessage(error)); }
  });
  const upload = useMutation({
    mutationFn: ({ type, file }: { type: 'avatar' | 'banner' | 'cv'; file: File }) => api.profile.upload(type, file),
    onSuccess() { client.invalidateQueries({ queryKey: ['profile'] }); message.success('Tải file thành công.'); },
    onError(error) { message.error(getErrorMessage(error)); }
  });
  const remove = useMutation({
    mutationFn: api.profile.remove,
    onSuccess() { client.invalidateQueries({ queryKey: ['profile'] }); message.success('Đã xóa file.'); },
    onError(error) { message.error(getErrorMessage(error)); }
  });

  const bannerUrl = absoluteFileUrl(
    query.data?.bannerUrl,
  );

  const avatarUrl = absoluteFileUrl(
    query.data?.avatarUrl,
  );

  const cvUrl = absoluteFileUrl(
    query.data?.cvUrl,
  );

  const cvFileType = getCvFileType(
    query.data?.cvUrl,
  );

  const cvFileName = getFileName(
    query.data?.cvUrl,
  );

  const handleViewCv = () => {
    if (!cvUrl) {
      message.warning(
        'Chưa có file CV để xem.',
      );

      return;
    }

    if (
      cvFileType === 'pdf' ||
      cvFileType === 'image'
    ) {
      setCvPreviewOpen(true);
      return;
    }

    /*
     * DOC/DOCX không được trình duyệt hỗ trợ
     * preview trực tiếp ổn định.
     * Trình duyệt sẽ mở file hoặc tải xuống.
     */
    window.open(
      cvUrl,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <>
      <PageHeader title="Hồ sơ cá nhân" description="Thông tin hiển thị trên trang Portfolio công khai." />
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card className="page-card" loading={query.isLoading}>
            <Form form={form} layout="vertical" onFinish={(values) => update.mutate(values)}>
              <Row gutter={16}>
                <Col xs={24} md={12}><Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên.' }]}><Input /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="jobTitle" label="Chức danh" rules={[{ required: true, message: 'Vui lòng nhập chức danh.' }]}><Input /></Form.Item></Col>
                <Col span={24}><Form.Item name="shortBio" label="Giới thiệu ngắn"><TextArea rows={3} maxLength={500} showCount /></Form.Item></Col>
                <Col span={24}><Form.Item name="aboutMe" label="Giới thiệu chi tiết"><TextArea rows={7} maxLength={5000} showCount /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="email" label="Email công khai" rules={[{ type: 'email', message: 'Email không hợp lệ.' }]}><Input /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item name="phone" label="Số điện thoại"><Input /></Form.Item></Col>
                <Col span={24}><Form.Item name="address" label="Địa chỉ"><Input /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="githubUrl" label="GitHub URL"><Input /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="linkedinUrl" label="LinkedIn URL"><Input /></Form.Item></Col>
                <Col xs={24} md={8}><Form.Item name="facebookUrl" label="Facebook URL"><Input /></Form.Item></Col>
                <Col span={24}><Form.Item name="isActive" label="Hiển thị công khai" valuePropName="checked"><Switch /></Form.Item></Col>
              </Row>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={update.isPending}>Lưu thay đổi</Button>
            </Form>
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card
              title="Banner"
              className="page-card"
            >
              {bannerUrl ? (
                <div
                  style={{
                    width: '100%',
                    overflow: 'hidden',
                    borderRadius: 12,
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Image
                    width="100%"
                    height={190}
                    src={bannerUrl}
                    alt="Banner Portfolio"
                    style={{
                      display: 'block',
                      objectFit: 'cover',
                    }}
                    preview={{
                      mask: (
                        <Space>
                          <EyeOutlined />
                          Xem banner
                        </Space>
                      ),
                    }}
                    fallback={`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">
                        <rect width="100%" height="100%" fill="#f1f5f9"/>
                        <text
                          x="50%"
                          y="50%"
                          dominant-baseline="middle"
                          text-anchor="middle"
                          fill="#94a3b8"
                          font-family="Arial"
                          font-size="24"
                        >
                          Không thể tải banner
                        </text>
                      </svg>
                    `)}`}
                  />
                </div>
              ) : (
                <div
                  style={{
                    height: 190,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    border: '1px dashed #cbd5e1',
                    background: '#f8fafc',
                  }}
                >
                  <Empty
                    image={
                      Empty.PRESENTED_IMAGE_SIMPLE
                    }
                    description="Chưa có banner"
                  />
                </div>
              )}

              <Space
                wrap
                style={{ marginTop: 16 }}
              >
                <FileUploadButton
                  label={
                    bannerUrl
                      ? 'Thay banner'
                      : 'Tải banner'
                  }
                  accept="image/jpeg,image/png,image/webp"
                  loading={upload.isPending}
                  onFile={(file) =>
                    upload.mutate({
                      type: 'banner',
                      file,
                    })
                  }
                />

                {bannerUrl ? (
                  <Popconfirm
                    title="Xóa banner?"
                    description="Ảnh banner sẽ bị xóa khỏi hồ sơ."
                    okText="Xóa"
                    cancelText="Hủy"
                    onConfirm={() =>
                      remove.mutate('banner')
                    }
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                    >
                      Xóa
                    </Button>
                  </Popconfirm>
                ) : null}
              </Space>
            </Card>
            <Card
              title="Ảnh đại diện"
              className="page-card"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                  flexWrap: 'wrap',
                }}
              >
                {avatarUrl ? (
                  <Image
                    width={120}
                    height={120}
                    src={avatarUrl}
                    alt="Ảnh đại diện"
                    style={{
                      display: 'block',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      border:
                        '3px solid #f1f5f9',
                    }}
                    preview={{
                      mask: (
                        <Space direction="vertical">
                          <EyeOutlined />
                          <span>Xem ảnh</span>
                        </Space>
                      ),
                    }}
                    fallback={`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
                        <rect width="100%" height="100%" fill="#e2e8f0"/>
                        <text
                          x="50%"
                          y="50%"
                          dominant-baseline="middle"
                          text-anchor="middle"
                          fill="#64748b"
                          font-family="Arial"
                          font-size="18"
                        >
                          Avatar
                        </text>
                      </svg>
                    `)}`}
                  />
                ) : (
                  <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    style={{
                      background: '#e2e8f0',
                      color: '#64748b',
                    }}
                  />
                )}

                <Space direction="vertical">
                  <FileUploadButton
                    label={
                      avatarUrl
                        ? 'Thay ảnh'
                        : 'Tải ảnh đại diện'
                    }
                    accept="image/jpeg,image/png,image/webp"
                    loading={upload.isPending}
                    onFile={(file) =>
                      upload.mutate({
                        type: 'avatar',
                        file,
                      })
                    }
                  />

                  {avatarUrl ? (
                    <Popconfirm
                      title="Xóa ảnh đại diện?"
                      description="Ảnh đại diện sẽ bị xóa khỏi hồ sơ."
                      okText="Xóa"
                      cancelText="Hủy"
                      onConfirm={() =>
                        remove.mutate('avatar')
                      }
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                      >
                        Xóa
                      </Button>
                    </Popconfirm>
                  ) : null}
                </Space>
              </div>
            </Card>
            <Card
              title="CV"
              className="page-card"
            >
              {cvUrl ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: 16,
                      borderRadius: 12,
                      border:
                        '1px solid #e2e8f0',
                      background: '#f8fafc',
                    }}
                  >
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          'center',
                        flexShrink: 0,
                        borderRadius: 12,
                        fontSize: 26,

                        background:
                          cvFileType === 'pdf'
                            ? '#fee2e2'
                            : cvFileType ===
                                'image'
                              ? '#dcfce7'
                              : '#dbeafe',

                        color:
                          cvFileType === 'pdf'
                            ? '#dc2626'
                            : cvFileType ===
                                'image'
                              ? '#16a34a'
                              : '#2563eb',
                      }}
                    >
                      {cvFileType === 'pdf' ? (
                        <FilePdfOutlined />
                      ) : cvFileType ===
                          'image' ? (
                        <FileImageOutlined />
                      ) : (
                        <FileWordOutlined />
                      )}
                    </div>

                    <div
                      style={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <Typography.Text strong>
                        {cvFileName}
                      </Typography.Text>

                      <Typography.Paragraph
                        type="secondary"
                        ellipsis
                        style={{
                          marginTop: 4,
                          marginBottom: 0,
                        }}
                      >
                        {cvFileType === 'pdf'
                          ? 'Tài liệu PDF'
                          : cvFileType ===
                              'image'
                            ? 'CV dạng hình ảnh'
                            : cvFileType ===
                                'word'
                              ? 'Tài liệu Microsoft Word'
                              : 'Tài liệu CV'}
                      </Typography.Paragraph>
                    </div>
                  </div>

                  <Space
                    wrap
                    style={{ marginTop: 16 }}
                  >
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={handleViewCv}
                    >
                      Xem CV
                    </Button>

                    <Button
                      href={cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      icon={<DownloadOutlined />}
                    >
                      Mở file
                    </Button>

                    <FileUploadButton
                      label="Thay CV"
                      accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp"
                      loading={upload.isPending}
                      onFile={(file) =>
                        upload.mutate({
                          type: 'cv',
                          file,
                        })
                      }
                    />

                    <Popconfirm
                      title="Xóa CV?"
                      description="File CV sẽ bị xóa khỏi hồ sơ."
                      okText="Xóa"
                      cancelText="Hủy"
                      onConfirm={() =>
                        remove.mutate('cv')
                      }
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                      >
                        Xóa
                      </Button>
                    </Popconfirm>
                  </Space>
                </>
              ) : (
                <>
                  <Empty
                    image={
                      Empty.PRESENTED_IMAGE_SIMPLE
                    }
                    description="Chưa tải CV"
                  />

                  <div
                    style={{
                      textAlign: 'center',
                    }}
                  >
                    <FileUploadButton
                      label="Tải CV"
                      accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp"
                      loading={upload.isPending}
                      onFile={(file) =>
                        upload.mutate({
                          type: 'cv',
                          file,
                        })
                      }
                    />
                  </div>
                </>
              )}
            </Card>
          </Space>
        </Col>
      </Row>
      <Modal
        open={cvPreviewOpen}
        title={
          <Space>
            {cvFileType === 'pdf' ? (
              <FilePdfOutlined />
            ) : (
              <FileImageOutlined />
            )}

            <span>Xem CV</span>
          </Space>
        }
        width="min(1100px, 96vw)"
        destroyOnClose
        onCancel={() =>
          setCvPreviewOpen(false)
        }
        footer={[
          <Button
            key="open"
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            icon={<DownloadOutlined />}
          >
            Mở trong tab mới
          </Button>,

          <Button
            key="close"
            type="primary"
            onClick={() =>
              setCvPreviewOpen(false)
            }
          >
            Đóng
          </Button>,
        ]}
      >
        {cvFileType === 'pdf' ? (
          <iframe
            src={`${cvUrl}#toolbar=1&navpanes=0`}
            title="CV PDF"
            style={{
              display: 'block',
              width: '100%',
              height: '75vh',
              border: 0,
              borderRadius: 8,
              background: '#f1f5f9',
            }}
          />
        ) : null}

        {cvFileType === 'image' ? (
          <div
            style={{
              maxHeight: '75vh',
              overflow: 'auto',
              textAlign: 'center',
              borderRadius: 8,
              background: '#f1f5f9',
              padding: 16,
            }}
          >
            <Image
              src={cvUrl}
              alt="CV"
              preview={false}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 8,
              }}
            />
          </div>
        ) : null}
      </Modal>
    </>
  );
}
