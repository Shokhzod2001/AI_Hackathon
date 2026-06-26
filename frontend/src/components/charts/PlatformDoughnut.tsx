import { Doughnut } from 'react-chartjs-2'
import { Chart, ArcElement, Legend, Tooltip } from 'chart.js'
import type { PlatformStats } from '@/types'

Chart.register(ArcElement, Legend, Tooltip)

export function PlatformDoughnut({ data }: { data: PlatformStats }) {
  return (
    <div style={{ position: 'relative', height: 200 }}>
      <Doughnut
        data={{
          labels: data.labels,
          datasets: [{ data: data.values, backgroundColor: ['#3b82f6','#ec4899','#f59e0b','#8b5cf6'], borderWidth: 0, hoverOffset: 6 }],
        }}
        options={{
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#475569', font: { size: 10 }, padding: 10, boxWidth: 10 } } },
          cutout: '65%',
        }}
      />
    </div>
  )
}
