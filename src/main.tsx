import React from 'react';
import ReactDOM from 'react-dom/client';
import { App as AntApp, ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false
    },
    mutations: { retry: 0 }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={viVN}
        theme={{
          token: {
            colorPrimary: '#2563EB',
            colorSuccess: '#059669',
            colorWarning: '#D97706',
            colorError: '#DC2626',
            colorText: '#0F172A',
            colorTextSecondary: '#64748B',
            colorBorder: '#E2E8F0',
            borderRadius: 10,
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
          },
          components: {
            Layout: { siderBg: '#0F172A', headerBg: '#FFFFFF' },
            Menu: { darkItemBg: '#0F172A', darkSubMenuItemBg: '#0F172A', darkItemSelectedBg: '#1E3A8A' }
          }
        }}
      >
        <AntApp>
          <App />
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
