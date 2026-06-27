import type { ReactNode } from 'react'

type Variant = 'red' | 'yellow' | 'blue' | 'green' | 'purple' | 'gray'

const STYLES: Record<Variant, { color: string; bg: string }> = {
  red:    { color: 'var(--danger)',  bg: 'var(--danger-bg)' },
  yellow: { color: '#b45309',       bg: 'var(--warning-bg)' },
  blue:   { color: 'var(--primary)', bg: 'var(--primary-bg)' },
  green:  { color: 'var(--success)', bg: 'var(--success-bg)' },
  purple: { color: '#7c3aed',        bg: '#ede9fe' },
  gray:   { color: 'var(--text2)',   bg: 'var(--surface2)' },
}

interface BadgeProps { variant?: Variant; children: ReactNode; style?: React.CSSProperties }

export function Badge({ variant = 'gray', children, style }: BadgeProps) {
  const s = STYLES[variant]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px',
      fontSize: 11, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '.8px',
      color: s.color,
      background: s.bg,
      borderRadius: 20,
      ...style,
    }}>
      {children}
    </span>
  )
}
