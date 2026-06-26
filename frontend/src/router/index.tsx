import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const ScannerPage = lazy(() => import('@/pages/ScannerPage').then((m) => ({ default: m.ScannerPage })))
const AlertsPage = lazy(() => import('@/pages/AlertsPage').then((m) => ({ default: m.AlertsPage })))
const MapPage = lazy(() => import('@/pages/MapPage').then((m) => ({ default: m.MapPage })))
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const AdminPage = lazy(() => import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })))

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

const Loader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
    <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }} />
  </div>
)

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={<PrivateRoute><AppLayout /></PrivateRoute>}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Suspense fallback={<Loader />}><DashboardPage /></Suspense>} />
          <Route path="scanner" element={<Suspense fallback={<Loader />}><ScannerPage /></Suspense>} />
          <Route path="alerts" element={<Suspense fallback={<Loader />}><AlertsPage /></Suspense>} />
          <Route path="map" element={<Suspense fallback={<Loader />}><MapPage /></Suspense>} />
          <Route path="reports" element={<Suspense fallback={<Loader />}><ReportsPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<Loader />}><SettingsPage /></Suspense>} />
          <Route path="admin" element={<Suspense fallback={<Loader />}><AdminPage /></Suspense>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
