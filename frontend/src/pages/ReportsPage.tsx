import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsApi } from '@/api/reports'
import { scansApi } from '@/api/scans'
import { MonthlyLineChart } from '@/components/charts/MonthlyLineChart'
import { useNotifStore } from '@/store/notifStore'
import { formatDate } from '@/lib/formatters'
import { useT } from '@/lib/i18n'

export function ReportsPage() {
  const [format, setFormat] = useState<'pdf' | 'xlsx' | 'csv'>('pdf')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const { showToast } = useNotifStore()
  const qc = useQueryClient()
  const t = useT()

  const { data: reports, isLoading } = useQuery({ queryKey: ['reports'], queryFn: reportsApi.list })
  const { data: monthly } = useQuery({ queryKey: ['stats-monthly'], queryFn: scansApi.stats.monthly })

  const generateMutation = useMutation({
    mutationFn: () => reportsApi.generate({ format, period_from: from || undefined, period_to: to || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); showToast('📊 ' + t('reports.creating'), 'success'); setFrom(''); setTo('') },
  })

  const formatIcon: Record<string, string> = { pdf: '📄', xlsx: '📊', csv: '📋' }

  return (
    <div>
      <div className="anim-fade-in" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('reports.title')}</h1>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{t('reports.subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
        <div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16, boxShadow: '0 4px 20px var(--shadow-card)' }}>
            <div className="panel-accent-line" style={{ margin: '-20px -20px 16px' }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>{t('reports.monthly')}</div>
            {monthly && <MonthlyLineChart data={monthly} />}
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: '0 4px 20px var(--shadow-card)' }}>
            <div className="panel-accent-line" />
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t('reports.saved')}</div>
            {isLoading ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>{t('reports.loading')}</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {[t('reports.col_format'), t('reports.col_period'), t('reports.col_created'), t('reports.col_status'), t('reports.col_download')].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--muted)', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(reports ?? []).map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--subtle-border-lt)', transition: 'background .15s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(59,130,246,.04)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                    >
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'rgba(59,130,246,.15)', color: 'var(--accent)', border: '1px solid rgba(59,130,246,.25)' }}>{formatIcon[r.format]} {r.format.toUpperCase()}</span>
                      </td>
                      <td style={{ padding: '11px 14px', color: 'var(--text2)' }}>
                        {r.period_from ? `${formatDate(r.period_from)} — ${formatDate(r.period_to ?? '')}` : t('reports.all_time')}
                      </td>
                      <td style={{ padding: '11px 14px', color: 'var(--muted)' }}>{formatDate(r.created_at)}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: 'rgba(16,185,129,.1)', color: 'var(--ok)', border: '1px solid rgba(16,185,129,.2)' }}>{t('reports.ready')}</span>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <button onClick={() => showToast(`⬇ ${r.format.toUpperCase()}...`, 'success')} style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--accent)', fontSize: 11, cursor: 'pointer', fontWeight: 600, transition: 'all .15s' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,.08)' }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                        >{t('reports.download')}</button>
                      </td>
                    </tr>
                  ))}
                  {(reports ?? []).length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: 12 }}>{t('reports.no_reports')}</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, boxShadow: '0 4px 20px var(--shadow-card)' }}>
          <div className="panel-accent-line" style={{ margin: '-20px -20px 16px' }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>{t('reports.new')}</div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>{t('reports.choose_format')}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['pdf', 'xlsx', 'csv'] as const).map((f) => (
                <button key={f} onClick={() => setFormat(f)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${format === f ? 'var(--accent)' : 'var(--border)'}`, background: format === f ? 'rgba(59,130,246,.12)' : 'var(--bg3)', color: format === f ? 'var(--accent)' : 'var(--text2)', fontSize: 12, cursor: 'pointer', fontWeight: 700, transition: 'all .15s' }}>
                  {formatIcon[f]} {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {[[t('reports.from'), from, setFrom], [t('reports.to'), to, setTo]].map(([label, val, setter]) => (
            <div key={label as string} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>{label as string} ({t('reports.optional')})</div>
              <input type="date" value={val as string} onChange={(e) => (setter as (v: string) => void)(e.target.value)} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 7, fontSize: 12, outline: 'none', transition: 'border-color .2s' }}
                onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(59,130,246,.5)' }}
                onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--border)' }}
              />
            </div>
          ))}

          <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} style={{ width: '100%', padding: 10, borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: generateMutation.isPending ? 'not-allowed' : 'pointer', opacity: generateMutation.isPending ? .7 : 1, marginTop: 4, boxShadow: '0 0 16px rgba(37,99,235,.35)', transition: 'all .2s' }}>
            {generateMutation.isPending ? t('reports.creating') : t('reports.create')}
          </button>

          <div style={{ marginTop: 18, padding: 12, background: 'var(--bg2)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--muted)', lineHeight: 1.7, border: '1px solid var(--border)' }}>
            {t('reports.info')}
          </div>
        </div>
      </div>
    </div>
  )
}
