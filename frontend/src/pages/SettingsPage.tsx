import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { keywordsApi } from '@/api/keywords'
import { useSettingsStore } from '@/store/settingsStore'
import { useNotifStore } from '@/store/notifStore'
import { Toggle } from '@/components/ui/Toggle'
import { Badge } from '@/components/ui/Badge'
import type { Keyword } from '@/types'
import { useT } from '@/lib/i18n'

export function SettingsPage() {
  const [newWord, setNewWord] = useState('')
  const [newLevel, setNewLevel] = useState<'high' | 'mid' | 'low'>('high')
  const { settings, toggle } = useSettingsStore()
  const { showToast } = useNotifStore()
  const qc = useQueryClient()
  const t = useT()

  const { data: keywords } = useQuery({ queryKey: ['keywords'], queryFn: () => keywordsApi.list() })

  const addMutation = useMutation({
    mutationFn: () => keywordsApi.create({ word: newWord, risk_level: newLevel }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['keywords'] }); setNewWord(''); showToast("✅ " + t('settings.new_kw'), 'success') },
    onError: () => showToast('❌ Error', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => keywordsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['keywords'] }); showToast('🗑 Deleted', 'success') },
  })

  const levelBadge = (l: string) => {
    const map: Record<string, 'red' | 'yellow' | 'green'> = { high: 'red', mid: 'yellow', low: 'green' }
    const labels: Record<string, string> = { high: t('settings.high'), mid: t('settings.mid'), low: t('settings.low') }
    return <Badge variant={map[l] ?? 'gray'}>{labels[l] ?? l}</Badge>
  }

  const TOGGLES = [
    { key: 'telegram_alerts', label: 'Telegram alerts', desc: 'Send Telegram bot alerts on high-risk incidents' },
    { key: 'auto_block', label: 'Auto-block', desc: 'Auto-send block request to UZINFOCOM when risk > 90' },
    { key: 'ai_analysis', label: 'Claude AI analysis', desc: 'Analyze text using Claude claude-sonnet-4-6 model' },
    { key: 'dark_web', label: 'Dark web monitoring', desc: 'Scan .onion addresses on Tor network' },
    { key: 'email_reports', label: 'Email reports', desc: 'Send daily report via email' },
    { key: 'websocket', label: 'Real-time feed', desc: 'Live data stream via WebSocket' },
  ] as const

  return (
    <div>
      <div className="anim-fade-in" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('settings.title')}</h1>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{t('settings.subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        <div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16, boxShadow: '0 4px 20px var(--shadow-card)' }}>
            <div className="panel-accent-line" style={{ margin: '-20px -20px 16px' }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>{t('settings.sys_settings')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {TOGGLES.map((item) => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--subtle-border-lt)', transition: 'background .15s' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, color: 'var(--text)' }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.desc}</div>
                  </div>
                  <Toggle checked={settings[item.key]} onChange={() => { toggle(item.key); showToast(`${settings[item.key] ? '🔴' : '🟢'} ${item.label}`, 'success') }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, boxShadow: '0 4px 20px var(--shadow-card)' }}>
            <div className="panel-accent-line" style={{ margin: '-20px -20px 16px' }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>{t('settings.api_keys')}</div>
            {[['ANTHROPIC_API_KEY', 'Claude AI analysis'], ['TELEGRAM_BOT_TOKEN', 'Telegram messages'], ['UZINFOCOM_API_KEY', 'Block requests']].map(([k, d]) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>{k}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 5 }}>{d}</div>
                <input type="password" defaultValue="sk-ant-api03-***" style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 7, fontSize: 12, outline: 'none', transition: 'border-color .2s' }}
                  onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(59,130,246,.5)' }}
                  onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--border)' }}
                />
              </div>
            ))}
            <button onClick={() => showToast('✅ ' + t('settings.save'), 'success')} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginTop: 6, boxShadow: '0 0 14px rgba(37,99,235,.3)', transition: 'all .2s' }}>
              {t('settings.save')}
            </button>
          </div>
        </div>

        <div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, boxShadow: '0 4px 20px var(--shadow-card)' }}>
            <div className="panel-accent-line" style={{ margin: '-20px -20px 16px' }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>{t('settings.kw_db')}</div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && newWord.trim() && addMutation.mutate()}
                placeholder={t('settings.new_kw')}
                style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 7, fontSize: 12, outline: 'none', transition: 'border-color .2s' }}
                onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(59,130,246,.5)' }}
                onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--border)' }}
              />
              <select value={newLevel} onChange={(e) => setNewLevel(e.target.value as typeof newLevel)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 10px', borderRadius: 7, fontSize: 12, outline: 'none' }}>
                <option value="high">{t('settings.high')}</option>
                <option value="mid">{t('settings.mid')}</option>
                <option value="low">{t('settings.low')}</option>
              </select>
              <button onClick={() => newWord.trim() && addMutation.mutate()} disabled={!newWord.trim() || addMutation.isPending} style={{ padding: '8px 14px', borderRadius: 7, border: 'none', background: 'var(--ok)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 10px rgba(16,185,129,.3)' }}>+</button>
            </div>

            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {(['high', 'mid', 'low'] as const).map((level) => {
                const filtered = (keywords ?? []).filter((k: Keyword) => k.risk_level === level)
                if (filtered.length === 0) return null
                return (
                  <div key={level} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {levelBadge(level)} <span>{filtered.length} {t('settings.words')}</span>
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
