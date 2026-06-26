import { create } from 'zustand'
import { scansApi } from '@/api/scans'
import { actionsApi } from '@/api/actions'
import { detectKeywords, calcRiskScore, DEFAULT_KEYWORDS, scoreToVerdict } from '@/lib/riskCalc'
import type { Scan, Verdict } from '@/types'

export interface ScanResult {
  id?: string
  score: number
  verdict: Verdict
  platform: string
  keywords_found: string[]
  ai_explanation: string | null
  category: string | null
  language: string | null
  threat_type: string | null
  content_text: string
}

interface HistoryItem {
  score: number
  text: string
  time: string
  platform: string
}

interface ScanState {
  currentResult: ScanResult | null
  history: HistoryItem[]
  isLoading: boolean
  step: 1 | 2 | 3
  runScan: (text: string, platform: string, url?: string) => Promise<void>
  clearScan: () => void
  setStep: (n: 1 | 2 | 3) => void
  blockAction: () => Promise<void>
  reportAction: (agency: string, priority: string, note: string) => Promise<void>
}

export const useScanStore = create<ScanState>((set, get) => ({
  currentResult: null,
  history: [],
  isLoading: false,
  step: 1,

  runScan: async (text, platform, url) => {
    set({ isLoading: true, step: 2 })
    try {
      const scan: Scan = await scansApi.create({ content_text: text, platform, source_url: url })
      const result: ScanResult = {
        id: scan.id,
        score: scan.risk_score,
        verdict: scan.verdict as Verdict,
        platform: scan.platform,
        keywords_found: scan.keywords_found ?? [],
        ai_explanation: scan.ai_explanation,
        category: scan.category,
        language: scan.language,
        threat_type: scan.threat_type,
        content_text: text,
      }
      set((s) => ({
        currentResult: result,
        step: 3,
        history: [
          { score: scan.risk_score, text: text.slice(0, 50), time: new Date().toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' }), platform },
          ...s.history.slice(0, 9),
        ],
      }))
    } catch {
      // Fallback to local analysis
      const found = detectKeywords(text, DEFAULT_KEYWORDS)
      const score = calcRiskScore(found, text)
      const verdict = scoreToVerdict(score)
      const allFound = [...found.high, ...found.mid, ...found.low]
      set((s) => ({
        currentResult: { score, verdict, platform, keywords_found: allFound, ai_explanation: null, category: null, language: null, threat_type: null, content_text: text },
        step: 3,
        history: [
          { score, text: text.slice(0, 50), time: new Date().toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' }), platform },
          ...s.history.slice(0, 9),
        ],
      }))
    } finally {
      set({ isLoading: false })
    }
  },

  clearScan: () => set({ currentResult: null, step: 1 }),
  setStep: (n) => set({ step: n }),

  blockAction: async () => {
    const r = get().currentResult
    if (!r?.id) return
    await actionsApi.create({ scan_id: r.id, action_type: 'block_request', priority: 'critical' })
  },

  reportAction: async (agency, priority, note) => {
    const r = get().currentResult
    if (!r?.id) return
    await actionsApi.create({ scan_id: r.id, action_type: 'report', agency, priority, note })
  },
}))
