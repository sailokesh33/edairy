import { AppData, Seizure, Medication, MedicationLog, Profile } from '@/types'

const STORAGE_KEY = 'seizurelog_data'
const VERSION = '1.0.0'

const defaultProfile: Profile = {
  name: '',
  dateOfBirth: '',
  diagnosisType: '',
  neurologist: '',
  emergencyContact: '',
  emergencyPhone: '',
}

const defaultData: AppData = {
  seizures: [],
  medications: [],
  medicationLogs: [],
  profile: defaultProfile,
  version: VERSION,
}

// Read all data
export function getData(): AppData {
  if (typeof window === 'undefined') return defaultData
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData
    return { ...defaultData, ...JSON.parse(raw) }
  } catch {
    return defaultData
  }
}

// Write all data
function setData(data: AppData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ─── Seizures ────────────────────────────────────────────
export function getSeizures(): Seizure[] {
  return getData().seizures.sort(
    (a, b) => new Date(b.date + 'T' + b.time).getTime() -
               new Date(a.date + 'T' + a.time).getTime()
  )
}

export function addSeizure(seizure: Omit<Seizure, 'id' | 'createdAt'>): Seizure {
  const data = getData()
  const newSeizure: Seizure = {
    ...seizure,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  data.seizures.push(newSeizure)
  setData(data)
  return newSeizure
}

export function updateSeizure(id: string, updates: Partial<Seizure>): void {
  const data = getData()
  data.seizures = data.seizures.map(s => s.id === id ? { ...s, ...updates } : s)
  setData(data)
}

export function deleteSeizure(id: string): void {
  const data = getData()
  data.seizures = data.seizures.filter(s => s.id !== id)
  setData(data)
}

// ─── Medications ─────────────────────────────────────────
export function getMedications(): Medication[] {
  return getData().medications
}

export function addMedication(med: Omit<Medication, 'id'>): Medication {
  const data = getData()
  const newMed: Medication = { ...med, id: crypto.randomUUID() }
  data.medications.push(newMed)
  setData(data)
  return newMed
}

export function updateMedication(id: string, updates: Partial<Medication>): void {
  const data = getData()
  data.medications = data.medications.map(m => m.id === id ? { ...m, ...updates } : m)
  setData(data)
}

export function deleteMedication(id: string): void {
  const data = getData()
  data.medications = data.medications.filter(m => m.id !== id)
  setData(data)
}

// ─── Medication Logs ─────────────────────────────────────
export function getMedicationLogs(): MedicationLog[] {
  return getData().medicationLogs
}

export function logMedication(log: Omit<MedicationLog, 'id'>): MedicationLog {
  const data = getData()
  const newLog: MedicationLog = { ...log, id: crypto.randomUUID() }
  data.medicationLogs.push(newLog)
  setData(data)
  return newLog
}

// ─── Profile ─────────────────────────────────────────────
export function getProfile(): Profile {
  return getData().profile
}

export function updateProfile(updates: Partial<Profile>): void {
  const data = getData()
  data.profile = { ...data.profile, ...updates }
  setData(data)
}

// ─── Export / Import ─────────────────────────────────────
export function exportData(): string {
  return JSON.stringify(getData(), null, 2)
}

export function importData(json: string): void {
  const parsed = JSON.parse(json)
  setData({ ...defaultData, ...parsed })
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY)
}