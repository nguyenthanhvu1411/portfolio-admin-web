import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CurrentAdmin } from '@/types';

interface AuthState {
  accessToken: string | null;
  expiresAt: string | null;
  admin: CurrentAdmin | null;
  setSession: (accessToken: string, expiresAt: string, admin: CurrentAdmin) => void;
  setAdmin: (admin: CurrentAdmin | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      expiresAt: null,
      admin: null,
      setSession: (accessToken, expiresAt, admin) => set({ accessToken, expiresAt, admin }),
      setAdmin: (admin) => set({ admin }),
      clearSession: () => set({ accessToken: null, expiresAt: null, admin: null })
    }),
    { name: 'portfolio-admin-auth' }
  )
);
