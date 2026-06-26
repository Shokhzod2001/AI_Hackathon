import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { ToastContainer } from '@/components/ui/Toast'

export function AppLayout() {
  return (
    <>
      <Sidebar />
      <div style={{ marginLeft: 240, minHeight: '100vh', transition: 'margin-left .25s cubic-bezier(.4,0,.2,1)' }}>
        <Topbar sidebarWidth={240} />
        <div style={{ padding: 24 }}>
          <Outlet />
        </div>
      </div>
      <ToastContainer />
    </>
  )
}
