import type { LabContent } from '../data/labs'
import { getLab } from './labs'

const sources = import.meta.glob<LabContent>('../content/labs/*.json', { import: 'default' })

export async function loadLabContent(slug: string): Promise<LabContent> {
  if (!getLab(slug)) throw new Error('Unknown lab')
  const load = sources['../content/labs/' + slug + '.json']
  if (!load) throw new Error('Missing lab walkthrough: ' + slug)
  return load()
}
