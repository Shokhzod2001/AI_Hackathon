import { useQuery } from '@tanstack/react-query'
import { StatCard } from '@/components/ui/StatCard'
import { WeeklyBarChart } from '@/components/charts/WeeklyBarChart'
import { PlatformDoughnut } from '@/components/charts/PlatformDoughnut'
import { KeywordsBarChart } from '@/components/charts/KeywordsBarChart'
import { scansApi } from '@/api/scans'
import { mapApi } from '@/api/map'
import { formatDate, truncateText, PLATFORM_ICONS } from '@/lib/formatters'
import { Badge } from '@/components/ui/Badge'
import { useT } from '@/lib/i18n'
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  Send,
} from 'lucide-react'

function Panel({
  title, sub, badge, right, accentColor, children,
}: {
  title: string; sub?: string; badge?: React.ReactNode; right?: React.ReactNode
  accentColor?: string; children: React.ReactNode
}) {
  return (
    <div className="anim-fade-in" style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      borderTop: accentColor ? `3px solid ${accentColor}` : undefined,
    }}>
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 14, fontWeight: 700, color: 'var(--text)',
          }}>{title}</span>
          {sub && (
            <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{sub}</span>
          )}
        </div>
        <div>{badge || right}</div>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  )
}

const LIVEBADGE = (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 11, fontWeight: 700, color: 'var(--success)',
    background: 'var(--success-bg)',
    padding: '3px 10px', borderRadius: 20,
    textTransform: 'uppercase', letterSpacing: '.6px',
  }}>
    <span style={{
      width: 6, height: 6, background: 'var(--success)',
      borderRadius: '50%', animation: 'pulse 2s ease-in-out infinite',
    }} />
    LIVE
  </span>
)

export function DashboardPage() {
  const t = useT()
  const { data: stats } = useQuery({ queryKey: ['stats-summary'], queryFn: scansApi.stats.summary, refetchInterval: 30_000 })
  const { data: weekly } = useQuery({ queryKey: ['stats-weekly'], queryFn: scansApi.stats.weekly })
  const { data: platform } = useQuery({ queryKey: ['stats-platform'], queryFn: scansApi.stats.byPlatform })
  const { data: keywords } = useQuery({ queryKey: ['stats-keywords'], queryFn: scansApi.stats.topKeywords })
  const { data: feed } = useQuery({ queryKey: ['live-feed'], queryFn: mapApi.liveFeed, refetchInterval: 8_000 })
  const { data: scans } = useQuery({ queryKey: ['recent-scans'], queryFn: () => scansApi.list({ per_page: 5 }) })

  const statusBadge = (s: string) => {
    const map: Record<string, 'red' | 'blue' | 'yellow'> = { blocked: 'red', reported: 'blue', pending: 'yellow' }
    return <Badge variant={map[s] ?? 'gray'}>{t(`status.${s}`) || s}</Badge>
  }

  return (
    <div className="anim-fade-in">
      {/* Stat cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 20, marginBottom: 24,
      }}>
        <StatCard
          value={stats?.total_detected ?? 1247}
          label={t('dash.stat_detected')}
          ribbon="signal"
          delta="+34"
          deltaUp
          sub={t('dash.stat_detected')}
          icon={<AlertTriangle size={22} />}
        />
        <StatCard
          value={stats?.total_pending ?? 89}
          label={t('dash.stat_pending')}
          ribbon="warn"
          sub="Qayta ko'rib chiqishda"
          icon={<Clock size={22} />}
        />
        <StatCard
          value={stats?.total_blocked ?? 943}
          label={t('dash.stat_blocked')}
          ribbon="ok"
          delta="75.6%"
          sub="Aniqlangan postlardan"
          icon={<ShieldCheck size={22} />}
        />
        <StatCard
          value={stats?.total_reported ?? 312}
          label={t('dash.stat_reported')}
          delta="+12"
          sub="Idoralarga yuborilgan"
          icon={<Send size={22} />}
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <Panel
          title={t('dash.weekly')}
          sub={t('dash.weekly_sub')}
          badge={
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>7 KUN</span>
          }
        >
          {weekly && <WeeklyBarChart data={weekly} />}
        </Panel>
        <Panel title={t('dash.platform')} sub={t('dash.distribution')}>
          {platform && <PlatformDoughnut data={platform} />}
        </Panel>
      </div>

      {/* Recent posts + Live feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Panel
          title={t('dash.recent_posts')}
          accentColor="var(--danger)"
          right={
            <span style={{
              fontSize: 12, fontWeight: 600, color: 'var(--primary)',
              cursor: 'pointer',
            }}>{t('dash.see_all')}</span>
          }
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[t('dash.col_platform'), t('dash.col_content'), t('dash.col_risk'), t('dash.col_status'), t('dash.col_time')].map((h) => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '0 0 12px',
                    paddingRight: 12,
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '.8px', color: 'var(--text2)',
                    borderBottom: '1px solid var(--border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(scans?.items ?? []).map((s, i) => (
                <tr key={s.id}
                  style={{ transition: 'background .12s', animationDelay: `${i * 0.05}s` }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--surface2)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                >
                  <td style={{ padding: '10px 12px 10px 0', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>
                    {PLATFORM_ICONS[s.platform]} {s.platform}
                  </td>
                  <td style={{ padding: '10px 12px 10px 0', fontSize: 13, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>
                    {truncateText(s.content_text, 40)}
                  </td>
                  <td style={{
                    padding: '10px 12px 10px 0', borderBottom: '1px solid var(--border)',
                    fontSize: 13, fontWeight: 700,
                    color: s.risk_score >= 70 ? 'var(--danger)' : s.risk_score >= 40 ? 'var(--warning)' : 'var(--success)',
                  }}>{s.risk_score}</td>
                  <td style={{ padding: '10px 12px 10px 0', borderBottom: '1px solid var(--border)' }}>{statusBadge(s.status)}</td>
                  <td style={{ padding: '10px 0', fontSize: 12, color: 'var(--text2)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                    {formatDate(s.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title={t('dash.live_feed')} badge={LIVEBADGE}>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {(feed ?? []).map((f: { icon: string; title: string; meta: string; time: string }, i: number) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '10px 0',
                borderBottom: '1px solid var(--border)',
                animation: `feedIn .35s ease ${i * 0.06}s both`,
                transition: 'background .12s', cursor: 'pointer',
                borderRadius: 4, margin: '0 -4px', paddingLeft: 4, paddingRight: 4,
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--surface2)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{f.meta}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text2)', flexShrink: 0, paddingTop: 1 }}>{f.time}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Keywords + Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Panel title={t('dash.keywords')} sub={t('dash.keywords_sub')}>
          {keywords && <KeywordsBarChart data={keywords} />}
        </Panel>

        <Panel title={t('dash.sys_logs')} badge={LIVEBADGE}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Telegram crawler: 127 kanal skanerlandi',
              'NLP engine: mBERT model yuklandi',
              'Risk engine: 23 yangi hodisa',
              'Telegram bot: 7 ogohlantirish yuborildi',
            ].map((l, i) => (
              <div key={i} className="anim-fade-in" style={{
                padding: '10px 14px',
                borderLeft: '3px solid var(--success)',
                background: 'var(--success-bg)',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                animationDelay: `${i * 0.09}s`,
                display: 'flex', gap: 12, alignItems: 'center',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', letterSpacing: '.5px' }}>OK</span>
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{l}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
