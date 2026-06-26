import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { mapApi } from '@/api/map'

export function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<unknown>(null)
  const { data: incidents } = useQuery({ queryKey: ['incidents'], queryFn: mapApi.incidents, refetchInterval: 30_000 })

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    import('leaflet').then((L) => {
      if (!mapRef.current) return

      const map = L.map(mapRef.current, { center: [41.3, 64.6], zoom: 6, zoomControl: true })
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CartoDB',
        maxZoom: 19,
      }).addTo(map)

      mapInstance.current = map

      const getColor = (risk: number) => risk >= 70 ? '#ef4444' : risk >= 40 ? '#f59e0b' : '#10b981'

      if (incidents?.features) {
        incidents.features.forEach((f: { geometry: { coordinates: [number, number] }; properties: { name: string; risk_score: number; incidents: number; platforms: string[] } }) => {
          const { coordinates } = f.geometry
          const { name, risk_score, incidents: inc, platforms } = f.properties
          const color = getColor(risk_score)

          L.circleMarker([coordinates[1], coordinates[0]], {
            radius: 10 + inc * 2,
            fillColor: color,
            color,
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.4,
          })
            .addTo(map as L.Map)
            .bindPopup(`
              <div style="font-family:sans-serif;min-width:160px">
                <b style="font-size:14px">${name}</b><br/>
                <span style="color:${color};font-weight:700;font-size:20px">${risk_score}</span>
                <span style="color:#666;font-size:12px"> / 100 risk ball</span><br/>
                <span style="color:#888;font-size:11px">${inc} ta hodisa</span><br/>
                <span style="color:#888;font-size:11px">${platforms?.join(', ')}</span>
              </div>
            `)
        })
      }
    })

    return () => {
      if (mapInstance.current) {
        (mapInstance.current as { remove(): void }).remove()
        mapInstance.current = null
      }
    }
  }, [incidents])

  const cities = incidents?.features ?? []
  const highRisk = cities.filter((f: { properties: { risk_score: number } }) => f.properties.risk_score >= 70).length
  const medRisk = cities.filter((f: { properties: { risk_score: number } }) => f.properties.risk_score >= 40 && f.properties.risk_score < 70).length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Geografik xarita</h1>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>O'zbekiston bo'yicha narkotik hodisalar xaritasi</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {[['🔴', `${highRisk} Yuqori xavf`, '#ef4444'], ['🟡', `${medRisk} O'rta xavf`, '#f59e0b'], ['🟢', `${cities.length - highRisk - medRisk} Past xavf`, '#10b981']].map(([icon, label, color]) => (
            <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
              <span>{icon}</span>
              <span style={{ color: color as string, fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', height: 520 }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Shaharlar reytingi</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...cities]
                .sort((a: { properties: { risk_score: number } }, b: { properties: { risk_score: number } }) => b.properties.risk_score - a.properties.risk_score)
                .slice(0, 9)
                .map((f: { properties: { name: string; risk_score: number; incidents: number } }, i: number) => {
                  const rc = f.properties.risk_score >= 70 ? '#ef4444' : f.properties.risk_score >= 40 ? '#f59e0b' : '#10b981'
                  return (
                    <div key={f.properties.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 10, color: 'var(--muted)', width: 16, textAlign: 'right' }}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{f.properties.name}</div>
                        <div style={{ height: 4, borderRadius: 2, background: 'var(--bg3)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${f.properties.risk_score}%`, background: rc, borderRadius: 2 }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: rc, minWidth: 28, textAlign: 'right' }}>{f.properties.risk_score}</span>
                    </div>
                  )
                })}
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Afsonaviy belgi</div>
            {[['🔴 Katta doira', 'Yuqori risk ≥70'], ['🟡 O\'rta doira', 'O\'rta risk 40–69'], ['🟢 Kichik doira', 'Past risk <40'], ['Doira hajmi', 'Hodisa soni bilan mutanosib']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(26,39,68,.3)', fontSize: 11 }}>
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
