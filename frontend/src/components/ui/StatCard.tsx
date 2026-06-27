import { useEffect, useRef, type ReactNode } from 'react'

interface StatCardProps {
  value: number
  label: string
  sub?: string
  ribbon?: 'signal' | 'warn' | 'ok' | 'none'
  delta?: string
  deltaUp?: boolean
  icon?: ReactNode
  iconBg?: string
}

const RIBBON_COLOR: Record<string, string> = {
  signal: 'var(--danger)',
  warn:   'var(--warning)',
  ok:     'var(--success)',
  none:   'var(--primary)',
}

const RIBBON_BG: Record<string, string> = {
  signal: 'var(--danger-bg)',
  warn:   'var(--warning-bg)',
  ok:     'var(--success-bg)',
  none:   'var(--primary-bg)',
}

export function StatCard({ value, label, sub, ribbon = 'none', delta, deltaUp, icon, iconBg }: StatCardProps) {
  const numRef = useRef<HTMLDivElement>(null)
  const color = RIBBON_COLOR[ribbon]
  const bg    = iconBg ?? RIBBON_BG[ribbon]

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
    const id = requestAnimationFrame(step)
    return () => cancelAnimationFrame(id)
  }, [value])

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow)',
      border: '1px solid var(--border)',
      padding: '20px 22px',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      gap: 16,
    }}>
      {/* Left: metric */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.8px', color: 'var(--text2)', marginBottom: 8,
        }}>{label}</div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div
            ref={numRef}
            style={{
              fontSize: 28, fontWeight: 800,
              color: 'var(--text)', lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >0</div>
          {delta && (
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: deltaUp ? 'var(--danger)' : 'var(--success)',
            }}>{delta}</span>
          )}
        </div>

        {sub && (
          <div style={{
            fontSize: 12, color: 'var(--text2)', marginTop: 5, fontWeight: 500,
          }}>{sub}</div>
        )}
      </div>

      {/* Right: icon badge */}
      {icon && (
        <div style={{
          width: 52, height: 52, borderRadius: 'var(--radius)',
          background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          color: color,
        }}>
          {icon}
        </div>
      )}
    </div>
  )
}
