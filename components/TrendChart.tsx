'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import { Seizure } from '@/types'

interface Props {
  seizures: Seizure[]
  days?: number
}

function getLast30Days(seizures: Seizure[], days: number) {
  const result = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]

    const count = seizures.filter(s => s.date === dateStr).length

    result.push({
      date: dateStr,
      label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      count,
    })
  }
  return result
}

export default function TrendChart({ seizures, days = 30 }: Props) {
  const data = getLast30Days(seizures, days)
  const hasData = data.some(d => d.count > 0)

  if (!hasData) {
    return (
      <div className="h-32 flex items-center justify-center text-sm text-gray-400">
        No seizures in this period
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          interval={Math.floor(days / 6)}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            boxShadow: 'none',
          }}
          formatter={(val) => [Number(val), 'Seizures']}
          labelFormatter={(label) => String(label)}
        />
        <Bar dataKey="count" fill="#7c3aed" radius={[3, 3, 0, 0]} maxBarSize={16} />
      </BarChart>
    </ResponsiveContainer>
  )
}