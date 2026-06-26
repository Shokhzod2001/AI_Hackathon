import type { ReactNode } from 'react'

type Variant = 'red' | 'yellow' | 'blue' | 'green' | 'purple' | 'gray'

const STYLES: Record<Variant, { bg: string; color: string }> = {
  red:    { bg: 'rgba(239,68,68,.15)',   color: '#fca5a5' },
  yellow: { bg: 'rgba(245,158,11,.15)',  color: '#fcd34d' },
  blue:   { bg: 'rgba(59,130,246,.15)',  color: '#93c5fd' },
  green:  { bg: 'rgba(16,185,129,.15)',  color: '#6ee7b7' },
  purple: { bg: 'rgba(139,92,246,.15)',  color: '#c4b5fd' },
  gray:   { bg: 'rgba(71,85,105,.15)',   color: '#94a3b8' },
}

interface BadgeProps { variant?: Variant; children: ReactNode; style?: React.CSSProperties }

export function Badge({ variant = 'gray', children, style }: BadgeProps) {
  const s = STYLES[variant]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 20,
      fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px',
      background: s.bg, color: s.color, ...style,
    }}>
      {children}
    </span>
  )
}
