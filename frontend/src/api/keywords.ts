import { apiClient } from './client'
import type { Keyword } from '@/types'

export const keywordsApi = {
  list: (risk_level?: string) =>
    apiClient.get<Keyword[]>('/keywords', { params: risk_level ? { risk_level } : {} }).then((r) => r.data),

  create: (data: { word: string; risk_level: string; language?: string }) =>
    apiClient.post<Keyword>('/keywords', data).then((r) => r.data),

  update: (id: number, data: Partial<{ word: string; risk_level: string; is_active: boolean }>) =>
    apiClient.patch<Keyword>(`/keywords/${id}`, data).then((r) => r.data),

  delete: (id: string | number) => apiClient.delete(`/keywords/${id}`),

  bulk: (keywords: Array<{ word: string; risk_level: string }>) =>
    apiClient.post<Keyword[]>('/keywords/bulk', { keywords }).then((r) => r.data),
}
