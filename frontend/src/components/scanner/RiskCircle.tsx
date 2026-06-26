interface RiskCircleProps { score: number }

export function RiskCircle({ score }: RiskCircleProps) {
  const cls = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'
  const color = cls === 'high' ? 'var(--danger)' : cls === 'medium' ? 'var(--warn)' : 'var(--ok)'
  const bg = cls === 'high' ? 'rgba(239,68,68,.1)' : cls === 'medium' ? 'rgba(245,158,11,.1)' : 'rgba(16,185,129,.1)'

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 90, height: 90, borderRadius: '50%', margin: '0 auto 6px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, fontWeight: 800,
        border: `3px solid ${color}`, color, background: bg,
      }}>
        {score}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>Risk ball</div>
    </div>
  )
}
