import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import type { LoginResponse } from '@/types';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7165';
export const httpClient = axios.create({ baseURL, withCredentials: true, headers: { Accept: 'application/json' } });
const refreshClient = axios.create({ baseURL, withCredentials: true, headers: { Accept: 'application/json' } });
let refreshPromise: Promise<string> | null = null;

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig { _retry?: boolean; }

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      original.url?.includes('/api/auth/login') ||
      original.url?.includes('/api/auth/refresh')
    ) return Promise.reject(error);

    original._retry = true;
    try {
      refreshPromise ??= refreshClient.post<LoginResponse>('/api/auth/refresh')
        .then(({ data }) => {
          useAuthStore.getState().setSession(data.accessToken, data.accessTokenExpiresAt, data.admin);
          return data.accessToken;
        })
        .finally(() => { refreshPromise = null; });
      const token = await refreshPromise;
      original.headers.Authorization = `Bearer ${token}`;
      return httpClient(original);
    } catch (refreshError) {
      useAuthStore.getState().clearSession();
      if (window.location.pathname !== '/login') window.location.assign('/login');
      return Promise.reject(refreshError);
    }
  }
);
