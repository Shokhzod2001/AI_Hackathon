import { apiClient } from './client'

export const mapApi = {
  incidents: () => apiClient.get('/map/incidents').then((r) => r.data),
  liveFeed: () => apiClient.get('/dashboard/live-feed').then((r) => r.data),
}
