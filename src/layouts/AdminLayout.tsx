import {
  AppstoreOutlined,
  BookOutlined,
  ContactsOutlined,
  DashboardOutlined,
  FileImageOutlined,
  FolderOpenOutlined,
  LogoutOutlined,
  MenuOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  SolutionOutlined,
  StarOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Avatar, Button, Drawer, Dropdown, Layout, Menu, Space, Typography } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authApi } from '@/api';
import { useAuthStore } from '@/stores/authStore';
import { absoluteFileUrl } from '@/utils';

const { Header, Sider, Content } = Layout;

const items = [
  { key: '/', icon: <DashboardOutlined />, label: 'Bảng điều khiển' },
  {
    type: 'group' as const,
    label: 'NỘI DUNG',
    children: [
      { key: '/profile', icon: <UserOutlined />, label: 'Hồ sơ cá nhân' },
      { key: '/skills', icon: <StarOutlined />, label: 'Kỹ năng' },
      { key: '/projects', icon: <FolderOpenOutlined />, label: 'Dự án' },
      { key: '/experiences', icon: <SolutionOutlined />, label: 'Kinh nghiệm' },
      { key: '/education', icon: <BookOutlined />, label: 'Học vấn' },
      { key: '/certificates', icon: <SafetyCertificateOutlined />, label: 'Chứng chỉ' },
      { key: '/blogs', icon: <AppstoreOutlined />, label: 'Bài viết' }
    ]
  },
  {
    type: 'group' as const,
    label: 'TƯƠNG TÁC',
    children: [
      { key: '/contacts', icon: <ContactsOutlined />, label: 'Tin nhắn liên hệ' },
      { key: '/uploads', icon: <FileImageOutlined />, label: 'Kho file' }
    ]
  },
  {
    type: 'group' as const,
    label: 'HỆ THỐNG',
    children: [
      { key: '/users', icon: <TeamOutlined />, label: 'Tài khoản quản trị' },
      { key: '/settings', icon: <SettingOutlined />, label: 'Cấu hình website' }
    ]
  }
];

export function AdminLayout() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const admin = useAuthStore((state) => state.admin);
  const clearSession = useAuthStore((state) => state.clearSession);
  const logout = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearSession();
      navigate('/login', { replace: true });
    }
  });

  return (
    <Layout className="app-shell">
      <Sider width={256} theme="dark" className="app-sider">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #1e293b' }}>
          <div>
            <Typography.Text strong style={{ color: '#fff', fontSize: 18 }}>Portfolio Admin</Typography.Text>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>Content Management</div>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname === '/' ? '/' : `/${location.pathname.split('/')[1]}`]}
          items={items}
          onClick={({ key }) => navigate(key)}
          style={{ paddingTop: 12 }}
        />
      </Sider>

      <Drawer
        open={mobileOpen}
        placement="left"
        width={256}
        closable={false}
        styles={{ body: { padding: 0, background: '#0F172A' } }}
        onClose={() => setMobileOpen(false)}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #1e293b' }}>
          <div><Typography.Text strong style={{ color: '#fff', fontSize: 18 }}>Portfolio Admin</Typography.Text><div style={{ color: '#94a3b8', fontSize: 11 }}>Content Management</div></div>
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname === '/' ? '/' : `/${location.pathname.split('/')[1]}`]} items={items} onClick={({ key }) => { navigate(key); setMobileOpen(false); }} style={{ paddingTop: 12, minHeight: 'calc(100vh - 64px)' }} />
      </Drawer>

      <Layout className="app-main">
        <Header className="app-header">
          <Space>
            <Button className="mobile-menu-button" type="text" icon={<MenuOutlined />} onClick={() => setMobileOpen(true)} />
            <Typography.Text type="secondary">Quản trị nội dung Portfolio</Typography.Text>
          </Space>
          <Dropdown
            menu={{
              items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất' }],
              onClick: () => logout.mutate()
            }}
          >
            <Button type="text">
              <Space>
                <Avatar src={admin?.avatarUrl ? absoluteFileUrl(admin.avatarUrl) : undefined} icon={<UserOutlined />} />
                <span>{admin?.fullName ?? 'Quản trị viên'}</span>
              </Space>
            </Button>
          </Dropdown>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
