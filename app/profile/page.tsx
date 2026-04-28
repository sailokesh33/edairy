'use client'

import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '@/lib/storage'
import { Profile } from '@/types'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
      <h2 className="text-sm font-medium text-gray-700 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white text-gray-900"
      />
    </div>
  )
}

export default function ProfilePage() {
  const [form, setForm] = useState<Profile>({
    name: '',
    dateOfBirth: '',
    diagnosisType: '',
    neurologist: '',
    emergencyContact: '',
    emergencyPhone: '',
  })
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const p = getProfile()
    setForm(p)
  }, [])

  const update = (field: keyof Profile, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
    setSaved(false)
  }

  const handleSave = () => {
    updateProfile(form)
    setSaved(true)
    setHasChanges(false)
    setTimeout(() => setSaved(false), 2500)
  }

  const initials = form.name
    ? form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <main className="max-w-lg mx-auto px-4 py-6 pb-24">

      {/* Avatar + name header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
          <span className="text-violet-700 text-lg font-medium">{initials}</span>
        </div>
        <div>
          <h1 className="text-xl font-medium text-gray-900">
            {form.name || 'Your profile'}
          </h1>
          {form.diagnosisType && (
            <p className="text-sm text-gray-400">{form.diagnosisType}</p>
          )}
        </div>
      </div>

      {/* Personal info */}
      <Section title="Personal information">
        <Field
          label="Full name"
          value={form.name}
          onChange={v => update('name', v)}
          placeholder="e.g. Loki Vunna"
        />
        <Field
          label="Date of birth"
          value={form.dateOfBirth}
          onChange={v => update('dateOfBirth', v)}
          placeholder="e.g. 15/03/1990"
          type="text"
        />
      </Section>

      {/* Medical info */}
      <Section title="Medical information">
        <Field
          label="Diagnosis"
          value={form.diagnosisType}
          onChange={v => update('diagnosisType', v)}
          placeholder="e.g. Left temporal lobe epilepsy"
        />
        <Field
          label="Neurologist / doctor name"
          value={form.neurologist}
          onChange={v => update('neurologist', v)}
          placeholder="e.g. Dr. Sharma"
        />

        {/* Seizure type summary — read only */}
        <div className="mt-3 pt-3 border-t border-gray-50">
          <p className="text-xs text-gray-400 mb-1">Typical seizure type</p>
          <p className="text-sm text-gray-600">
            {form.diagnosisType
              ? 'Focal aware seizures (left temporal lobe)'
              : 'Not set — will appear on your PDF report'}
          </p>
        </div>
      </Section>

      {/* Emergency contact */}
      <Section title="Emergency contact">
        <div className="bg-red-50 rounded-xl p-3 mb-3">
          <p className="text-xs text-red-600">
            This information will appear on your PDF report so doctors and caregivers can be contacted quickly.
          </p>
        </div>
        <Field
          label="Contact name"
          value={form.emergencyContact}
          onChange={v => update('emergencyContact', v)}
          placeholder="e.g. Mum / Dad / Spouse"
        />
        <Field
          label="Phone number"
          value={form.emergencyPhone}
          onChange={v => update('emergencyPhone', v)}
          placeholder="e.g. +91 98765 43210"
          type="tel"
        />
      </Section>

      {/* App data section */}
      <Section title="App data">
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm text-gray-700">Export all data</p>
            <p className="text-xs text-gray-400">Download a JSON backup of everything</p>
          </div>
          <button
            onClick={() => {
              const { exportData } = require('@/lib/storage')
              const data = exportData()
              const blob = new Blob([data], { type: 'application/json' })
              const url  = URL.createObjectURL(blob)
              const a    = document.createElement('a')
              a.href     = url
              a.download = `seizurelog_backup_${new Date().toISOString().split('T')[0]}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="text-xs text-violet-600 border border-violet-200 px-3 py-1.5 rounded-xl hover:bg-violet-50 transition-colors"
          >
            Export
          </button>
        </div>

        <div className="flex items-center justify-between py-1 border-t border-gray-50 mt-2 pt-3">
          <div>
            <p className="text-sm text-gray-700">Import data</p>
            <p className="text-xs text-gray-400">Restore from a JSON backup</p>
          </div>
          <label className="text-xs text-violet-600 border border-violet-200 px-3 py-1.5 rounded-xl hover:bg-violet-50 transition-colors cursor-pointer">
            Import
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = ev => {
                  try {
                    const { importData } = require('@/lib/storage')
                    importData(ev.target?.result as string)
                    window.location.reload()
                  } catch {
                    alert('Invalid backup file.')
                  }
                }
                reader.readAsText(file)
              }}
            />
          </label>
        </div>

        <div className="flex items-center justify-between py-1 border-t border-gray-50 mt-2 pt-3">
          <div>
            <p className="text-sm text-red-500">Clear all data</p>
            <p className="text-xs text-gray-400">Permanently delete everything</p>
          </div>
          <button
            onClick={() => {
              if (confirm('This will permanently delete ALL your seizure logs, medications and profile. Are you sure?')) {
                const { clearAllData } = require('@/lib/storage')
                clearAllData()
                window.location.reload()
              }
            }}
            className="text-xs text-red-400 border border-red-100 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </Section>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!hasChanges}
        className={`w-full py-3.5 rounded-2xl text-base font-medium transition-all ${
          saved
            ? 'bg-green-100 text-green-700'
            : hasChanges
            ? 'bg-violet-600 text-white hover:bg-violet-700 active:scale-95'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {saved ? 'Saved!' : hasChanges ? 'Save profile' : 'No changes'}
      </button>

    </main>
  )
}