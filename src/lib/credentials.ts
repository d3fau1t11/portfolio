import type { CategoryFilter, Credential } from '../data/credentials'

export function filterCredentials(items: readonly Credential[], query: string, category: CategoryFilter, featuredOnly = false): Credential[] {
  const terms = query.normalize('NFKC').trim().toLocaleLowerCase('en').split(/\s+/).filter(Boolean)

  return items.filter((item) => {
    if (category !== 'all' && item.category !== category) return false
    if (featuredOnly && !item.featured) return false
    const searchable = [item.title, item.issuer, item.awardType, ...item.topics]
      .join(' ').normalize('NFKC').toLocaleLowerCase('en')
    return terms.every((term) => searchable.includes(term))
  })
}

