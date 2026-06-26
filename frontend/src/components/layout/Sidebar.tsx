import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const NAV = [
  { id: 'dashboard',  icon: '📊', label: 'Dashboard',        path: '/dashboard', section: 'Asosiy' },
  { id: 'scanner',    icon: '🔍', label: 'AI Skaner',        path: '/scanner',   badge: 'AI' },
  { id: 'alerts',     icon: '🚨', label: 'Ogohlantirishlar', path: '/alerts' },
  { id: 'map',        icon: '🗺', label: 'Xarita',          path: '/map',       section: 'Tahlil' },
  { id: 'reports',    icon: '📋', label: 'Hisobotlar',       path: '/reports' },
  { id: 'settings',   icon: '⚙️', label: 'Sozlamalar',       path: '/settings',  section: 'Tizim' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const w = collapsed ? 60 : 240

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, width: w, height: '100vh',
      background: 'linear-gradient(180deg,#0c1120 0%,#080d1a 100%)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      zIndex: 200, transition: 'width .25s cubic-bezier(.4,0,.2,1)',
    }}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute', top: 24, right: -12, width: 24, height: 24,
          borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border2)',
          color: 'var(--text2)', cursor: 'pointer', fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {collapsed ? '›' : '‹'}
      </button>

      <div style={{
        padding: collapsed ? '16px 0' : '20px 18px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          background: 'linear-gradient(135deg,#1d4ed8,#06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
        }}>🛡</div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>NarkoMonitor</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)', animation: 'pulse 2s infinite', display: 'inline-block' }} />
              Tizim faol
            </div>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
        {NAV.map((item) => {
          const active = pathname === item.path
          return (
            <div key={item.id}>
              {item.section && !collapsed && (
                <div style={{ padding: '12px 16px 4px', fontSize: 9, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
                  {item.section}
                </div>
              )}
              <div
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: collapsed ? '12px 0' : '10px 18px',
                  cursor: 'pointer', fontSize: 13,
                  color: active ? 'var(--accent2)' : 'var(--text2)',
                  borderLeft: active ? '2px solid var(--accent2)' : '2px solid transparent',
                  background: active ? 'rgba(6,182,212,.07)' : 'transparent',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  transition: 'all .15s',
                }}
              >
                <span style={{ fontSize: 15, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span style={{ background: 'var(--danger)', color: '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 10, fontWeight: 700 }}>
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </nav>

      {!collapsed && (
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--muted)' }}>
          v2.0 · © 2025
        </div>
      )}
    </div>
  )
}
