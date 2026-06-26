import { Bar } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, BarElement, Legend, Tooltip } from 'chart.js'
import type { WeeklyStats } from '@/types'

Chart.register(CategoryScale, LinearScale, BarElement, Legend, Tooltip)

const GRID = 'rgba(26,39,68,.5)'
const TICK = '#475569'

export function WeeklyBarChart({ data }: { data: WeeklyStats }) {
  return (
    <div style={{ position: 'relative', height: 200 }}>
      <Bar
        data={{
          labels: data.labels,
          datasets: [
            { label: 'Aniqlangan', data: data.detected, backgroundColor: 'rgba(239,68,68,.7)', borderRadius: 5, borderSkipped: false },
            { label: 'Bloklangan', data: data.blocked, backgroundColor: 'rgba(59,130,246,.55)', borderRadius: 5, borderSkipped: false },
          ],
        }}
        options={{
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: true, labels: { color: TICK, font: { size: 10 }, boxWidth: 10 } } },
          scales: {
            x: { grid: { color: GRID }, ticks: { color: TICK, font: { size: 10 } } },
            y: { grid: { color: GRID }, ticks: { color: TICK, font: { size: 10 } } },
          },
        }}
      />
    </div>
  )
}
