import { useNavigate, useLocation } from 'react-router-dom'
import { useT } from '@/lib/i18n'
import {
  LayoutDashboard,
  ScanSearch,
  BellRing,
  Map,
  FileBarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react'

const NAV = [
  { id: 'dashboard', labelKey: 'nav.dashboard', path: '/dashboard', Icon: LayoutDashboard, sectionKey: 'nav.section.main' },
  { id: 'scanner',   labelKey: 'nav.scanner',   path: '/scanner',   Icon: ScanSearch,      badge: 'AI' },
  { id: 'alerts',    labelKey: 'nav.alerts',    path: '/alerts',    Icon: BellRing },
  { id: 'map',       labelKey: 'nav.map',       path: '/map',       Icon: Map,             sectionKey: 'nav.section.analysis' },
  { id: 'reports',   labelKey: 'nav.reports',   path: '/reports',   Icon: FileBarChart2 },
  { id: 'settings',  labelKey: 'nav.settings',  path: '/settings',  Icon: Settings,        sectionKey: 'nav.section.system' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const t = useT()
  const w = collapsed ? 68 : 250

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, width: w, height: '100vh',
      background: 'var(--sidebar-bg)',
      display: 'flex', flexDirection: 'column',
      zIndex: 200,
      transition: 'width .22s ease',
      overflow: 'hidden',
      boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
    }}>
      {/* Brand */}
      <div style={{
        padding: collapsed ? '18px 0' : '20px 22px',
        display: 'flex', alignItems: 'center', gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        minHeight: 64,
        borderBottom: '1px solid var(--sidebar-divider)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Shield size={18} color="#fff" />
        </div>
        {!collapsed && (
          <div>
            <div style={{
              fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 800,
              color: '#fff', letterSpacing: '.3px', lineHeight: 1.2,
            }}>CLEARNET</div>
            <div style={{
              fontSize: 10, fontWeight: 500,
              color: 'var(--sidebar-text2)', marginTop: 1,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'var(--ok)', display: 'inline-block',
                animation: 'pulse 2.5s ease-in-out infinite',
              }} />
              {t('nav.system_active')}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {NAV.map((item) => {
          const active = pathname === item.path
          return (
            <div key={item.id}>
              {item.sectionKey && !collapsed && (
                <div style={{
                  fontSize: 10, fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.4px',
                  color: 'var(--sidebar-text2)',
                  padding: '16px 22px 5px',
                }}>
                  {t(item.sectionKey)}
                </div>
              )}
              <div
                onClick={() => navigate(item.path)}
                title={collapsed ? t(item.labelKey) : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '10px 0' : '10px 14px',
                  margin: '2px 10px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  cursor: 'pointer',
                  fontSize: 14, fontWeight: active ? 700 : 500,
                  color: active ? '#fff' : 'var(--sidebar-text)',
                  background: active ? 'var(--sidebar-active)' : 'transparent',
                  borderRadius: 6,
                  transition: 'all .15s',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLDivElement).style.background = 'var(--sidebar-hover)'
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                }}
              >
                <item.Icon
                  size={18}
                  color={active ? '#fff' : 'rgba(255,255,255,0.70)'}
                  style={{ flexShrink: 0 }}
                />
                {!collapsed && (
                  <>
                    <span style={{ flex: 1 }}>{t(item.labelKey)}</span>
                    {item.badge && (
                      <span style={{
                        fontSize: 9, fontWeight: 700,
                        padding: '2px 6px',
                        background: 'var(--primary)',
                        color: '#fff',
                        borderRadius: 10,
                        letterSpacing: '.5px',
                      }}>{item.badge}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer / collapse toggle */}
      <div style={{ borderTop: '1px solid var(--sidebar-divider)', padding: '8px 10px' }}>
        <div
          onClick={onToggle}
          style={{
            display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: '8px 10px',
            cursor: 'pointer',
            borderRadius: 6,
            transition: 'background .15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--sidebar-hover)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
        >
          {!collapsed && (
            <span style={{ fontSize: 12, color: 'var(--sidebar-text2)' }}>CLEARNET v2.0</span>
          )}
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'var(--sidebar-hover)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {collapsed
              ? <ChevronRight size={14} color="rgba(255,255,255,0.7)" />
              : <ChevronLeft  size={14} color="rgba(255,255,255,0.7)" />
            }
          </div>
        </div>
      </div>
    </div>
  )
}
