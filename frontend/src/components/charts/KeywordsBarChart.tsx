import { Bar } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
import type { TopKeyword } from '@/types'

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip)

const GRID = 'rgba(26,39,68,.5)'
const TICK = '#475569'

export function KeywordsBarChart({ data }: { data: TopKeyword[] }) {
  return (
    <div style={{ position: 'relative', height: 160 }}>
      <Bar
        data={{
          labels: data.map((d) => d.word),
          datasets: [{ data: data.map((d) => d.count), backgroundColor: 'rgba(239,68,68,.65)', borderRadius: 4, borderSkipped: false }],
        }}
        options={{
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: GRID }, ticks: { color: TICK, font: { size: 10 } } },
            y: { grid: { color: GRID }, ticks: { color: TICK, font: { size: 10 } } },
          },
        }}
      />
    </div>
  )
}
