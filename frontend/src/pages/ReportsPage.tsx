import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsApi } from '@/api/reports'
import { scansApi } from '@/api/scans'
import { MonthlyLineChart } from '@/components/charts/MonthlyLineChart'
import { useNotifStore } from '@/store/notifStore'
import { formatDate } from '@/lib/formatters'

export function ReportsPage() {
  const [format, setFormat] = useState<'pdf' | 'xlsx' | 'csv'>('pdf')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const { showToast } = useNotifStore()
  const qc = useQueryClient()

  const { data: reports, isLoading } = useQuery({ queryKey: ['reports'], queryFn: reportsApi.list })
  const { data: monthly } = useQuery({ queryKey: ['stats-monthly'], queryFn: scansApi.stats.monthly })

  const generateMutation = useMutation({
    mutationFn: () => reportsApi.generate({ format, period_from: from || undefined, period_to: to || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] })
      showToast('📊 Hisobot yaratilmoqda...', 'success')
      setFrom(''); setTo('')
    },
  })

  const formatIcon: Record<string, string> = { pdf: '📄', xlsx: '📊', csv: '📋' }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Hisobotlar</h1>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Avtomatik va qo'lda yaratilgan hisobotlar</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
        <div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Oylik trend</div>
            {monthly && <MonthlyLineChart data={monthly} />}
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 600 }}>Saqlangan hisobotlar</div>
            {isLoading ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>Yuklanmoqda...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {['Format','Davr','Yaratilgan','Holat','Yuklab olish'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--muted)', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.6px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(reports ?? []).map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(26,39,68,.4)' }}>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'rgba(59,130,246,.15)', color: 'var(--accent)' }}>{formatIcon[r.format]} {r.format.toUpperCase()}</span>
                      </td>
                      <td style={{ padding: '11px 14px', color: 'var(--text2)' }}>
                        {r.period_from ? `${formatDate(r.period_from)} — ${formatDate(r.period_to ?? '')}` : 'Barcha vaqt'}
                      </td>
                      <td style={{ padding: '11px 14px', color: 'var(--muted)' }}>{formatDate(r.created_at)}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: 'rgba(16,185,129,.1)', color: 'var(--ok)' }}>Tayyor</span>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <button
                          onClick={() => showToast(`⬇ ${r.format.toUpperCase()} yuklab olinmoqda...`, 'success')}
                          style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--accent)', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                        >⬇ Yuklab olish</button>
                      </td>
                    </tr>
                  ))}
                  {(reports ?? []).length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: 12 }}>Hali hisobotlar yaratilmagan</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Yangi hisobot yaratish</div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>Format tanlang</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['pdf', 'xlsx', 'csv'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  style={{ flex: 1, padding: '8px', borderRadius: 7, border: `1px solid ${format === f ? 'var(--accent)' : 'var(--border)'}`, background: format === f ? 'rgba(59,130,246,.15)' : 'transparent', color: format === f ? 'var(--accent)' : 'var(--text2)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                >{formatIcon[f]} {f.toUpperCase()}</button>
              ))}
            </div>
          </div>

          {[['Dan', from, setFrom], ['Gacha', to, setTo]].map(([label, val, setter]) => (
            <div key={label as string} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>{label as string} (ixtiyoriy)</div>
              <input type="date" value={val as string} onChange={(e) => (setter as (v: string) => void)(e.target.value)} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 7, fontSize: 12, outline: 'none' }} />
            </div>
          ))}

          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            style={{ width: '100%', padding: 10, borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: generateMutation.isPending ? 'not-allowed' : 'pointer', opacity: generateMutation.isPending ? .7 : 1, marginTop: 4 }}
          >
            {generateMutation.isPending ? '⏳ Yaratilmoqda...' : '📊 Hisobot yaratish'}
          </button>

          <div style={{ marginTop: 18, padding: 14, background: 'var(--bg2)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--muted)', lineHeight: 1.7 }}>
            ℹ Hisobotlar so'nggi 30 kunlik ma'lumotlar asosida yaratiladi. Davr ko'rsatilmasa, barcha ma'lumotlar kiritiladi.
          </div>
        </div>
      </div>
    </div>
  )
}
