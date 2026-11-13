import records from './lab-assets.json' with { type: 'json' }

export interface LabAsset {
  file: string
  width: number
  height: number
  sha256: string
  alt: string
  caption: string
}

export const labAssets: Record<string, LabAsset> = records
