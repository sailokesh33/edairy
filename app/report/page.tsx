'use client'

import { useState, useRef } from 'react'
import { useSeizures } from '@/hooks/useSeizures'
import { useMedications } from '@/hooks/useMedications'
import { getProfile } from '@/lib/storage'

const RANGE_OPTIONS = [
  { value: 30,  label: 'Last 30 days' },
  { value: 90,  label: 'Last 3 months' },
  { value: 180, label: 'Last 6 months' },
  { value: 999, label: 'All time' },
]

function pad(n: number) { return String(n).padStart(2, '0') }

function formatDateTime(date: string, time: string) {
  const d = new Date(`${date}T${time}`)
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}  ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function ReportPage() {
  const { seizures, stats } = useSeizures()
  const { medications }     = useMedications()
  const [rangeDays, setRangeDays] = useState(30)
  const [generating, setGenerating] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const profile   = getProfile()

  const cutoff = new Date(Date.now() - rangeDays * 864e5)
  const filtered = rangeDays === 999
    ? seizures
    : seizures.filter(s => new Date(s.date) >= cutoff)

  const activeMeds = medications.filter(m => m.active)

  // ── stats for the selected range ──────────────────────
  const totalInRange   = filtered.length
  const avgPerWeek     = rangeDays === 999
    ? '—'
    : (filtered.length / (rangeDays / 7)).toFixed(1)

  const triggerCounts: Record<string, number> = {}
  filtered.forEach(s => s.triggers.forEach(t => {
    triggerCounts[t] = (triggerCounts[t] || 0) + 1
  }))
  const topTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  const typeCounts: Record<string, number> = {}
  filtered.forEach(s => {
    typeCounts[s.type] = (typeCounts[s.type] || 0) + 1
  })

  const TYPE_LABELS: Record<string, string> = {
    'focal-aware':    'Focal aware',
    'focal-impaired': 'Focal impaired',
    'generalized':    'Generalized',
    'unknown':        'Unknown',
  }

  const handleDownloadPDF = async () => {
    setGenerating(true)
    try {
      const jsPDF   = (await import('jspdf')).default
      const html2canvas = (await import('html2canvas')).default

      const el = reportRef.current
      if (!el) return

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const pageW  = pdf.internal.pageSize.getWidth()
      const pageH  = pdf.internal.pageSize.getHeight()
      const margin = 10
      const imgW   = pageW - margin * 2
      const imgH   = (canvas.height * imgW) / canvas.width

      let y = margin
      let remaining = imgH

      while (remaining > 0) {
        const sliceH = Math.min(remaining, pageH - margin * 2)
        const sy     = imgH - remaining

        pdf.addImage(imgData, 'PNG', margin, y, imgW, imgH, '', 'FAST')

        remaining -= sliceH
        if (remaining > 0) {
          pdf.addPage()
          y = margin - sy - sliceH
        }
      }

      const name  = profile.name ? profile.name.replace(/\s+/g, '_') : 'patient'
      const today = new Date().toISOString().split('T')[0]
      pdf.save(`SeizureLog_${name}_${today}.pdf`)
    } catch (e) {
      console.error('PDF generation failed:', e)
    } finally {
      setGenerating(false)
    }
  }

  const handlePrint = () => window.print()

  return (
    <main className="max-w-lg mx-auto px-4 py-6 pb-24">

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium text-gray-900">Doctor report</h1>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="text-sm text-gray-500 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={generating}
            className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-violet-700 disabled:opacity-60 transition-colors"
          >
            {generating ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Range selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {RANGE_OPTIONS.map(r => (
          <button
            key={r.value}
            onClick={() => setRangeDays(r.value)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${
              rangeDays === r.value
                ? 'bg-violet-100 border-violet-400 text-violet-700 font-medium'
                : 'bg-white border-gray-200 text-gray-500'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* ── REPORT PREVIEW (this gets captured to PDF) ── */}
      <div
        ref={reportRef}
        className="bg-white rounded-2xl border border-gray-100 p-6 print:rounded-none print:border-none print:shadow-none"
      >
        {/* Report header */}
        <div className="border-b border-gray-100 pb-4 mb-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Seizure diary report</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Generated {new Date().toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
              <p className="text-xs text-gray-400">
                Period: {RANGE_OPTIONS.find(r => r.value === rangeDays)?.label}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">SeizureLog app</p>
            </div>
          </div>
        </div>

        {/* Patient info */}
        {(profile.name || profile.diagnosisType || profile.neurologist) && (
          <section className="mb-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Patient information
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {profile.name && (
                <Row label="Name" value={profile.name} />
              )}
              {profile.dateOfBirth && (
                <Row label="Date of birth" value={profile.dateOfBirth} />
              )}
              {profile.diagnosisType && (
                <Row label="Diagnosis" value={profile.diagnosisType} />
              )}
              {profile.neurologist && (
                <Row label="Neurologist" value={profile.neurologist} />
              )}
            </div>
          </section>
        )}

        {/* Summary stats */}
        <section className="mb-5">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Summary
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-medium text-gray-900">{totalInRange}</p>
              <p className="text-xs text-gray-400">Total seizures</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-medium text-gray-900">{avgPerWeek}</p>
              <p className="text-xs text-gray-400">Per week avg</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-medium text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-400">All time total</p>
            </div>
          </div>
        </section>

        {/* Seizure types */}
        {Object.keys(typeCounts).length > 0 && (
          <section className="mb-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Seizure types
            </h3>
            <div className="flex flex-col gap-1.5">
              {Object.entries(typeCounts).map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <div
                      className="h-2 bg-violet-400 rounded-full"
                      style={{ width: `${Math.round((count / totalInRange) * 100)}%`, minWidth: 4 }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-28 shrink-0">
                    {TYPE_LABELS[type]}
                  </span>
                  <span className="text-xs font-medium text-gray-900 w-6 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Top triggers */}
        {topTriggers.length > 0 && (
          <section className="mb-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Most common triggers
            </h3>
            <div className="flex flex-col gap-1.5">
              {topTriggers.map(([trigger, count]) => (
                <div key={trigger} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{trigger}</span>
                  <span className="text-xs text-gray-400">{count}x</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Current medications */}
        {activeMeds.length > 0 && (
          <section className="mb-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Current medications
            </h3>
            <div className="flex flex-col gap-2">
              {activeMeds.map(med => (
                <div
                  key={med.id}
                  className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${med.color}`} />
                    <span className="text-sm text-gray-900">{med.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-600">{med.dose}</span>
                    <span className="text-xs text-gray-400 ml-1">· {med.frequency}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Seizure log table */}
        <section>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Seizure log ({filtered.length} entries)
          </h3>

          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No seizures in this period.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-gray-400 font-medium pb-2 pr-3">Date & time</th>
                    <th className="text-left text-gray-400 font-medium pb-2 pr-3">Type</th>
                    <th className="text-left text-gray-400 font-medium pb-2 pr-3">Duration</th>
                    <th className="text-left text-gray-400 font-medium pb-2 pr-3">Aura / warning</th>
                    <th className="text-left text-gray-400 font-medium pb-2 pr-3">Triggers</th>
                    <th className="text-left text-gray-400 font-medium pb-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr
                      key={s.id}
                      className={`border-b border-gray-50 align-top ${
                        i % 2 === 0 ? '' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="py-2 pr-3 text-gray-700 whitespace-nowrap">
                        {formatDateTime(s.date, s.time)}
                      </td>
                      <td className="py-2 pr-3 text-gray-700 whitespace-nowrap">
                        {TYPE_LABELS[s.type]}
                      </td>
                      <td className="py-2 pr-3 text-gray-600 whitespace-nowrap">
                        {s.duration ? `${s.duration}m` : '—'}
                      </td>
                      <td className="py-2 pr-3 text-gray-600">
                        {s.aura.join(', ') || '—'}
                      </td>
                      <td className="py-2 pr-3 text-gray-600">
                        {s.triggers.join(', ') || '—'}
                      </td>
                      <td className="py-2 text-gray-500">
                        {s.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-4 mt-6">
          <p className="text-xs text-gray-400 text-center">
            Generated by SeizureLog · This report is a patient-kept diary and not a clinical document.
          </p>
        </div>
      </div>

      {/* Profile setup prompt */}
      {!profile.name && (
        <div className="mt-4 bg-amber-50 rounded-2xl p-4">
          <p className="text-xs text-amber-700 font-medium mb-1">Add your details to the report</p>
          <p className="text-xs text-amber-600 mb-3">
            Patient name, diagnosis, and neurologist name will appear at the top of the PDF.
          </p>
          <ProfileForm />
        </div>
      )}

    </main>
  )
}

// ── small helpers ────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-400">{label}: </span>
      <span className="text-xs text-gray-700">{value}</span>
    </div>
  )
}

function ProfileForm() {
  const [name, setName]       = useState('')
  const [dob, setDob]         = useState('')
  const [diag, setDiag]       = useState('')
  const [neuro, setNeuro]     = useState('')
  const [saved, setSaved]     = useState(false)

  const handleSave = async () => {
    const { updateProfile } = await import('@/lib/storage')
    updateProfile({ name, dateOfBirth: dob, diagnosisType: diag, neurologist: neuro })
    setSaved(true)
    setTimeout(() => window.location.reload(), 800)
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Patient name"
        className="text-sm border border-amber-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
      />
      <input
        value={dob}
        onChange={e => setDob(e.target.value)}
        placeholder="Date of birth (e.g. 15/03/1990)"
        className="text-sm border border-amber-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
      />
      <input
        value={diag}
        onChange={e => setDiag(e.target.value)}
        placeholder="Diagnosis (e.g. Left temporal lobe epilepsy)"
        className="text-sm border border-amber-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
      />
      <input
        value={neuro}
        onChange={e => setNeuro(e.target.value)}
        placeholder="Neurologist name"
        className="text-sm border border-amber-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
      />
      <button
        onClick={handleSave}
        className={`text-sm py-2 rounded-xl font-medium transition-colors ${
          saved
            ? 'bg-green-100 text-green-700'
            : 'bg-amber-500 text-white hover:bg-amber-600'
        }`}
      >
        {saved ? 'Saved!' : 'Save details'}
      </button>
    </div>
  )
}