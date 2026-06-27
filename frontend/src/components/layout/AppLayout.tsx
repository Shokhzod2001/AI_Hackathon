import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { ToastContainer } from '@/components/ui/Toast'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarWidth = collapsed ? 68 : 250

  return (
    <>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div style={{
        marginLeft: sidebarWidth,
        minHeight: '100vh',
        transition: 'margin-left .22s ease',
        background: 'var(--bg)',
      }}>
        <Topbar sidebarWidth={sidebarWidth} />
        <div style={{ padding: '24px 28px' }}>
          <Outlet />
        </div>
      </div>
      <ToastContainer />
    </>
  )
}
