import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { mapApi } from '@/api/map'

interface IncidentFeature {
  geometry: { coordinates: [number, number] }
  properties: { name: string; risk_score: number; incidents: number; blocked: number; platforms: string[] }
}

export function MapPage() {
  const mapRef   = useRef<HTMLDivElement>(null)
  const mapInst  = useRef<unknown>(null)
  const layerRef = useRef<unknown[]>([])

  const { data: incidents } = useQuery({
    queryKey: ['incidents'],
    queryFn: mapApi.incidents,
    refetchInterval: 30_000,
  })

  // ── Map init (once) ───────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInst.current) return

    import('leaflet').then((L) => {
      if (!mapRef.current) return

      const map = L.map(mapRef.current, { center: [41.3, 63.5], zoom: 6, zoomControl: true })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CartoDB',
        maxZoom: 19,
      }).addTo(map)

      mapInst.current = map
    })

    return () => {
      if (mapInst.current) {
        ;(mapInst.current as { remove(): void }).remove()
        mapInst.current = null
        layerRef.current = []
      }
    }
  }, [])

  // ── Markers — re-draw whenever incidents change ───────────────
  useEffect(() => {
    if (!mapInst.current || !incidents?.features?.length) return

    import('leaflet').then((L) => {
      const map = mapInst.current as L.Map

      // remove old markers
      layerRef.current.forEach((m) => (m as L.CircleMarker).remove())
      layerRef.current = []

      const getColor = (r: number) => r >= 70 ? '#ef4444' : r >= 40 ? '#f59e0b' : '#22c55e'
      const getRadius = (inc: number) => Math.max(10, Math.min(40, 10 + inc * 1.5))

      incidents.features.forEach((f: IncidentFeature) => {
        const [lng, lat] = f.geometry.coordinates
        const { name, risk_score, incidents: inc, blocked, platforms } = f.properties
        const color  = getColor(risk_score)
        const radius = getRadius(inc)

        const verdictLabel =
          risk_score >= 70 ? '🔴 XAVFLI' : risk_score >= 40 ? '🟡 SHUBHALI' : '🟢 XAVFSIZ'

        const marker = L.circleMarker([lat, lng], {
          radius,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.75,
        })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:190px;padding:4px 2px">
              <div style="font-size:15px;font-weight:700;margin-bottom:6px">${name}</div>
              <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:6px">
                <span style="color:${color};font-size:28px;font-weight:800;line-height:1">${risk_score}</span>
                <span style="color:#888;font-size:12px">/ 100 risk ball</span>
              </div>
              <div style="font-size:12px;font-weight:600;color:${color};margin-bottom:8px">${verdictLabel}</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;color:#555">
                <span>Jami hodisa:</span><b>${inc} ta</b>
                <span>Bloklangan:</span><b style="color:#ef4444">${blocked} ta</b>
                <span>Platforma:</span><b>${platforms?.join(', ') || 'telegram'}</b>
              </div>
            </div>
          `, { maxWidth: 240 })

        layerRef.current.push(marker)
      })
    })
  }, [incidents])

  const features: IncidentFeature[] = incidents?.features ?? []
  const highRisk = features.filter(f => f.properties.risk_score >= 70).length
  const midRisk  = features.filter(f => f.properties.risk_score >= 40 && f.properties.risk_score < 70).length
  const lowRisk  = features.length - highRisk - midRisk

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Geografik xarita</h1>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
            O'zbekiston bo'yicha narkotik hodisalar — real ma'lumotlar
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {([
            ['🔴', `${highRisk}`, 'Yuqori xavf', '#ef4444'],
            ['🟡', `${midRisk}`,  "O'rta xavf",  '#f59e0b'],
            ['🟢', `${lowRisk}`,  'Past xavf',   '#22c55e'],
          ] as const).map(([icon, count, label, color]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color }}>{count}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{icon} {label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 16 }}>

        {/* Map */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          height: 540,
        }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* City ranking */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 16,
            flex: 1,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Shaharlar reytingi</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...features]
                .sort((a, b) => b.properties.risk_score - a.properties.risk_score)
                .map((f, i) => {
                  const rc = f.properties.risk_score >= 70 ? '#ef4444'
                           : f.properties.risk_score >= 40 ? '#f59e0b' : '#22c55e'
                  const dot = f.properties.risk_score >= 70 ? '🔴' : f.properties.risk_score >= 40 ? '🟡' : '🟢'
                  return (
                    <div key={f.properties.name}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: 'var(--muted)', width: 14 }}>{i + 1}</span>
                        <span style={{ fontSize: 11 }}>{dot}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{f.properties.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: rc }}>{f.properties.risk_score}</span>
                        <span style={{ fontSize: 10, color: 'var(--muted)' }}>{f.properties.incidents} ta</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 3, background: 'var(--bg3)', overflow: 'hidden', marginLeft: 22 }}>
                        <div style={{
                          height: '100%',
                          width: `${f.properties.risk_score}%`,
                          background: `linear-gradient(90deg, ${rc}88, ${rc})`,
                          borderRadius: 3,
                          transition: 'width .6s ease',
                        }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Legend */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 16,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Belgilar izohi</div>
            {([
              ['🔴 Qizil doira',   'Yuqori xavf ≥ 70'],
              ["🟡 Sariq doira",   "O'rta xavf 40–69"],
              ['🟢 Yashil doira',  'Past xavf < 40'],
              ['Doira hajmi',      'Hodisa soniga mutanosib'],
            ] as const).map(([k, v]) => (
              <div key={k} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '5px 0',
                borderBottom: '1px solid var(--border)',
                fontSize: 11,
              }}>
                <span style={{ color: 'var(--muted)' }}>{k}</span>
                <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
