import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scansApi } from '@/api/scans'
import { useDebounce } from '@/hooks/useDebounce'
import { useNotifStore } from '@/store/notifStore'
import { Badge } from '@/components/ui/Badge'
import { PLATFORM_ICONS, formatDate, truncateText } from '@/lib/formatters'
import { useT } from '@/lib/i18n'

export function AlertsPage() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 300)
  const { showToast } = useNotifStore()
  const qc = useQueryClient()
  const t = useT()

  const FILTERS = [
    { id: 'all',      label: t('alerts.all') },
    { id: 'high',     label: t('alerts.high'),     riskMin: 70 },
    { id: 'medium',   label: t('alerts.medium'),   riskMin: 40, riskMax: 69 },
    { id: 'low',      label: t('alerts.low'),      riskMax: 39 },
    { id: 'blocked',  label: t('alerts.blocked'),  status: 'blocked' },
    { id: 'reported', label: t('alerts.reported'), status: 'reported' },
  ]

  const activeFilter = FILTERS.find((f) => f.id === filter)

  const { data, isLoading } = useQuery({
    queryKey: ['scans', filter, debouncedSearch, page],
    queryFn: () => scansApi.list({
      status: (activeFilter as { status?: string })?.status,
      risk_min: (activeFilter as { riskMin?: number })?.riskMin,
      risk_max: (activeFilter as { riskMax?: number })?.riskMax,
      search: debouncedSearch || undefined,
      page, per_page: 20,
    }),
  })

  const blockMutation = useMutation({
    mutationFn: (id: string) => scansApi.updateStatus(id, 'blocked'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['scans'] }); showToast("🚫 " + t('status.blocked'), 'error') },
  })

  const reportMutation = useMutation({
    mutationFn: (id: string) => scansApi.updateStatus(id, 'reported'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['scans'] }); showToast("📨 " + t('status.reported'), 'success') },
  })

  const statusBadge = (s: string) => {
    const map: Record<string, 'red' | 'blue' | 'yellow'> = { blocked: 'red', reported: 'blue', pending: 'yellow' }
    return <Badge variant={map[s] ?? 'gray'}>{t(`status.${s}`) || s}</Badge>
  }

  const COLS = [t('alerts.col_platform'), t('alerts.col_content'), t('alerts.col_risk'), t('alerts.col_keyword'), t('alerts.col_status'), t('alerts.col_time'), t('alerts.col_action')]

  return (
    <div>
      <div className="anim-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{t('alerts.title')}</h1>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{t('alerts.total', data?.total ?? 0)}</p>
        </div>
        <button onClick={() => showToast(t('alerts.export') + '...', 'success')} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)', fontSize: 12, cursor: 'pointer', transition: 'all .15s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text2)' }}
        >{t('alerts.export')}</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => { setFilter(f.id); setPage(1) }} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            border: `1px solid ${filter === f.id ? 'var(--accent)' : 'var(--border)'}`,
            background: filter === f.id ? 'rgba(59,130,246,.15)' : 'var(--bg3)',
            color: filter === f.id ? 'var(--accent)' : 'var(--text2)',
            transition: 'all .15s',
          }}>{f.label}</button>
        ))}
        <div style={{ flex: 1, maxWidth: 260, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px' }}>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>🔎</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('alerts.search_ph')} style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 12, padding: '7px 0', width: '100%', fontFamily: 'var(--font)' }} />
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: '0 4px 20px var(--shadow-card)' }}>
        <div className="panel-accent-line" />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--muted)', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--border)' }}>#</th>
              {COLS.map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--muted)', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>{t('alerts.loading')}</td></tr>
            ) : (data?.items ?? []).map((s, i) => {
              const rc = s.risk_score >= 70 ? 'var(--danger)' : s.risk_score >= 40 ? 'var(--warn)' : 'var(--ok)'
              return (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--subtle-border-lt)', transition: 'background .15s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(59,130,246,.04)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                >
                  <td style={{ padding: '11px 14px', color: 'var(--muted)', fontSize: 11 }}>{(page - 1) * 20 + i + 1}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--text)' }}>{PLATFORM_ICONS[s.platform]} {s.platform}</td>
                  <td style={{ padding: '11px 14px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text2)' }}>{truncateText(s.content_text, 50)}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ height: 5, width: 72, borderRadius: 3, background: 'var(--bg3)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${s.risk_score}%`, background: rc, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontWeight: 700, color: rc, fontSize: 12 }}>{s.risk_score}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    {(s.keywords_found ?? []).slice(0, 2).map((k) => <Badge key={k} variant="red">{k}</Badge>)}
                  </td>
                  <td style={{ padding: '11px 14px' }}>{statusBadge(s.status)}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--muted)' }}>{formatDate(s.created_at)}</td>
                  <td style={{ padding: '11px 14px', display: 'flex', gap: 4 }}>
                    <button onClick={() => blockMutation.mutate(s.id)} style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 11, cursor: 'pointer', transition: 'all .15s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--danger)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text2)' }}
                    >🚫</button>
                    <button onClick={() => reportMutation.mutate(s.id)} style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 11, cursor: 'pointer', transition: 'all .15s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text2)' }}
                    >📨</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {data && data.total > 20 && (
          <div style={{ padding: '12px 18px', display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border)' }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)', fontSize: 12, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? .5 : 1 }}>{t('alerts.prev')}</button>
            <span style={{ padding: '6px 12px', fontSize: 12, color: 'var(--text2)' }}>{page} / {Math.ceil(data.total / 20)}</span>
            <button disabled={page >= Math.ceil(data.total / 20)} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)', fontSize: 12, cursor: 'pointer' }}>{t('alerts.next')}</button>
          </div>
        )}
      </div>
    </div>
  )
}
