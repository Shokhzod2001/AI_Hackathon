import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useNotifStore } from '@/store/notifStore'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useLangStore, type Lang } from '@/store/langStore'
import { useT } from '@/lib/i18n'
import { Search, Bell, Sun, Moon, Plus } from 'lucide-react'

const PAGE_KEY: Record<string, string> = {
  '/dashboard': 'page.dashboard',
  '/scanner':   'page.scanner',
  '/alerts':    'page.alerts',
  '/map':       'page.map',
  '/reports':   'page.reports',
  '/settings':  'page.settings',
}

const LANGS: { code: Lang; label: string }[] = [
  { code: 'uz', label: 'UZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
]

export function Topbar({ sidebarWidth }: { sidebarWidth: number }) {
  const [clock, setClock] = useState('')
  const [showNotif, setShowNotif] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const { unreadCount, markAllRead } = useNotifStore()
  const { user, logout } = useAuthStore()
  const { theme, toggle: toggleTheme } = useThemeStore()
  const { lang, setLang } = useLangStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const t = useT()

  useEffect(() => {
    const update = () => setClock(new Date().toLocaleTimeString('en-GB'))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!showNotif && !showUser) return
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-dropdown]')) {
        setShowNotif(false); setShowUser(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showNotif, showUser])

  const pageTitle = t(PAGE_KEY[pathname] ?? 'page.dashboard')
  const initials = (user?.username?.[0] ?? 'A').toUpperCase()

  const iconBtn = (active?: boolean): React.CSSProperties => ({
    width: 38, height: 38, borderRadius: 8,
    border: 'none',
    background: active ? 'var(--surface2)' : 'transparent',
    color: 'var(--text2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background .15s, color .15s',
    flexShrink: 0,
  })

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 150,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      marginLeft: sidebarWidth,
      transition: 'margin-left .22s ease',
      height: 64,
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 12,
      boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    }}>
      {/* Page title */}
      <span style={{
        fontSize: 16, fontWeight: 700,
        color: 'var(--text)', whiteSpace: 'nowrap',
        letterSpacing: '.2px',
      }}>
        {pageTitle}
      </span>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        flex: 1, maxWidth: 340,
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '0 12px',
        height: 38,
        marginLeft: 8,
      }}>
        <Search size={14} color="var(--text2)" />
        <input
          style={{
            background: 'none', border: 'none', outline: 'none',
            fontSize: 13, fontFamily: 'var(--font-head)',
            color: 'var(--text)', width: '100%',
          }}
          placeholder={t('topbar.search_ph')}
        />
      </div>

      {/* Right controls */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Clock */}
        <span style={{
          fontSize: 13, fontWeight: 500,
          color: 'var(--text2)', padding: '0 10px',
          letterSpacing: '.3px',
        }}>{clock}</span>

        {/* Language switcher */}
        <div style={{
          display: 'flex', gap: 2,
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 8, padding: '2px 3px',
        }}>
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              style={{
                fontSize: 11, fontWeight: 700,
                padding: '3px 8px', border: 'none', borderRadius: 6,
                background: lang === code ? 'var(--primary)' : 'transparent',
                color: lang === code ? '#fff' : 'var(--text2)',
                cursor: 'pointer', letterSpacing: '1px',
                transition: 'all .15s',
              }}
            >{label}</button>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={iconBtn()}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface2)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        >
          {theme === 'dark'
            ? <Sun  size={16} color="var(--warning)" />
            : <Moon size={16} color="var(--text2)" />
          }
        </button>

        {/* New scan button */}
        <button
          onClick={() => navigate('/scanner')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 14px', height: 38, borderRadius: 8,
            border: 'none',
            background: 'var(--primary)', color: '#fff',
            fontSize: 13, fontWeight: 700,
            cursor: 'pointer',
            transition: 'opacity .15s, background .15s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary2)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary)' }}
        >
          <Plus size={15} />
          {t('topbar.new_scan')}
        </button>

        {/* Notifications */}
        <div data-dropdown style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotif(!showNotif); setShowUser(false) }}
            style={{ ...iconBtn(showNotif), position: 'relative' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface2)' }}
            onMouseLeave={(e) => { if (!showNotif) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            <Bell size={16} color={unreadCount > 0 ? 'var(--danger)' : 'var(--text2)'} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 7, height: 7,
                background: 'var(--danger)', borderRadius: '50%',
                border: '1.5px solid var(--surface)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            )}
          </button>

          {showNotif && (
            <div className="anim-slide-up" style={{
              position: 'absolute', top: 46, right: 0, width: 300,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              boxShadow: 'var(--shadow-lg)',
              zIndex: 500,
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px 16px', borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{t('topbar.notifications')}</span>
                <span
                  onClick={markAllRead}
                  style={{ fontSize: 12, color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                >{t('topbar.mark_read')}</span>
              </div>
              <div style={{ padding: '16px', fontSize: 13, color: 'var(--text2)', textAlign: 'center' }}>
                {t('topbar.no_notif')}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div data-dropdown style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowUser(!showUser); setShowNotif(false) }}
            style={{
              width: 38, height: 38, borderRadius: 8,
              border: 'none',
              background: showUser ? 'var(--surface2)' : 'var(--primary-bg)',
              cursor: 'pointer', transition: 'background .15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{
              fontWeight: 800, fontSize: 14,
              color: 'var(--primary)',
            }}>{initials}</span>
          </button>

          {showUser && (
            <div className="anim-slide-up" style={{
              position: 'absolute', top: 46, right: 0, width: 230,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              boxShadow: 'var(--shadow-lg)',
              zIndex: 500,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>
                  {user?.username || 'Admin'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                  {user?.email || 'admin@clearnet.uz'}
                </div>
                <div style={{
                  marginTop: 8, display: 'inline-block',
                  fontSize: 10, fontWeight: 700,
                  color: 'var(--primary)',
                  background: 'var(--primary-bg)',
                  padding: '2px 8px', borderRadius: 12,
                  textTransform: 'uppercase', letterSpacing: '1px',
                }}>{user?.role || 'ADMIN'}</div>
              </div>

              {[
                { label: 'Profil',     action: () => { setShowUser(false); navigate('/settings') } },
                { label: 'Sozlamalar', action: () => { setShowUser(false); navigate('/settings') } },
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={item.action}
                  style={{
                    padding: '11px 16px', fontSize: 13, fontWeight: 500,
                    color: 'var(--text)', cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--surface2)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                >{item.label}</div>
              ))}

              <div
                onClick={() => { setShowUser(false); logout() }}
                style={{
                  padding: '11px 16px', fontSize: 13, fontWeight: 600,
                  color: 'var(--danger)', cursor: 'pointer',
                  transition: 'background .15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--danger-bg)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >Chiqish</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
