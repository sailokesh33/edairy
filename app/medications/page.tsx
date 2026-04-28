'use client'

import { useState } from 'react'
import { useMedications } from '@/hooks/useMedications'
import { logMedication, getMedicationLogs } from '@/lib/storage'
import { Medication } from '@/types'

const MED_COLORS = [
  { label: 'Violet', class: 'bg-violet-400' },
  { label: 'Blue',   class: 'bg-blue-400' },
  { label: 'Teal',   class: 'bg-teal-400' },
  { label: 'Green',  class: 'bg-green-400' },
  { label: 'Amber',  class: 'bg-amber-400' },
  { label: 'Red',    class: 'bg-red-400' },
]

const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
]

function AddMedForm({ onSave, onCancel }: {
  onSave: (data: Omit<Medication, 'id'>) => void
  onCancel: () => void
}) {
  const [name, setName]           = useState('')
  const [dose, setDose]           = useState('')
  const [frequency, setFrequency] = useState('Twice daily')
  const [times, setTimes]         = useState(['08:00', '20:00'])
  const [color, setColor]         = useState('bg-violet-400')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes]         = useState('')

  const updateTime = (i: number, val: string) => {
    const next = [...times]
    next[i] = val
    setTimes(next)
  }

  const handleFrequencyChange = (f: string) => {
    setFrequency(f)
    if (f === 'Once daily')         setTimes(['08:00'])
    if (f === 'Twice daily')        setTimes(['08:00', '20:00'])
    if (f === 'Three times daily')  setTimes(['08:00', '14:00', '20:00'])
    if (f === 'Every 8 hours')      setTimes(['06:00', '14:00', '22:00'])
    if (f === 'Every 12 hours')     setTimes(['08:00', '20:00'])
    if (f === 'As needed')          setTimes([])
  }

  const handleSave = () => {
    if (!name.trim() || !dose.trim()) return
    onSave({
      name: name.trim(),
      dose: dose.trim(),
      frequency,
      times,
      color,
      active: true,
      startDate,
      notes,
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
      <h2 className="text-sm font-medium text-gray-700 mb-4">Add medication</h2>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Medicine name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Lacosamide"
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Dose</label>
          <input
            value={dose}
            onChange={e => setDose(e.target.value)}
            placeholder="e.g. 250mg"
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">Frequency</label>
        <div className="flex flex-wrap gap-2">
          {FREQUENCY_OPTIONS.map(f => (
            <button
              key={f}
              type="button"
              onClick={() => handleFrequencyChange(f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                frequency === f
                  ? 'bg-violet-100 border-violet-400 text-violet-700 font-medium'
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {times.length > 0 && (
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Scheduled times</label>
          <div className="flex gap-2 flex-wrap">
            {times.map((t, i) => (
              <input
                key={i}
                type="time"
                value={t}
                onChange={e => updateTime(i, e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            ))}
          </div>
        </div>
      )}

      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">Start date</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
      </div>

      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-2 block">Colour</label>
        <div className="flex gap-2">
          {MED_COLORS.map(c => (
            <button
              key={c.class}
              type="button"
              onClick={() => setColor(c.class)}
              className={`w-7 h-7 rounded-full ${c.class} transition-all ${
                color === c.class ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs text-gray-500 mb-1 block">Notes (optional)</label>
        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Take with food"
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 bg-violet-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-violet-700 transition-colors"
        >
          Save medication
        </button>
        <button
          onClick={onCancel}
          className="px-4 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function MedCard({
  med,
  onToggleActive,
  onDelete,
  onLogDose,
  takenToday,
}: {
  med: Medication
  onToggleActive: () => void
  onDelete: () => void
  onLogDose: (scheduledTime: string) => void
  takenToday: string[]
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`bg-white rounded-2xl border p-4 transition-all ${
      med.active ? 'border-gray-100' : 'border-gray-100 opacity-60'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full shrink-0 ${med.color}`} />
          <div>
            <p className="text-sm font-medium text-gray-900">{med.name}</p>
            <p className="text-xs text-gray-400">{med.dose} · {med.frequency}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50"
          >
            {expanded ? 'Less' : 'More'}
          </button>
        </div>
      </div>

      {/* Today's dose tracker */}
      {med.active && med.times.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <p className="text-xs text-gray-400 mb-2">Today's doses</p>
          <div className="flex gap-2 flex-wrap">
            {med.times.map((t, i) => {
              const taken = takenToday.includes(t)
              return (
                <button
                  key={i}
                  onClick={() => !taken && onLogDose(t)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                    taken
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-violet-300 hover:bg-violet-50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${taken ? 'bg-green-500' : 'bg-gray-300'}`} />
                  {t} {taken ? '· taken' : '· tap to log'}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-50 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Started</span>
            <span className="text-gray-600">
              {new Date(med.startDate).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </span>
          </div>
          {med.notes && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Notes</span>
              <span className="text-gray-600">{med.notes}</span>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onToggleActive}
              className="flex-1 text-xs py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
            >
              {med.active ? 'Mark inactive' : 'Mark active'}
            </button>
            <button
              onClick={onDelete}
              className="text-xs py-1.5 px-3 border border-red-100 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MedicationsPage() {
  const { medications, add, update, remove } = useMedications()
  const [showForm, setShowForm] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]

  const logs = getMedicationLogs().filter(l =>
    l.takenAt.startsWith(todayStr) && l.taken
  )

  const getTakenTimesToday = (medId: string) =>
    logs.filter(l => l.medicationId === medId).map(l => l.scheduled)

  const handleLogDose = (medId: string, scheduledTime: string) => {
    logMedication({
      medicationId: medId,
      takenAt: new Date().toISOString(),
      scheduled: scheduledTime,
      taken: true,
      notes: '',
    })
    // force re-render
    window.location.reload()
  }

  const activeMeds   = medications.filter(m => m.active)
  const inactiveMeds = medications.filter(m => !m.active)

  return (
    <main className="max-w-lg mx-auto px-4 py-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-900">Medications</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-violet-700 transition-colors"
          >
            + Add
          </button>
        )}
      </div>

      {showForm && (
        <AddMedForm
          onSave={data => { add(data); setShowForm(false) }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Today's overview */}
      {activeMeds.length > 0 && (
        <div className="bg-violet-50 rounded-2xl p-4 mb-4">
          <p className="text-xs font-medium text-violet-700 mb-1">Today's overview</p>
          {(() => {
            const totalDoses  = activeMeds.reduce((n, m) => n + m.times.length, 0)
            const takenDoses  = activeMeds.reduce(
              (n, m) => n + getTakenTimesToday(m.id).length, 0
            )
            const missedSoFar = activeMeds.reduce((n, m) => {
              const nowMins = new Date().getHours() * 60 + new Date().getMinutes()
              return n + m.times.filter(t => {
                const [h, min] = t.split(':').map(Number)
                return h * 60 + min < nowMins - 30 &&
                       !getTakenTimesToday(m.id).includes(t)
              }).length
            }, 0)
            return (
              <div className="flex gap-4">
                <div>
                  <p className="text-2xl font-medium text-violet-900">
                    {takenDoses}/{totalDoses}
                  </p>
                  <p className="text-xs text-violet-500">doses taken</p>
                </div>
                {missedSoFar > 0 && (
                  <div>
                    <p className="text-2xl font-medium text-red-500">{missedSoFar}</p>
                    <p className="text-xs text-red-400">missed</p>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {/* Active meds */}
      {activeMeds.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm mb-3">No medications added yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-violet-600 hover:underline"
          >
            Add your first medication →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-4">
          {activeMeds.map(med => (
            <MedCard
              key={med.id}
              med={med}
              takenToday={getTakenTimesToday(med.id)}
              onToggleActive={() => update(med.id, { active: !med.active })}
              onDelete={() => remove(med.id)}
              onLogDose={t => handleLogDose(med.id, t)}
            />
          ))}
        </div>
      )}

      {/* Inactive meds */}
      {inactiveMeds.length > 0 && (
        <>
          <p className="text-xs text-gray-400 mb-2 mt-4">Inactive / past medications</p>
          <div className="flex flex-col gap-3">
            {inactiveMeds.map(med => (
              <MedCard
                key={med.id}
                med={med}
                takenToday={[]}
                onToggleActive={() => update(med.id, { active: !med.active })}
                onDelete={() => remove(med.id)}
                onLogDose={() => {}}
              />
            ))}
          </div>
        </>
      )}
    </main>
  )
}