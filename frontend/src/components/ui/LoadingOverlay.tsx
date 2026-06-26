interface LoadingOverlayProps { show: boolean; text?: string }

export function LoadingOverlay({ show, text = 'Yuklanmoqda...' }: LoadingOverlayProps) {
  if (!show) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(7,11,20,.85)',
      zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16, backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        width: 48, height: 48,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent2)',
        borderRadius: '50%',
        animation: 'spin .7s linear infinite',
      }} />
      <div style={{ fontSize: 13, color: 'var(--text2)' }}>{text}</div>
    </div>
  )
}
