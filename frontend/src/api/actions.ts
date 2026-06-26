import { apiClient } from './client'
import type { Action } from '@/types'

export const actionsApi = {
  create: (data: { scan_id: string; action_type: string; agency?: string; priority?: string; note?: string }) =>
    apiClient.post<Action>('/actions', data).then((r) => r.data),

  list: (params?: { scan_id?: string; page?: number }) =>
    apiClient.get<Action[]>('/actions', { params }).then((r) => r.data),

  updateStatus: (id: string, status: string) =>
    apiClient.patch<Action>(`/actions/${id}`, { status }).then((r) => r.data),
}
