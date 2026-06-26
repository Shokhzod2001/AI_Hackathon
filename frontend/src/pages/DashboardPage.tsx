import { useQuery } from '@tanstack/react-query'
import { StatCard } from '@/components/ui/StatCard'
import { WeeklyBarChart } from '@/components/charts/WeeklyBarChart'
import { PlatformDoughnut } from '@/components/charts/PlatformDoughnut'
import { KeywordsBarChart } from '@/components/charts/KeywordsBarChart'
import { scansApi } from '@/api/scans'
import { mapApi } from '@/api/map'
import { formatDate, truncateText, PLATFORM_ICONS } from '@/lib/formatters'
import { Badge } from '@/components/ui/Badge'

const Panel = ({ title, sub, badge, right, children }: { title: string; sub?: string; badge?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }) => (
  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>{sub}</div>}
      </div>
      {badge || right}
    </div>
    <div style={{ padding: 18 }}>{children}</div>
  </div>
)

export function DashboardPage() {
  const { data: stats } = useQuery({ queryKey: ['stats-summary'], queryFn: scansApi.stats.summary, refetchInterval: 30_000 })
  const { data: weekly } = useQuery({ queryKey: ['stats-weekly'], queryFn: scansApi.stats.weekly })
  const { data: platform } = useQuery({ queryKey: ['stats-platform'], queryFn: scansApi.stats.byPlatform })
  const { data: keywords } = useQuery({ queryKey: ['stats-keywords'], queryFn: scansApi.stats.topKeywords })
  const { data: feed } = useQuery({ queryKey: ['live-feed'], queryFn: mapApi.liveFeed, refetchInterval: 8_000 })
  const { data: scans } = useQuery({ queryKey: ['recent-scans'], queryFn: () => scansApi.list({ per_page: 5 }) })

  const statusBadge = (s: string) => {
    const map: Record<string, 'red' | 'blue' | 'yellow'> = { blocked: 'red', reported: 'blue', pending: 'yellow' }
    const labels: Record<string, string> = { blocked: 'Bloklangan', reported: 'Yuborildi', pending: 'Tekshiruvda' }
    return <Badge variant={map[s] ?? 'gray'}>{labels[s] ?? s}</Badge>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Bosh panel</h1>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Real vaqt monitoring — bugungi holat</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 22 }}>
        <StatCard icon="🚨" value={stats?.total_detected ?? 1247} label="Aniqlangan postlar" trend="↑ +34" trendUp color="red" progress={76} />
        <StatCard icon="⏳" value={stats?.total_pending ?? 89} label="Tekshiruvda" trend="Faol" trendUp color="yellow" progress={35} />
        <StatCard icon="🚫" value={stats?.total_blocked ?? 943} label="Bloklangan" trend="75.6%" color="blue" progress={75} />
        <StatCard icon="📨" value={stats?.total_reported ?? 312} label="Idoraga yuborildi" trend="↑ +12" color="green" progress={55} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <Panel title="Haftalik faollik" sub="Aniqlangan vs Bloklangan" badge={<Badge variant="blue">7 kun</Badge>}>
          {weekly && <WeeklyBarChart data={weekly} />}
        </Panel>
        <Panel title="Platforma" sub="Taqsimot">
          {platform && <PlatformDoughnut data={platform} />}
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Panel title="So'nggi aniqlangan postlar" right={<span style={{ fontSize: 12, color: 'var(--accent)', cursor: 'pointer' }}>Barchasini →</span>}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Platforma','Mazmun','Risk','Holat','Vaqt'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--muted)', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(scans?.items ?? []).map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: '10px 12px' }}>{PLATFORM_ICONS[s.platform]} {s.platform}</td>
                  <td style={{ padding: '10px 12px', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{truncateText(s.content_text, 40)}</td>
                  <td style={{ padding: '10px 12px', color: s.risk_score >= 70 ? 'var(--danger)' : s.risk_score >= 40 ? 'var(--warn)' : 'var(--ok)', fontWeight: 700 }}>{s.risk_score}</td>
                  <td style={{ padding: '10px 12px' }}>{statusBadge(s.status)}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{formatDate(s.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Jonli faollik lenti" badge={<Badge variant="green">● Jonli</Badge>}>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {(feed ?? []).map((f: { icon: string; title: string; meta: string; time: string }, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(26,39,68,.4)', animation: 'feedIn .4s ease' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{f.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>{f.meta}</div>
                </div>
                <span style={{ fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>{f.time}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel title="Top kalit so'zlar">
          {keywords && <KeywordsBarChart data={keywords} />}
        </Panel>
        <Panel title="Tizim loglari" badge={<Badge variant="green">● Jonli</Badge>}>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--muted)' }}>
            {['Telegram crawler: 127 kanal skanerlandi','NLP engine: mBERT model yuklandi','Risk engine: 23 yangi hodisa','Telegram bot: 7 ogohlantirish yuborildi'].map((l, i) => (
              <div key={i} style={{ padding: '5px 0', borderBottom: '1px solid rgba(26,39,68,.3)' }}>
                <span style={{ color: 'var(--accent2)', fontWeight: 600 }}>[OK]</span> {l}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
