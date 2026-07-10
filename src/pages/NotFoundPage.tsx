import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();
  return <Result status="404" title="404" subTitle="Trang bạn truy cập không tồn tại hoặc đã được thay đổi." extra={<Button type="primary" onClick={() => navigate('/')}>Về bảng điều khiển</Button>} />;
}
