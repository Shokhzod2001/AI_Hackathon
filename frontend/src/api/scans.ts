import { apiClient } from './client'
import type {
  Scan, ScanListResponse, DashboardStats,
  WeeklyStats, PlatformStats, TopKeyword, MonthlyStats,
} from '@/types'

export const scansApi = {
  create: (data: { content_text: string; platform: string; source_url?: string }) =>
    apiClient.post<Scan>('/scans', data).then((r) => r.data),

  list: (params?: {
    platform?: string; status?: string; risk_min?: number; risk_max?: number
    search?: string; page?: number; per_page?: number
  }) => apiClient.get<ScanListResponse>('/scans', { params }).then((r) => r.data),

  get: (id: string) => apiClient.get<Scan>(`/scans/${id}`).then((r) => r.data),

  updateStatus: (id: string, status: string) =>
    apiClient.patch<Scan>(`/scans/${id}/status`, { status }).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/scans/${id}`),

  stats: {
    summary: () => apiClient.get<DashboardStats>('/scans/stats/summary').then((r) => r.data),
    weekly: () => apiClient.get<WeeklyStats>('/scans/stats/weekly').then((r) => r.data),
    byPlatform: () => apiClient.get<PlatformStats>('/scans/stats/by-platform').then((r) => r.data),
    topKeywords: () => apiClient.get<TopKeyword[]>('/scans/stats/top-keywords').then((r) => r.data),
    monthly: () => apiClient.get<MonthlyStats>('/scans/stats/monthly').then((r) => r.data),
  },
}
