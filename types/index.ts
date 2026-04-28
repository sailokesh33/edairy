export type SeizureType = 'focal-aware' | 'focal-impaired' | 'generalized' | 'unknown'

export interface Seizure {
  id: string
  date: string          // ISO date string
  time: string          // HH:MM
  duration: number | null  // minutes
  type: SeizureType
  aura: string[]        // e.g. ["Tingling", "Confusion"]
  during: string[]      // e.g. ["Stayed aware", "Couldn't speak"]
  triggers: string[]    // e.g. ["Poor sleep", "Stress"]
  afterEffects: string[]
  notes: string
  createdAt: string     // ISO timestamp
}

export interface Medication {
  id: string
  name: string          // e.g. "Lacosamide"
  dose: string          // e.g. "250mg"
  frequency: string     // e.g. "Twice daily"
  times: string[]       // e.g. ["08:00", "20:00"]
  color: string         // for UI pill color
  active: boolean
  startDate: string
  notes: string
}

export interface MedicationLog {
  id: string
  medicationId: string
  takenAt: string       // ISO timestamp
  scheduled: string     // HH:MM scheduled time
  taken: boolean
  notes: string
}

export interface Profile {
  name: string
  dateOfBirth: string
  diagnosisType: string  // e.g. "Left temporal lobe epilepsy"
  neurologist: string
  emergencyContact: string
  emergencyPhone: string
}

export interface AppData {
  seizures: Seizure[]
  medications: Medication[]
  medicationLogs: MedicationLog[]
  profile: Profile
  version: string
}