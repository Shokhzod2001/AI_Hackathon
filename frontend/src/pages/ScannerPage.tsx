import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useScanStore } from '@/store/scanStore'
import { useNotifStore } from '@/store/notifStore'
import { RiskCircle } from '@/components/scanner/RiskCircle'
import { LoadingOverlay } from '@/components/ui/LoadingOverlay'
import { Modal } from '@/components/ui/Modal'
import { keywordsApi } from '@/api/keywords'
import { PLATFORM_ICONS } from '@/lib/formatters'
import { useT } from '@/lib/i18n'
import type { Keyword } from '@/types'

const EXAMPLES = [
  "Tur bor yaxshi sifatli, narxi arzon, etkazib beraman. Kanal: @shop_uz. Do'stlarga reklama qiling.",
  "Gul sotiladi, yangi hosildan, tabiyiy, har kuni yangi. Oltin sifatli mahsulot. DM yozing.",
  "Yangi tovar keldi! Sifatli, test qilib ko'rishingiz mumkin. Закладка usulida etkazib beramiz.",
  "Geroin va kokain arzon narxda. Toshkent bo'yicha etkazib beramiz. Telegram: @dark_shop",
]

export function ScannerPage() {
  const [text, setText] = useState('')
  const [platform, setPlatform] = useState('telegram')
  const [url, setUrl] = useState('')
  const [reportModal, setReportModal] = useState(false)
  const [agency, setAgency] = useState('ICHKI ISHLAR VAZIRLIGI')
  const [priority, setPriority] = useState('critical')
  const [note, setNote] = useState('')
  const { currentResult, isLoading, step, runScan, clearScan, blockAction, reportAction } = useScanStore()
  const { showToast } = useNotifStore()
  const t = useT()
  const { data: allKeywords } = useQuery({ queryKey: ['keywords'], queryFn: () => keywordsApi.list() })

  const STEPS = [t('scanner.step1'), t('scanner.step2'), t('scanner.step3')]

  const handleScan = async () => {
    if (!text.trim()) { showToast(t('scanner.enter_text'), 'warning'); return }
    await runScan(text, platform, url || undefined)
  }

  const handleBlock = async () => {
    await blockAction()
    showToast(t('scanner.block_req'), 'error')
  }

  const handleReport = async () => {
    await reportAction(agency, priority, note)
    setReportModal(false)
    showToast('📨 ' + agency, 'success')
  }

  const handleCopy = () => {
    if (!currentResult) return
    navigator.clipboard?.writeText(`Risk: ${currentResult.score}/100 | ${currentResult.verdict} | ${currentResult.platform}`)
    showToast(t('scanner.copied'), 'success')
  }

  return (
    <div>
      <LoadingOverlay show={isLoading} text={t('scanner.loading')} />

      <div className="anim-fade-in" style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('scanner.title')}</h1>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{t('scanner.subtitle')}</p>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
        {STEPS.map((s, i) => {
          const n = i + 1
          const done = n < step
          const active = n === step
          return (
            <div key={i} style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: done ? 'rgba(16,185,129,.07)' : active ? 'rgba(59,130,246,.1)' : 'var(--bg3)',
              border: `1px solid ${done ? 'var(--ok)' : active ? 'var(--accent)' : 'var(--border)'}`,
              fontSize: 12, color: done ? 'var(--ok)' : active ? 'var(--accent)' : 'var(--muted)',
              borderRadius: i === 0 ? 'var(--radius-sm) 0 0 var(--radius-sm)' : i === 2 ? '0 var(--radius-sm) var(--radius-sm) 0' : 0,
              transition: 'all .2s',
            }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: done ? 'var(--ok)' : active ? 'var(--accent)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: (done || active) ? '#fff' : 'var(--muted)', flexShrink: 0 }}>
                {done ? '✓' : n}
              </span>
              {s}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
        <div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16, boxShadow: '0 4px 20px var(--shadow-card)' }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('scanner.placeholder')}
              style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: 14, borderRadius: 'var(--radius-sm)', fontSize: 13, fontFamily: 'var(--font)', resize: 'vertical', minHeight: 120, outline: 'none', lineHeight: 1.6, transition: 'border-color .2s' }}
              onFocus={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'rgba(59,130,246,.5)' }}
              onBlur={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--border)' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 7, fontSize: 12, outline: 'none' }}>
                {Object.entries(PLATFORM_ICONS).map(([v, icon]) => (
                  <option key={v} value={v}>{icon} {v.charAt(0).toUpperCase() + v.slice(1)}</option>
                ))}
              </select>
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={t('scanner.url_ph')} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 7, fontSize: 12, outline: 'none', maxWidth: 180 }} />
              <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>{text.length} {t('scanner.chars')}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={handleScan} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#2563eb,#06b6d4)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 16px rgba(37,99,235,.35)', transition: 'all .2s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 28px rgba(6,182,212,.6)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(37,99,235,.35)' }}
              >{t('scanner.analyze')}</button>
              <button onClick={() => setText(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)])} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)', fontSize: 12, cursor: 'pointer', transition: 'all .15s' }}>{t('scanner.sample')}</button>
              <button onClick={() => { clearScan(); setText(''); setUrl('') }} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)', fontSize: 12, cursor: 'pointer', transition: 'all .15s' }}>✕</button>
            </div>
          </div>

          {currentResult && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, animation: 'fadeIn .3s ease', boxShadow: '0 4px 20px var(--shadow-card)' }}>
              <div className="panel-accent-line" style={{ margin: '-20px -20px 16px' }} />
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 16 }}>
                <RiskCircle score={currentResult.score} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>{t('scanner.ai_conclusion')}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)' }}>
                    <strong style={{ color: currentResult.score >= 70 ? 'var(--danger)' : currentResult.score >= 40 ? 'var(--warn)' : 'var(--ok)' }}>
                      {currentResult.verdict}
                    </strong>{' — '}
                    {currentResult.ai_explanation ?? `Risk ball: ${currentResult.score}/100.`}
                  </div>
                </div>
              </div>

              {currentResult.keywords_found.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>{t('scanner.keywords_found')}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {currentResult.keywords_found.map((k) => (
                      <span key={k} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(239,68,68,.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,.25)' }}>{k}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 16 }}>
                {[[t('scanner.col_platform'), currentResult.platform], [t('scanner.col_category'), currentResult.category ?? '-'], [t('scanner.col_lang'), currentResult.language ?? '-'], [t('scanner.col_threat'), currentResult.threat_type ?? '-']].map(([label, val]) => (
                  <div key={label} style={{ background: 'var(--bg2)', borderRadius: 'var(--radius-sm)', padding: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '.5px' }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{val}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <button onClick={handleBlock} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'var(--danger)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>{t('scanner.block_req')}</button>
                <button onClick={() => setReportModal(true)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{t('scanner.report')}</button>
                <button onClick={() => showToast(t('scanner.archived'), 'success')} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{t('scanner.archive')}</button>
                <button onClick={handleCopy} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{t('scanner.copy')}</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: '0 4px 20px var(--shadow-card)' }}>
            <div className="panel-accent-line" />
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t('scanner.slang')}</div>
            <div style={{ padding: 18 }}>
              {([
                [t('scanner.high_risk'), 'high', '#fca5a5', 'rgba(239,68,68,.15)'],
                [t('scanner.mid_risk'), 'mid', '#fcd34d', 'rgba(245,158,11,.15)'],
                [t('scanner.low_risk'), 'low', '#6ee7b7', 'rgba(16,185,129,.1)'],
              ] as [string, string, string, string][]).map(([label, level, color, bg]) => {
                const words = (allKeywords ?? []).filter((k: Keyword) => k.risk_level === level)
                return (
                  <div key={level} style={{ marginBottom: 12 }}>
                    <div style={{ color, fontWeight: 600, marginBottom: 6, fontSize: 11 }}>{label}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {words.length === 0 && (
                        <span style={{ fontSize: 10, color: 'var(--text2)' }}>—</span>
                      )}
                      {words.map((k: Keyword) => (
                        <span key={k.id} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: bg, color }}>{k.word}</span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={reportModal} onClose={() => setReportModal(false)} title={t('scanner.modal_title')} subtitle={t('scanner.modal_sub')}>
        {[
          [t('scanner.agency'), <select key="a" value={agency} onChange={(e) => setAgency(e.target.value)} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 12px', borderRadius: 7, fontSize: 13, outline: 'none' }}>
            {['ICHKI ISHLAR VAZIRLIGI','NARKOTIKLAR NAZORAT AGENTLIGI','PROKURATURA','DAVLAT XAVFSIZLIK XIZMATI'].map((a) => <option key={a}>{a}</option>)}
          </select>],
          [t('scanner.priority'), <select key="p" value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 12px', borderRadius: 7, fontSize: 13, outline: 'none' }}>
            <option value="critical">{t('scanner.critical')}</option>
            <option value="high">{t('scanner.high_priority')}</option>
            <option value="normal">{t('scanner.normal')}</option>
          </select>],
          [t('scanner.note'), <textarea key="n" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('scanner.note_ph')} style={{ width: '100%', height: 70, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 7, fontSize: 12, outline: 'none', resize: 'none', fontFamily: 'var(--font)' }} />],
        ].map(([label, field]) => (
          <div key={label as string} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>{label as string}</div>
            {field}
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
          <button onClick={() => setReportModal(false)} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)', fontSize: 12, cursor: 'pointer' }}>{t('scanner.cancel')}</button>
          <button onClick={handleReport} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: 'var(--danger)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{t('scanner.send')}</button>
        </div>
      </Modal>
    </div>
  )
}
