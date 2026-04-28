'use client'

import { useState, useMemo } from 'react'
import { useSeizures } from '@/hooks/useSeizures'
import SeizureCard from '@/components/SeizureCard'
import { SeizureType } from '@/types'
import Link from 'next/link'

const TYPE_FILTERS: { value: SeizureType | 'all'; label: string }[] = [
  { value: 'all',            label: 'All' },
  { value: 'focal-aware',    label: 'Focal aware' },
  { value: 'focal-impaired', label: 'Focal impaired' },
  { value: 'generalized',    label: 'Generalized' },
  { value: 'unknown',        label: 'Unknown' },
]

const TIME_FILTERS = [
  { value: 'all',   label: 'All time' },
  { value: 'week',  label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: '3months', label: 'Last 3 months' },
]

export default function HistoryPage() {
  const { seizures, remove, loading } = useSeizures()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<SeizureType | 'all'>('all')
  const [timeFilter, setTimeFilter] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const now = new Date()
    return seizures.filter(s => {
      // time filter
      if (timeFilter !== 'all') {
        const d = new Date(s.date)
        if (timeFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 864e5)
          if (d < weekAgo) return false
        } else if (timeFilter === 'month') {
          if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())
            return false
        } else if (timeFilter === '3months') {
          const threeMonthsAgo = new Date(now.getTime() - 90 * 864e5)
          if (d < threeMonthsAgo) return false
        }
      }

      // type filter
      if (typeFilter !== 'all' && s.type !== typeFilter) return false

      // search
      if (search.trim()) {
        const q = search.toLowerCase()
        const haystack = [
          s.notes,
          ...s.aura,
          ...s.during,
          ...s.triggers,
          ...s.afterEffects,
        ].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }

      return true
    })
  }, [seizures, typeFilter, timeFilter, search])

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      remove(id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
      // auto-cancel confirm after 3s
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  if (loading) {
    return (
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="text-gray-400 text-sm">Loading...</div>
      </main>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-6 pb-24">
      <h1 className="text-xl font-medium text-gray-900 mb-4">History</h1>

      {/* Search */}
      <div className="relative mb-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notes, triggers, symptoms..."
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Time filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-2 scrollbar-hide">
        {TIME_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setTimeFilter(f.value)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${
              timeFilter === f.value
                ? 'bg-violet-100 border-violet-400 text-violet-700 font-medium'
                : 'bg-white border-gray-200 text-gray-500'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {TYPE_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${
              typeFilter === f.value
                ? 'bg-gray-800 border-gray-800 text-white font-medium'
                : 'bg-white border-gray-200 text-gray-500'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400 mb-3">
        {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
        {filtered.length !== seizures.length && ` of ${seizures.length} total`}
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">
            {seizures.length === 0
              ? 'No seizures logged yet.'
              : 'No entries match your filters.'}
          </p>
          {seizures.length === 0 && (
<Link
  href="/log"
  className="inline-block mt-3 text-sm text-violet-600 hover:underline"
>
  Log your first seizure →
</Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(s => (
            <div key={s.id}>
              {confirmDelete === s.id && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2 mb-1 flex items-center justify-between">
                  <span className="text-xs text-red-600">Tap × again to confirm delete</span>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <SeizureCard
                seizure={s}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  )
}