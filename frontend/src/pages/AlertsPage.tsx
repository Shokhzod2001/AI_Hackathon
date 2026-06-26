import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scansApi } from '@/api/scans'
import { useDebounce } from '@/hooks/useDebounce'
import { useNotifStore } from '@/store/notifStore'
import { Badge } from '@/components/ui/Badge'
import { PLATFORM_ICONS, formatDate, truncateText } from '@/lib/formatters'

const FILTERS = [
  { id: 'all', label: 'Barchasi' },
  { id: 'high', label: '🔴 Yuqori', riskMin: 70 },
  { id: 'medium', label: '🟡 O\'rta', riskMin: 40, riskMax: 69 },
  { id: 'low', label: '🟢 Past', riskMax: 39 },
  { id: 'blocked', label: '🚫 Bloklangan', status: 'blocked' },
  { id: 'reported', label: '📨 Yuborildi', status: 'reported' },
]

export function AlertsPage() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 300)
  const { showToast } = useNotifStore()
  const qc = useQueryClient()

  const activeFilter = FILTERS.find((f) => f.id === filter)

  const { data, isLoading } = useQuery({
    queryKey: ['scans', filter, debouncedSearch, page],
    queryFn: () => scansApi.list({
      status: (activeFilter as { status?: string })?.status,
      risk_min: (activeFilter as { riskMin?: number })?.riskMin,
      risk_max: (activeFilter as { riskMax?: number })?.riskMax,
      search: debouncedSearch || undefined,
      page,
      per_page: 20,
    }),
  })

  const blockMutation = useMutation({
    mutationFn: (id: string) => scansApi.updateStatus(id, 'blocked'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['scans'] }); showToast('🚫 Bloklash so\'rovi yuborildi', 'error') },
  })

  const reportMutation = useMutation({
    mutationFn: (id: string) => scansApi.updateStatus(id, 'reported'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['scans'] }); showToast('📨 Idoraga yuborildi', 'success') },
  })

  const statusBadge = (s: string) => {
    const map: Record<string, 'red' | 'blue' | 'yellow'> = { blocked: 'red', reported: 'blue', pending: 'yellow' }
    const labels: Record<string, string> = { blocked: 'Bloklangan', reported: 'Yuborildi', pending: 'Tekshiruvda' }
    return <Badge variant={map[s] ?? 'gray'}>{labels[s] ?? s}</Badge>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Ogohlantirishlar</h1>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Jami {data?.total ?? 0} ta hodisa</p>
        </div>
        <button onClick={() => showToast('⬇ Jadval yuklab olinmoqda...', 'success')} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12, cursor: 'pointer' }}>⬇ Eksport</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); setPage(1) }}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${filter === f.id ? 'var(--accent)' : 'var(--border)'}`,
              background: filter === f.id ? 'rgba(59,130,246,.15)' : 'transparent',
              color: filter === f.id ? 'var(--accent)' : 'var(--text2)',
            }}
          >{f.label}</button>
        ))}
        <div style={{ flex: 1, maxWidth: 260, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 7, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px' }}>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>🔎</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish..."
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 12, padding: '7px 0', width: '100%', fontFamily: 'var(--font)' }}
          />
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {['#','Platforma','Mazmun','Risk ball','Kalit so\'z','Holat','Vaqt','Amal'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--muted)', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.6px', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>Yuklanmoqda...</td></tr>
            ) : (data?.items ?? []).map((s, i) => {
              const rc = s.risk_score >= 70 ? 'var(--danger)' : s.risk_score >= 40 ? 'var(--warn)' : 'var(--ok)'
              return (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(26,39,68,.4)' }}>
                  <td style={{ padding: '11px 14px', color: 'var(--muted)', fontSize: 11 }}>{(page - 1) * 20 + i + 1}</td>
                  <td style={{ padding: '11px 14px' }}>{PLATFORM_ICONS[s.platform]} {s.platform}</td>
                  <td style={{ padding: '11px 14px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{truncateText(s.content_text, 50)}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ height: 5, width: 72, borderRadius: 3, background: 'var(--bg3)', overflow: 'hidden', display: 'inline-block' }}>
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
                    <button onClick={() => blockMutation.mutate(s.id)} style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 11, cursor: 'pointer' }}>🚫</button>
                    <button onClick={() => reportMutation.mutate(s.id)} style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 11, cursor: 'pointer' }}>📨</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {data && data.total > 20 && (
          <div style={{ padding: '12px 18px', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? .5 : 1 }}>← Oldingi</button>
            <span style={{ padding: '6px 12px', fontSize: 12, color: 'var(--text2)' }}>{page} / {Math.ceil(data.total / 20)}</span>
            <button disabled={page >= Math.ceil(data.total / 20)} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12, cursor: 'pointer' }}>Keyingi →</button>
          </div>
        )}
      </div>
    </div>
  )
}
