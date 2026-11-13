import { labs } from '../data/labs.ts'
import type { Lab, LabContent } from '../data/labs.ts'

export function getLab(slug: string): Lab | undefined {
  return labs.find((lab) => lab.slug === slug)
}

export function filterLabs(items: Lab[], query: string): Lab[] {
  const terms = query.normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
  return items.filter((lab) => {
    const searchable = [lab.title, lab.category, lab.summary, ...lab.topics].join(' ').normalize('NFKC').toLocaleLowerCase()
    return terms.every((term) => searchable.includes(term))
  })
}

export function labEvidenceIds(content: LabContent): string[] {
  return [...new Set(content.steps.flatMap((step) => step.evidence ?? []))]
}

export function labStepId(index: number): string {
  return 'step-' + String(index + 1).padStart(2, '0')
}
