import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, subtitle, children }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
        zIndex: 998, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--card)', border: '1px solid var(--border2)',
          borderRadius: 'var(--radius)', padding: 24, maxWidth: 480, width: '90%',
          boxShadow: '0 24px 64px rgba(0,0,0,.6)', animation: 'fadeIn .25s ease',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: subtitle ? 6 : 18 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 18 }}>{subtitle}</div>}
        {children}
      </div>
    </div>
  )
}
