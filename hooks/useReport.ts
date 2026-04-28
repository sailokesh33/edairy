import { getSeizures, getMedications, getProfile } from '@/lib/storage'

export function useReport() {
  const generate = () => {
    const seizures    = getSeizures()
    const medications = getMedications()
    const profile     = getProfile()
    return { seizures, medications, profile }
  }

  return { generate }
}