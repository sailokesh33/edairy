'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useSeizures } from '@/hooks/useSeizures'
import { useMedications } from '@/hooks/useMedications'
import TrendChart from '@/components/TrendChart'

function StatCard({
  label,
  value,
  sub,
  color = 'gray',
}: {
  label: string
  value: string | number
  sub?: string
  color?: 'gray' | 'violet' | 'amber' | 'red' | 'green'
}) {
  const colors = {
    gray:   'bg-gray-50',
    violet: 'bg-violet-50',
    amber:  'bg-amber-50',
    red:    'bg-red-50',
    green:  'bg-green-50',
  }
  return (
    <div className={`${colors[color]} rounded-2xl p-4`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-medium text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function TrendBadge({ thisWeek, lastWeek }: { thisWeek: number; lastWeek: number }) {
  if (thisWeek === 0 && lastWeek === 0) return null
  if (lastWeek === 0) return (
    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
      New this week
    </span>
  )
  const diff = thisWeek - lastWeek
  if (diff === 0) return (
    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
      Same as last week
    </span>
  )
  if (diff < 0) return (
    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
      {Math.abs(diff)} fewer than last week
    </span>
  )
  return (
    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
      {diff} more than last week
    </span>
  )
}

export default function DashboardPage() {
  const { seizures, stats, loading } = useSeizures()
  const { medications } = useMedications()

  const lastWeekCount = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 864e5)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 864e5)
    return seizures.filter(s => {
      const d = new Date(s.date)
      return d >= twoWeeksAgo && d < weekAgo
    }).length
  }, [seizures])

  const lastSeizure = seizures[0]
  const daysSinceLastSeizure = lastSeizure
    ? Math.floor(
        (Date.now() - new Date(lastSeizure.date).getTime()) / 864e5
      )
    : null

  const activeMeds = medications.filter(m => m.active)

  if (loading) {
    return (
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="text-gray-400 text-sm">Loading...</div>
      </main>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-6 pb-24">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">SeizureLog</h1>
          <p className="text-sm text-gray-400">
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}
          </p>
        </div>
        <Link
          href="/log"
          className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-violet-700 active:scale-95 transition-all"
        >
          + Log
        </Link>
      </div>

      {/* No data state */}
      {seizures.length === 0 && (
        <div className="bg-violet-50 rounded-2xl p-5 mb-4 text-center">
          <p className="text-sm text-violet-700 font-medium mb-1">Welcome to SeizureLog</p>
          <p className="text-xs text-violet-500 mb-3">
            Start logging seizures to see your trends and generate doctor reports.
          </p>
          <Link
            href="/log"
            className="inline-block bg-violet-600 text-white text-sm px-4 py-2 rounded-xl"
          >
            Log your first seizure
          </Link>
        </div>
      )}

      {/* Stats grid */}
      {seizures.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard
              label="This week"
              value={stats.thisWeek}
              sub="seizures"
              color={stats.thisWeek >= 3 ? 'red' : stats.thisWeek >= 1 ? 'amber' : 'green'}
            />
            <StatCard
              label="This month"
              value={stats.thisMonth}
              sub="seizures"
              color="violet"
            />
            <StatCard
              label="Days since last"
              value={daysSinceLastSeizure === 0 ? 'Today' : daysSinceLastSeizure ?? '—'}
              sub={daysSinceLastSeizure !== null && daysSinceLastSeizure > 0 ? 'days seizure-free' : undefined}
              color={daysSinceLastSeizure === null ? 'gray' : daysSinceLastSeizure >= 7 ? 'green' : 'gray'}
            />
            <StatCard
              label="Total logged"
              value={stats.total}
              sub="all time"
            />
          </div>

          {/* Trend badge */}
          <div className="mb-4">
            <TrendBadge thisWeek={stats.thisWeek} lastWeek={lastWeekCount} />
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-700">Last 30 days</h2>
              {stats.topTrigger && (
                <span className="text-xs text-gray-400">
                  Top trigger: <span className="text-gray-600">{stats.topTrigger}</span>
                </span>
              )}
            </div>
            <TrendChart seizures={seizures} days={30} />
          </div>

          {/* Last seizure detail */}
          {lastSeizure && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
              <h2 className="text-sm font-medium text-gray-700 mb-2">Last seizure</h2>
              <p className="text-xs text-gray-400 mb-2">
                {new Date(`${lastSeizure.date}T${lastSeizure.time}`).toLocaleString('en-GB', {
                  weekday: 'short', day: 'numeric', month: 'short',
                  hour: '2-digit', minute: '2-digit',
                })}
                {lastSeizure.duration ? ` · ${lastSeizure.duration} min` : ''}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[...lastSeizure.aura, ...lastSeizure.triggers].map((chip, i) => (
                  <span
                    key={i}
                    className="text-xs bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Medications summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-700">Medications</h2>
          <Link href="/medications" className="text-xs text-violet-500 hover:underline">
            Manage →
          </Link>
        </div>
        {activeMeds.length === 0 ? (
          <p className="text-xs text-gray-400">No medications added yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {activeMeds.map(med => (
              <div key={med.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${med.color || 'bg-violet-400'}`} />
                  <span className="text-sm text-gray-700">{med.name}</span>
                </div>
                <span className="text-xs text-gray-400">{med.dose} · {med.frequency}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  )
}