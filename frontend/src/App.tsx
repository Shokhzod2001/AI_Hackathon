import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppRouter } from '@/router'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ThemeInit() {
  const theme = useThemeStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  return null
}

function AuthInit() {
  const { accessToken, user, loadUser } = useAuthStore()
  useEffect(() => {
    // If we have a token but no user object (e.g. after page refresh), re-fetch the user
    if (accessToken && !user) {
      loadUser()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInit />
      <AuthInit />
      <AppRouter />
    </QueryClientProvider>
  )
}
