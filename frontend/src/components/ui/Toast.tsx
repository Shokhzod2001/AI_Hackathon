import { useNotifStore } from '@/store/notifStore'
import styles from './Toast.module.css'

export function ToastContainer() {
  const { toasts } = useNotifStore()
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: 'var(--card)',
            border: `1px solid var(--border2)`,
            borderLeft: `3px solid ${t.type === 'success' ? 'var(--ok)' : t.type === 'warning' ? 'var(--warn)' : 'var(--danger)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            fontSize: 13,
            maxWidth: 320,
            boxShadow: '0 8px 32px rgba(0,0,0,.4)',
            animation: 'fadeIn .3s ease',
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
