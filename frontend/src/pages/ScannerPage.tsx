import { useState, useRef } from 'react'
import { useScanStore } from '@/store/scanStore'
import { useNotifStore } from '@/store/notifStore'
import { RiskCircle } from '@/components/scanner/RiskCircle'
import { LoadingOverlay } from '@/components/ui/LoadingOverlay'
import { Modal } from '@/components/ui/Modal'
import { DEFAULT_KEYWORDS } from '@/lib/riskCalc'
import { PLATFORM_ICONS } from '@/lib/formatters'

const EXAMPLES = [
  "Tur bor yaxshi sifatli, narxi arzon, etkazib beraman. Kanal: @shop_uz. Do'stlarga reklama qiling.",
  "Gul sotiladi, yangi hosildan, tabiyiy, har kuni yangi. Oltin sifatli mahsulot. DM yozing.",
  "Yangi tovar keldi! Sifatli, test qilib ko'rishingiz mumkin. Закладка usulida etkazib beramiz.",
  "Geroin va kokain arzon narxda. Toshkent bo'yicha etkazib beramiz. Telegram: @dark_shop",
]

const STEPS = ['Matn kiriting', 'AI tahlil', 'Natija & Amal']

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

  const handleScan = async () => {
    if (!text.trim()) { showToast("Matn kiriting!", 'warning'); return }
    await runScan(text, platform, url || undefined)
  }

  const handleBlock = async () => {
    await blockAction()
    showToast('🚫 UZINFOCOM ga bloklash so\'rovi yuborildi', 'error')
  }

  const handleReport = async () => {
    await reportAction(agency, priority, note)
    setReportModal(false)
    showToast('📨 Yuborildi: ' + agency, 'success')
  }

  const handleCopy = () => {
    if (!currentResult) return
    navigator.clipboard?.writeText(`Risk: ${currentResult.score}/100 | ${currentResult.verdict} | ${currentResult.platform}`)
    showToast('📋 Nusxa olindi', 'success')
  }

  return (
    <div>
      <LoadingOverlay show={isLoading} text="Claude AI tahlil qilinmoqda..." />

      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>AI Skaner</h1>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Matn yoki postni Claude AI yordamida tahlil qilish</p>
      </div>

      <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
        {STEPS.map((s, i) => {
          const n = i + 1
          const done = n < step
          const active = n === step
          return (
            <div key={i} style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px',
              background: done ? 'rgba(16,185,129,.07)' : active ? 'rgba(59,130,246,.1)' : 'var(--bg3)',
              border: `1px solid ${done ? 'var(--ok)' : active ? 'var(--accent)' : 'var(--border)'}`,
              fontSize: 12,
              color: done ? 'var(--ok)' : active ? 'var(--accent)' : 'var(--muted)',
              borderRadius: i === 0 ? 'var(--radius-sm) 0 0 var(--radius-sm)' : i === 2 ? '0 var(--radius-sm) var(--radius-sm) 0' : 0,
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
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16 }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Tekshirmoqchi bo'lgan matnni bu yerga kiriting...\n\nMasalan: \"Yaxshi mahsulot bor, narxi arzon, sifatli tur etkazib beraman\""}
              style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: 14, borderRadius: 'var(--radius-sm)', fontSize: 13, fontFamily: 'var(--font)', resize: 'vertical', minHeight: 120, outline: 'none', lineHeight: 1.6 }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 7, fontSize: 12, outline: 'none' }}>
                {Object.entries(PLATFORM_ICONS).map(([v, icon]) => (
                  <option key={v} value={v}>{icon} {v.charAt(0).toUpperCase() + v.slice(1)}</option>
                ))}
              </select>
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (ixtiyoriy)" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 7, fontSize: 12, outline: 'none', maxWidth: 180 }} />
              <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>{text.length} belgi</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={handleScan} style={{ flex: 1, padding: '10px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                🔍 AI tahlil qilish
              </button>
              <button onClick={() => setText(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)])} style={{ padding: '10px 16px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12, cursor: 'pointer' }}>Namuna</button>
              <button onClick={() => { clearScan(); setText(''); setUrl('') }} style={{ padding: '10px 16px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12, cursor: 'pointer' }}>✕</button>
            </div>
          </div>

          {currentResult && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, animation: 'fadeIn .3s ease' }}>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 16 }}>
                <RiskCircle score={currentResult.score} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>AI xulosasi</div>
                  <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                    <strong style={{ color: currentResult.score >= 70 ? 'var(--danger)' : currentResult.score >= 40 ? 'var(--warn)' : 'var(--ok)' }}>
                      {currentResult.verdict}
                    </strong>
                    {' — '}
                    {currentResult.ai_explanation ?? `Matn tahlil qilindi. Risk ball: ${currentResult.score}/100. ${currentResult.keywords_found.length} ta kalit so'z topildi.`}
                  </div>
                </div>
              </div>

              {currentResult.keywords_found.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>Aniqlangan kalit so'zlar</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {currentResult.keywords_found.map((k) => (
                      <span key={k} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(239,68,68,.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,.25)' }}>{k}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 16 }}>
                {[['Platforma', currentResult.platform], ['Kategoriya', currentResult.category ?? 'Tekshiruv'], ['Til', currentResult.language ?? 'Aralash'], ['Tahdid turi', currentResult.threat_type ?? 'Aniqlanmadi']].map(([label, val]) => (
                  <div key={label} style={{ background: 'var(--bg2)', borderRadius: 'var(--radius-sm)', padding: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '.5px' }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{val}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <button onClick={handleBlock} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: 'var(--danger)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>🚫 Bloklash so'rovi</button>
                <button onClick={() => setReportModal(true)} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>📨 Idoraga yuborish</button>
                <button onClick={() => showToast('💾 Arxivga saqlandi', 'success')} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>💾 Arxivlash</button>
                <button onClick={handleCopy} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>📋 Nusxa</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 600 }}>Sleng lug'ati</div>
            <div style={{ padding: 18 }}>
              {[['🔴 Yuqori xavf', DEFAULT_KEYWORDS.high, '#fca5a5', 'rgba(239,68,68,.15)'], ['🟡 O\'rta xavf', DEFAULT_KEYWORDS.mid, '#fcd34d', 'rgba(245,158,11,.15)'], ['🟢 Past xavf', DEFAULT_KEYWORDS.low, '#6ee7b7', 'rgba(16,185,129,.1)']].map(([label, words, color, bg]) => (
                <div key={label as string} style={{ marginBottom: 12 }}>
                  <div style={{ color: color as string, fontWeight: 600, marginBottom: 6, fontSize: 11 }}>{label as string}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(words as string[]).map((w) => (
                      <span key={w} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: bg as string, color: color as string }}>{w}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={reportModal} onClose={() => setReportModal(false)} title="📨 Idoraga yuborish" subtitle="Aniqlangan hodisani tegishli idoraga yo'naltirishingiz mumkin">
        {[['Idora nomi', <select key="a" value={agency} onChange={(e) => setAgency(e.target.value)} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 12px', borderRadius: 7, fontSize: 13, outline: 'none' }}>
          {['ICHKI ISHLAR VAZIRLIGI','NARKOTIKLAR NAZORAT AGENTLIGI','PROKURATURA','DAVLAT XAVFSIZLIK XIZMATI'].map((a) => <option key={a}>{a}</option>)}
        </select>],
        ['Muhimlik darajasi', <select key="p" value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 12px', borderRadius: 7, fontSize: 13, outline: 'none' }}>
          <option value="critical">🔴 KRITIK — darhol amal talab qiladi</option>
          <option value="high">🟡 YUQORI — 24 soat ichida</option>
          <option value="normal">🟢 ODDIY — umumiy hisobot</option>
        </select>],
        ['Izoh (ixtiyoriy)', <textarea key="n" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Qo'shimcha ma'lumot..." style={{ width: '100%', height: 70, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 7, fontSize: 12, outline: 'none', resize: 'none', fontFamily: 'var(--font)' }} />]].map(([label, field]) => (
          <div key={label as string} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>{label as string}</div>
            {field}
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
          <button onClick={() => setReportModal(false)} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12, cursor: 'pointer' }}>Bekor qilish</button>
          <button onClick={handleReport} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: 'var(--danger)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>📤 Yuborish</button>
        </div>
      </Modal>
    </div>
  )
}
