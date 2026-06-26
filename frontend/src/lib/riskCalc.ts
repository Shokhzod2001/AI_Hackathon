import type { Keyword, Verdict } from '@/types'

export const DEFAULT_KEYWORDS: Record<string, string[]> = {
  high: ['giyohvand','narkotik','geroin','kokain','amfetamin','metamfetamin','marijuana','ganja','tur','zakladka','klad','закладка','марихуана','героин'],
  mid: ['gul','un','qand','tort','ovqat','mahsulot','tovar','etkazib','reklama','test','sifatli','shart'],
  low: ["do'st",'yaxshi','narx','arzon','chegirma','sotish','xarid'],
}

export function detectKeywords(
  text: string,
  keywords: Record<string, string[]> = DEFAULT_KEYWORDS
): Record<string, string[]> {
  const t = text.toLowerCase()
  const found: Record<string, string[]> = { high: [], mid: [], low: [] }
  for (const [level, words] of Object.entries(keywords)) {
    for (const w of words) {
      if (t.includes(w.toLowerCase())) found[level].push(w)
    }
  }
  return found
}

export function calcRiskScore(found: Record<string, string[]>, text: string): number {
  let score = 0
  score += (found.high?.length ?? 0) * 25
  score += (found.mid?.length ?? 0) * 12
  score += (found.low?.length ?? 0) * 4
  if (text.includes('@')) score += 10
  if (/закладка|zakladka|klad/i.test(text)) score += 30
  if (/bot|kanal|guruh/i.test(text)) score += 8
  return Math.min(score, 100)
}

export function scoreToVerdict(score: number): Verdict {
  if (score >= 85) return 'KRITIK'
  if (score >= 70) return 'XAVFLI'
  if (score >= 40) return 'SHUBHALI'
  return 'XAVFSIZ'
}

export function getRiskColor(score: number): string {
  if (score >= 70) return 'var(--danger)'
  if (score >= 40) return 'var(--warn)'
  return 'var(--ok)'
}

export function keywordsToMap(keywords: Keyword[]): Record<string, string[]> {
  const map: Record<string, string[]> = { high: [], mid: [], low: [] }
  for (const kw of keywords) {
    if (kw.is_active && map[kw.risk_level]) map[kw.risk_level].push(kw.word)
  }
  return map
}
