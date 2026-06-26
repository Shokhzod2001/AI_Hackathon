import { apiClient } from './client'
import type { Report } from '@/types'

export const reportsApi = {
  generate: (data: {
    period_from?: string; period_to?: string
    platform?: string; format: string; email?: string
  }) => apiClient.post<Report>('/reports/generate', data).then((r) => r.data),

  list: () => apiClient.get<Report[]>('/reports').then((r) => r.data),
  get: (id: string) => apiClient.get<Report>(`/reports/${id}`).then((r) => r.data),
}
