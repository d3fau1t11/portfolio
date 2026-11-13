import records from './labs.json' with { type: 'json' }

export type LabCategory = 'Windows Server' | 'Virtualization'

export interface Lab {
  slug: string
  title: string
  category: LabCategory
  order: number
  summary: string
  topics: string[]
  stepCount: number
  evidenceCount: number
  cover?: string
  featured?: boolean
}

export const labs = records as Lab[]
export const labStats = {
  steps: labs.reduce((count, lab) => count + lab.stepCount, 0),
  screenshots: labs.reduce((count, lab) => count + lab.evidenceCount, 0),
}

export interface LabStep { title: string; description: string; evidence?: string[]; commands?: string }
export interface LabCheck { title: string; description: string; basis: 'captured' | 'documented' }
export interface LabTroubleshooting { title: string; symptom: string; action: string; result: string }
export interface LabContent {
  overview: string
  environment: string[]
  steps: LabStep[]
  checks: LabCheck[]
  lessons: string[]
  scope: string
  troubleshooting?: LabTroubleshooting[]
  variants?: string
}
