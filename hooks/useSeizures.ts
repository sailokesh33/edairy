import { useState, useEffect, useCallback } from 'react'
import { Seizure } from '@/types'
import {
  getSeizures,
  addSeizure,
  updateSeizure,
  deleteSeizure,
} from '@/lib/storage'

export function useSeizures() {
  const [seizures, setSeizures] = useState<Seizure[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setSeizures(getSeizures())
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const add = useCallback(
    (data: Omit<Seizure, 'id' | 'createdAt'>) => {
      const s = addSeizure(data)
      setSeizures(getSeizures())
      return s
    },
    []
  )

  const update = useCallback(
    (id: string, updates: Partial<Seizure>) => {
      updateSeizure(id, updates)
      setSeizures(getSeizures())
    },
    []
  )

  const remove = useCallback((id: string) => {
    deleteSeizure(id)
    setSeizures(getSeizures())
  }, [])

  // ── helpers for dashboard stats ──────────────────────
  const thisWeek = seizures.filter(s => {
    const d = new Date(s.date)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return d >= weekAgo
  })

  const thisMonth = seizures.filter(s => {
    const d = new Date(s.date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const topTrigger = (() => {
    const counts: Record<string, number> = {}
    seizures.forEach(s => s.triggers.forEach(t => {
      counts[t] = (counts[t] || 0) + 1
    }))
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return sorted[0] ? sorted[0][0] : null
  })()

  return {
    seizures,
    loading,
    add,
    update,
    remove,
    refresh,
    stats: {
      total: seizures.length,
      thisWeek: thisWeek.length,
      thisMonth: thisMonth.length,
      topTrigger,
    },
  }
}