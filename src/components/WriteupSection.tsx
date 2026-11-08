import { ArrowUpRight, BookOpen } from 'lucide-react'
import { ctfEvent, ctfMonth, writeups } from '../data/writeups'
import { siteUrl } from '../lib/urls'
import { SectionHeading } from './SectionHeading'
import { WriteupCard } from './WriteupCard'

export function WriteupSection() {
  return (
    <section className="section writeups-section" id="writeups" aria-labelledby="writeups-title">
      <div className="container">
        <SectionHeading id="writeups-title" eyebrow="CTF FIELD NOTES" title="From challenge to understanding." action={<a className="text-link" href={siteUrl('writeups/')}>All {writeups.length} write-ups<ArrowUpRight size={17} aria-hidden="true" /></a>}><p>Practical notes on finding the weakness, following the evidence and explaining the solution.</p></SectionHeading>
        <div className="writeups-event"><BookOpen size={17} aria-hidden="true" /><span>{ctfEvent}</span><time dateTime="2026-10">{ctfMonth}</time></div>
        <div className="writeup-grid">{writeups.filter((item) => item.featured).map((item) => <WriteupCard key={item.slug} writeup={item} />)}</div>
      </div>
    </section>
  )
}
