import type { Verdict } from '@/types'

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' })
}

export function formatRisk(score: number): Verdict {
  if (score >= 85) return 'KRITIK'
  if (score >= 70) return 'XAVFLI'
  if (score >= 40) return 'SHUBHALI'
  return 'XAVFSIZ'
}

export function getRiskClass(score: number): string {
  if (score >= 70) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

export function truncateText(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text
}

export const PLATFORM_ICONS: Record<string, string> = {
  telegram: '📱',
  instagram: '📸',
  olx: '🛒',
  darkweb: '🌐',
  other: '📄',
}

export const PLATFORM_LABELS: Record<string, string> = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  olx: 'OLX',
  darkweb: 'Darkweb',
  other: 'Boshqa',
}
