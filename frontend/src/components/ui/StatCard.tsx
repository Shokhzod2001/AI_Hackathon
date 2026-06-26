import { useEffect, useRef } from 'react'

type Color = 'red' | 'yellow' | 'blue' | 'green'

const COLOR_MAP: Record<Color, string> = {
  red: 'var(--danger)', yellow: 'var(--warn)', blue: 'var(--accent)', green: 'var(--ok)',
}

interface StatCardProps {
  icon: string
  value: number
  label: string
  trend?: string
  trendUp?: boolean
  color: Color
  progress: number
}

export function StatCard({ icon, value, label, trend, trendUp, color, progress }: StatCardProps) {
  const numRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = numRef.current
    if (!el) return
    const start = performance.now()
    const duration = 1200
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      el.textContent = Math.round(ease * value).toLocaleString()
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])

  const c = COLOR_MAP[color]

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 18, position: 'relative',
      overflow: 'hidden', transition: 'transform .2s, box-shadow .2s',
    }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,.3)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${c}, ${c}99)` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        {trend && (
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 600,
            background: trendUp ? 'rgba(239,68,68,.15)' : 'rgba(16,185,129,.15)',
            color: trendUp ? '#fca5a5' : '#6ee7b7',
          }}>{trend}</span>
        )}
      </div>
      <div ref={numRef} style={{ fontSize: 30, fontWeight: 800, marginBottom: 4, letterSpacing: -1 }}>0</div>
      <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.6px' }}>{label}</div>
      <div style={{ height: 3, background: 'var(--bg3)', borderRadius: 2, marginTop: 12, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, borderRadius: 2, background: c, transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}
