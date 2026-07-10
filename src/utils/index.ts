import axios from 'axios';
import dayjs from 'dayjs';
import type { ProblemDetails } from '@/types';

export const formatDate = (value?: string | null) => value ? dayjs(value).format('DD/MM/YYYY') : '—';
export const formatDateTime = (value?: string | null) => value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—';
export const formatFileSize = (bytes?: number | null) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};
export const absoluteFileUrl = (path?: string | null) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const base = import.meta.env.VITE_PUBLIC_BASE_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7165';
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ProblemDetails>(error)) {
    const data = error.response?.data;
    const first = data?.errors ? Object.values(data.errors).flat()[0] : undefined;
    if (first) return first;
    if (data?.detail) return data.detail;
    if (data?.title) return data.title;
    if (error.response?.status === 401) return 'Phiên đăng nhập đã hết hạn.';
    if (error.response?.status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
    if (error.response?.status === 404) return 'Không tìm thấy dữ liệu.';
    if (error.response?.status === 409) return 'Dữ liệu bị xung đột.';
  }
  return error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.';
}
