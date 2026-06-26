export interface User {
  id: string
  username: string
  email: string
  role: 'operator' | 'analyst' | 'admin' | 'manager'
  is_active: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export type Platform = 'telegram' | 'instagram' | 'olx' | 'darkweb' | 'other'
export type Verdict = 'XAVFSIZ' | 'SHUBHALI' | 'XAVFLI' | 'KRITIK'
export type ScanStatus = 'pending' | 'blocked' | 'reported' | 'archived'

export interface Scan {
  id: string
  platform: Platform
  source_url: string | null
  content_text: string
  risk_score: number
  verdict: Verdict
  category: string | null
  language: string | null
  threat_type: string | null
  keywords_found: string[] | null
  ai_explanation: string | null
  status: ScanStatus
  created_at: string
}

export interface ScanListResponse {
  items: Scan[]
  total: number
  page: number
  per_page: number
}

export interface DashboardStats {
  total_detected: number
  total_pending: number
  total_blocked: number
  total_reported: number
}

export interface WeeklyStats {
  labels: string[]
  detected: number[]
  blocked: number[]
}

export interface PlatformStats {
  labels: string[]
  values: number[]
}

export interface TopKeyword {
  word: string
  count: number
}

export interface MonthlyStats {
  labels: string[]
  values: number[]
}

export interface Keyword {
  id: number
  word: string
  risk_level: 'high' | 'mid' | 'low'
  language: string | null
  is_active: boolean
  created_at: string
}

export type ActionType = 'block_request' | 'report' | 'archive' | 'review'

export interface Action {
  id: string
  scan_id: string
  action_type: ActionType
  agency: string | null
  priority: string | null
  note: string | null
  status: string
  created_at: string
}

export interface Report {
  id: string
  title: string
  period_from: string
  period_to: string
  platform: string | null
  format: string
  stats: Record<string, number> | null
  created_at: string
}

export interface FeedItem {
  icon: string
  title: string
  meta: string
  time: string
}

export type ToastType = 'success' | 'warning' | 'error'
