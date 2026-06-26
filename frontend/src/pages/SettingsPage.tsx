import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { keywordsApi } from '@/api/keywords'
import { useSettingsStore } from '@/store/settingsStore'
import { useNotifStore } from '@/store/notifStore'
import { Toggle } from '@/components/ui/Toggle'
import { Badge } from '@/components/ui/Badge'
import type { Keyword } from '@/types'

export function SettingsPage() {
  const [newWord, setNewWord] = useState('')
  const [newLevel, setNewLevel] = useState<'high' | 'mid' | 'low'>('high')
  const { settings, toggle } = useSettingsStore()
  const { showToast } = useNotifStore()
  const qc = useQueryClient()

  const { data: keywords } = useQuery({ queryKey: ['keywords'], queryFn: () => keywordsApi.list() })

  const addMutation = useMutation({
    mutationFn: () => keywordsApi.create({ word: newWord, risk_level: newLevel }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['keywords'] }); setNewWord(''); showToast('✅ Kalit so\'z qo\'shildi', 'success') },
    onError: () => showToast('❌ Xato: kalit so\'z allaqachon mavjud', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => keywordsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['keywords'] }); showToast('🗑 O\'chirildi', 'success') },
  })

  const levelBadge = (l: string) => {
    const map: Record<string, 'red' | 'yellow' | 'green'> = { high: 'red', mid: 'yellow', low: 'green' }
    const labels: Record<string, string> = { high: '🔴 Yuqori', mid: '🟡 O\'rta', low: '🟢 Past' }
    return <Badge variant={map[l] ?? 'gray'}>{labels[l] ?? l}</Badge>
  }

  const TOGGLES = [
    { key: 'telegram_alerts', label: 'Telegram ogohlantirishlari', desc: 'Yuqori risk hodisalarida Telegram bot orqali xabar yuborish' },
    { key: 'auto_block', label: 'Avtomatik bloklash', desc: 'Risk ball 90 dan oshganda UZINFOCOM ga avtomatik so\'rov yuborish' },
    { key: 'ai_analysis', label: 'Claude AI tahlili', desc: 'Matnni Claude claude-sonnet-4-6 modeli orqali tahlil qilish' },
    { key: 'dark_web', label: 'Dark web monitoring', desc: 'Tor tarmog\'idagi manzillarni skanerlash' },
    { key: 'email_reports', label: 'Email hisobotlar', desc: 'Kunlik hisobotni email orqali yuborish' },
    { key: 'websocket', label: 'Real-vaqt lenta', desc: 'WebSocket orqali jonli ma\'lumotlar' },
  ] as const

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Sozlamalar</h1>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Tizim va integratsiya sozlamalari</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        <div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Tizim sozlamalari</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {TOGGLES.map((t) => (
                <div key={t.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(26,39,68,.3)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t.desc}</div>
                  </div>
                  <Toggle checked={settings[t.key]} onChange={() => { toggle(t.key); showToast(`${settings[t.key] ? '🔴 O\'chirildi' : '🟢 Yoqildi'}: ${t.label}`, 'success') }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>API kalitlari</div>
            {[['ANTHROPIC_API_KEY', 'Claude AI tahlili uchun'], ['TELEGRAM_BOT_TOKEN', 'Telegram xabarlar uchun'], ['UZINFOCOM_API_KEY', 'Bloklash so\'rovlari uchun']].map(([k, d]) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>{k}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 5 }}>{d}</div>
                <input
                  type="password"
                  defaultValue="sk-ant-api03-***"
                  style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 7, fontSize: 12, outline: 'none' }}
                />
              </div>
            ))}
            <button onClick={() => showToast('✅ API kalitlari saqlandi', 'success')} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 6 }}>
              Saqlash
            </button>
          </div>
        </div>

        <div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Kalit so'zlar bazasi</div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && newWord.trim() && addMutation.mutate()}
                placeholder="Yangi kalit so'z..."
                style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 7, fontSize: 12, outline: 'none' }}
              />
              <select value={newLevel} onChange={(e) => setNewLevel(e.target.value as typeof newLevel)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 10px', borderRadius: 7, fontSize: 12, outline: 'none' }}>
                <option value="high">🔴 Yuqori</option>
                <option value="mid">🟡 O'rta</option>
                <option value="low">🟢 Past</option>
              </select>
              <button
                onClick={() => newWord.trim() && addMutation.mutate()}
                disabled={!newWord.trim() || addMutation.isPending}
                style={{ padding: '8px 14px', borderRadius: 7, border: 'none', background: 'var(--ok)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >+</button>
            </div>

            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {(['high', 'mid', 'low'] as const).map((level) => {
                const filtered = (keywords ?? []).filter((k: Keyword) => k.risk_level === level)
                if (filtered.length === 0) return null
                return (
                  <div key={level} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {levelBadge(level)} <span>{filtered.length} ta so'z</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {filtered.map((k: Keyword) => (
                        <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px 3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: level === 'high' ? 'rgba(239,68,68,.15)' : level === 'mid' ? 'rgba(245,158,11,.15)' : 'rgba(16,185,129,.1)', color: level === 'high' ? '#fca5a5' : level === 'mid' ? '#fcd34d' : '#6ee7b7', border: `1px solid ${level === 'high' ? 'rgba(239,68,68,.3)' : level === 'mid' ? 'rgba(245,158,11,.3)' : 'rgba(16,185,129,.2)'}` }}>
                          {k.word}
                          <button onClick={() => deleteMutation.mutate(k.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 11, opacity: .6, color: 'inherit', lineHeight: 1 }}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
