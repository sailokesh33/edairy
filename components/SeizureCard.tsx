'use client'

import { Seizure } from '@/types'

interface Props {
  seizure: Seizure
  onDelete?: (id: string) => void
}

const TYPE_COLORS: Record<string, string> = {
  'focal-aware':    'bg-violet-100 text-violet-700',
  'focal-impaired': 'bg-amber-100 text-amber-700',
  'generalized':    'bg-red-100 text-red-700',
  'unknown':        'bg-gray-100 text-gray-600',
}

const TYPE_LABELS: Record<string, string> = {
  'focal-aware':    'Focal aware',
  'focal-impaired': 'Focal impaired',
  'generalized':    'Generalized',
  'unknown':        'Unknown',
}

function formatDate(date: string, time: string) {
  const d = new Date(`${date}T${time}`)
  return d.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function SeizureCard({ seizure, onDelete }: Props) {
  const allChips = [
    ...seizure.aura,
    ...seizure.during,
    ...seizure.triggers,
    ...seizure.afterEffects,
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">
            {formatDate(seizure.date, seizure.time)}
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[seizure.type]}`}>
              {TYPE_LABELS[seizure.type]}
            </span>
            {seizure.duration && (
              <span className="text-xs text-gray-400">{seizure.duration} min</span>
            )}
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(seizure.id)}
            className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none ml-2"
            aria-label="Delete seizure"
          >
            ×
          </button>
        )}
      </div>

      {/* Chips */}
      {allChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {allChips.map((chip, i) => (
            <span
              key={i}
              className="text-xs bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {seizure.notes && (
        <p className="text-sm text-gray-500 border-t border-gray-50 pt-2 mt-2">
          {seizure.notes}
        </p>
      )}
    </div>
  )
}