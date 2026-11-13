import type { Lab } from '../data/labs.ts'

function escapeAttribute(text: string): string {
  return text.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!))
}

export function applyLabTemplate(template: string, lab: Lab): string {
  const values: Record<string, string> = {
    '__LAB_TITLE__': lab.title + ' — Practical Lab | Habtemariam Chuchu',
    '__LAB_DESCRIPTION__': lab.summary,
    '__LAB_URL__': 'https://d3fau1t11.github.io/portfolio/labs/' + lab.slug + '/',
    '__LAB_SLUG__': lab.slug,
  }
  return template.replace(/__LAB_(?:TITLE|DESCRIPTION|URL|SLUG)__/g, (key) => escapeAttribute(values[key]))
}
