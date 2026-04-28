import { useState, useEffect, useCallback } from 'react'
import { Medication } from '@/types'
import {
  getMedications,
  addMedication,
  updateMedication,
  deleteMedication,
} from '@/lib/storage'

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setMedications(getMedications())
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const add = useCallback((data: Omit<Medication, 'id'>) => {
    const m = addMedication(data)
    setMedications(getMedications())
    return m
  }, [])

  const update = useCallback((id: string, updates: Partial<Medication>) => {
    updateMedication(id, updates)
    setMedications(getMedications())
  }, [])

  const remove = useCallback((id: string) => {
    deleteMedication(id)
    setMedications(getMedications())
  }, [])

  return { medications, loading, add, update, remove, refresh }
}