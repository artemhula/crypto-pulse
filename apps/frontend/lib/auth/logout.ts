import { apiFetch } from '@/lib/api';

export function logout() {
  return apiFetch<void>('/auth/logout');
}