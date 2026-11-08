import { ctfEvent, ctfMonth, writeupCategories, writeups } from '../data/writeups.ts'
import type { Writeup, WriteupCategory, WriteupCategoryFilter } from '../data/writeups.ts'

export function writeupCategoryLabel(category: WriteupCategory): string {
  return writeupCategories.find((item) => item.id === category)!.label
}

export function getWriteup(slug: string): Writeup | undefined {
  return writeups.find((item) => item.slug === slug)
}

export function filterWriteups(items: readonly Writeup[], query: string, category: WriteupCategoryFilter): Writeup[] {
  const terms = query.normalize('NFKC').trim().toLocaleLowerCase('en').split(/\s+/).filter(Boolean)
  return items.filter((item) => {
    if (category !== 'all' && item.category !== category) return false
    const searchable = [item.title, item.summary, writeupCategoryLabel(item.category), ...item.topics, ctfEvent, ctfMonth]
      .join(' ').normalize('NFKC').toLocaleLowerCase('en')
    return terms.every((term) => searchable.includes(term))
  })
}

export function createHeadingIdFactory() {
  const occurrences = new Map<string, number>()
  return (text: string): string => {
    const plain = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*`_~]/g, '')
    const slug = plain.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en')
      .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'heading'
    const count = (occurrences.get(slug) ?? 0) + 1
    occurrences.set(slug, count)
    return 'section-' + slug + (count > 1 ? '-' + count : '')
  }
}

export interface TableOfContentsEntry { id: string; text: string; level: number }

export function getTableOfContents(markdown: string): TableOfContentsEntry[] {
  const headingId = createHeadingIdFactory()
  const headings: TableOfContentsEntry[] = []
  let fence = ''
  for (const line of markdown.split('\n')) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/)?.[1]
    if (marker) {
      if (!fence) fence = marker
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = ''
      continue
    }
    if (fence) continue
    const match = line.match(/^(#{1,6})\s+(.+?)(?:\s+#+)?\s*$/)
    if (!match) continue
    const text = match[2].replace(/[*`_~]/g, '')
    const id = headingId(text)
    if (match[1].length === 2) headings.push({ id, text, level: 2 })
  }
  return headings
}

export function safeArticleUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  if (/^#[\p{L}\p{N}_-]+$/u.test(url)) return url
  try {
    const parsed = new URL(url)
    if ((parsed.protocol === 'https:' || parsed.protocol === 'http:') && !parsed.username && !parsed.password) return url
  } catch { /* Relative files in challenge notes are text, not site destinations. */ }
  return undefined
}
