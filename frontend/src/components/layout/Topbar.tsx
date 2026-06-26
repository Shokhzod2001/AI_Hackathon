import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useNotifStore } from '@/store/notifStore'
import { useAuthStore } from '@/store/authStore'

const TITLES: Record<string, string> = {
  '/dashboard': 'Bosh panel',
  '/scanner': 'AI Skaner',
  '/alerts': 'Ogohlantirishlar',
  '/map': 'Faollik xaritasi',
  '/reports': 'Hisobotlar',
  '/settings': 'Sozlamalar',
}

export function Topbar({ sidebarWidth }: { sidebarWidth: number }) {
  const [clock, setClock] = useState('')
  const [showNotif, setShowNotif] = useState(false)
  const { unreadCount, markAllRead } = useNotifStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const update = () => setClock(new Date().toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'medium' }))
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 150,
      background: 'rgba(7,11,20,.9)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12, height: 56,
      marginLeft: sidebarWidth, transition: 'margin-left .25s cubic-bezier(.4,0,.2,1)',
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>{TITLES[pathname] || 'NarkoMonitor'}</div>

      <div style={{ flex: 1, maxWidth: 340, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
        <span style={{ color: 'var(--muted)', fontSize: 13 }}>🔎</span>
        <input
          style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 12, padding: '7px 0', width: '100%', fontFamily: 'var(--font)' }}
          placeholder="Qidirish: kalit so'z, platforma, hodisa..."
        />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace', padding: '0 8px' }}>{clock}</span>
        <button onClick={() => {}} style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>
          ↻ Yangilash
        </button>
        <button onClick={() => navigate('/scanner')} style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff' }}>
          + Yangi skan
        </button>
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowNotif(!showNotif)}
            style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}
          >
            🔔
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--bg)' }} />
            )}
          </div>
          {showNotif && (
            <div style={{ position: 'absolute', top: 44, right: 0, width: 300, background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', boxShadow: '0 20px 60px rgba(0,0,0,.6)', zIndex: 500, animation: 'slideDown .2s ease' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Bildirishnomalar</span>
                <span onClick={markAllRead} style={{ fontSize: 11, color: 'var(--accent)', cursor: 'pointer' }}>Barchasini o'qildi</span>
              </div>
              <div style={{ padding: 12, fontSize: 12, color: 'var(--text2)' }}>Yangi bildirishnomalar yo'q</div>
            </div>
          )}
        </div>
        <div
          onClick={logout}
          style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', border: '2px solid var(--border2)' }}
          title={user?.username}
        >
          {user?.username?.[0]?.toUpperCase() || 'A'}
        </div>
      </div>
    </div>
  )
}
