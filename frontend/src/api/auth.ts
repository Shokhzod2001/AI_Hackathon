import { apiClient } from './client'
import type { TokenResponse, User } from '@/types'

export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post<TokenResponse>('/auth/login', { username, password }).then((r) => r.data),
  me: () => apiClient.get<User>('/auth/me').then((r) => r.data),
  refresh: (refresh_token: string) =>
    apiClient.post<TokenResponse>('/auth/refresh', { refresh_token }).then((r) => r.data),
}

export const adminApi = {
  getUsers: () => apiClient.get<User[]>('/admin/users').then((r) => r.data),
  createUser: (data: { username: string; email: string; password: string; role: string }) =>
    apiClient.post<User>('/admin/users', data).then((r) => r.data),
  updateUser: (id: string, data: Partial<User>) =>
    apiClient.patch<User>(`/admin/users/${id}`, data).then((r) => r.data),
  getAuditLogs: () => apiClient.get('/admin/audit-logs').then((r) => r.data),
}
