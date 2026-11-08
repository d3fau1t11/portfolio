import type { Writeup } from '../data/writeups.ts'
import { ctfEvent } from '../data/writeups.ts'

function escapeAttribute(text: string): string {
  return text.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!))
}

export function applyWriteupTemplate(template: string, writeup: Writeup): string {
  const values: Record<string, string> = {
    '__WRITEUP_TITLE__': writeup.title + ' — ' + ctfEvent + ' | Habtemariam Chuchu',
    '__WRITEUP_DESCRIPTION__': writeup.summary,
    '__WRITEUP_URL__': 'https://d3fau1t11.github.io/portfolio/writeups/' + writeup.slug + '/',
    '__WRITEUP_SLUG__': writeup.slug,
  }
  return template.replace(/__WRITEUP_(?:TITLE|DESCRIPTION|URL|SLUG)__/g, (key) => escapeAttribute(values[key]))
}
