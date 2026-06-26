import { useEffect, useRef } from 'react'

export function useLiveFeed(onMessage: (data: unknown) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const retries = useRef(0)

  useEffect(() => {
    const connect = () => {
      const token = localStorage.getItem('access_token')
      const url = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/live-feed${token ? `?token=${token}` : ''}`
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onmessage = (e) => {
        try { onMessage(JSON.parse(e.data)) } catch { /* ignore */ }
      }

      ws.onclose = () => {
        if (retries.current < 5) {
          retries.current++
          setTimeout(connect, 3000)
        }
      }

      ws.onerror = () => ws.close()
    }

    connect()
    return () => wsRef.current?.close()
  }, [onMessage])
}
