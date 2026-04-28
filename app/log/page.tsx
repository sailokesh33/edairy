'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSeizures } from '@/hooks/useSeizures'
import ChipSelector from '@/components/ChipSelector'
import { SeizureType } from '@/types'

const AURA_OPTIONS = [
  'Tingling', 'Confusion', "Can't read words", 'Strange smell',
  'Fear / anxiety', 'Déjà vu', 'Stomach rising', 'No warning',
]

const DURING_OPTIONS = [
  'Stayed aware', 'Lost awareness', 'Shaking / jerking',
  'Stared blankly', "Couldn't speak", 'Fell down', 'Lip smacking',
]

const TRIGGER_OPTIONS = [
  'Poor sleep', 'Stress', 'Missed medicine', 'Flashing lights',
  'Alcohol', 'Illness / fever', 'Menstrual cycle', 'Unknown',
]

const AFTER_OPTIONS = [
  'Tired / sleepy', 'Headache', 'Confused', 'Normal quickly',
  'Memory gap', 'Sore muscles', 'Emotional',
]

const SEIZURE_TYPES: { value: SeizureType; label: string }[] = [
  { value: 'focal-aware', label: 'Focal aware' },
  { value: 'focal-impaired', label: 'Focal impaired' },
  { value: 'generalized', label: 'Generalized' },
  { value: 'unknown', label: 'Not sure' },
]

export default function LogPage() {
  const router = useRouter()
  const { add } = useSeizures()

  const now = new Date()
  const [date, setDate] = useState(now.toISOString().split('T')[0])
  const [time, setTime] = useState(now.toTimeString().slice(0, 5))
  const [duration, setDuration] = useState('')
  const [type, setType] = useState<SeizureType>('focal-aware')
  const [aura, setAura] = useState<string[]>([])
  const [during, setDuring] = useState<string[]>([])
  const [triggers, setTriggers] = useState<string[]>([])
  const [afterEffects, setAfterEffects] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    add({
      date,
      time,
      duration: duration ? parseFloat(duration) : null,
      type,
      aura,
      during,
      triggers,
      afterEffects,
      notes,
    })
    setSaved(true)
    setTimeout(() => router.push('/history'), 1200)
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-6 pb-24">
      <h1 className="text-xl font-medium text-gray-900 mb-6">Log a seizure</h1>

      {/* Date / Time / Duration */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Time</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Duration (min)</label>
            <input
              type="number"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="e.g. 2"
              min="0"
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5"
            />
          </div>
        </div>
      </section>

      {/* Seizure type */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Seizure type</h2>
        <div className="grid grid-cols-2 gap-2">
          {SEIZURE_TYPES.map(st => (
            <button
              key={st.value}
              type="button"
              onClick={() => setType(st.value)}
              className={`py-2 px-3 rounded-xl text-sm border transition-all ${
                type === st.value
                  ? 'bg-violet-100 border-violet-400 text-violet-800 font-medium'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </section>

      {/* Aura */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">
          Warning signs before (aura)
        </h2>
        <ChipSelector options={AURA_OPTIONS} selected={aura} onChange={setAura} />
      </section>

      {/* During */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">During the seizure</h2>
        <ChipSelector options={DURING_OPTIONS} selected={during} onChange={setDuring} />
      </section>

      {/* Triggers */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Possible triggers</h2>
        <ChipSelector options={TRIGGER_OPTIONS} selected={triggers} onChange={setTriggers} />
      </section>

      {/* After effects */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">How you felt after</h2>
        <ChipSelector options={AFTER_OPTIONS} selected={afterEffects} onChange={setAfterEffects} />
      </section>

      {/* Notes */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Extra notes</h2>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Anything else to remember..."
          rows={3}
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
      </section>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saved}
        className={`w-full py-3.5 rounded-2xl text-base font-medium transition-all ${
          saved
            ? 'bg-green-100 text-green-700'
            : 'bg-violet-600 text-white hover:bg-violet-700 active:scale-95'
        }`}
      >
        {saved ? 'Saved! Redirecting...' : 'Save to diary'}
      </button>
    </main>
  )
}