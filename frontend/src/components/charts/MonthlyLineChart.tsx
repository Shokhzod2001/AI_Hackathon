import { Line } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js'
import type { MonthlyStats } from '@/types'

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const GRID = 'rgba(26,39,68,.5)'
const TICK = '#475569'

export function MonthlyLineChart({ data }: { data: MonthlyStats }) {
  return (
    <div style={{ position: 'relative', height: 250 }}>
      <Line
        data={{
          labels: data.labels,
          datasets: [{
            data: data.values,
            borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,.08)',
            tension: .4, fill: true, pointRadius: 4, pointBackgroundColor: '#06b6d4', pointBorderWidth: 0,
          }],
        }}
        options={{
          responsive: true, maintainAspectRatio: false,
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
