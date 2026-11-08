import { ArrowUpRight } from 'lucide-react'
import type { Writeup } from '../data/writeups'
import { writeupCategoryLabel } from '../lib/writeups'
import { siteUrl } from '../lib/urls'

export function WriteupCard({ writeup }: { writeup: Writeup }) {
  return (
    <article className={'writeup-card category-' + writeup.category}>
      <div className="writeup-card-meta"><span>{writeupCategoryLabel(writeup.category)}</span>{writeup.points !== undefined && <span>{writeup.points} pts</span>}</div>
      <h3><a href={siteUrl('writeups/' + writeup.slug + '/')} className="writeup-card-link">{writeup.title}<ArrowUpRight size={20} aria-hidden="true" /></a></h3>
      <p>{writeup.summary}</p>
      <ul className="writeup-topics" aria-label="Topics">{writeup.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
      <span className="writeup-read" aria-hidden="true">Read write-up<span>↗</span></span>
    </article>
  )
}
