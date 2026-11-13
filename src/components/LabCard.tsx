import { ArrowUpRight, HardDrive, Server } from 'lucide-react'
import type { Lab } from '../data/labs'
import { labAssets } from '../data/lab-assets'
import { siteUrl } from '../lib/urls'

export function LabCard({ lab }: { lab: Lab }) {
  const cover = lab.cover ? labAssets[lab.cover] : undefined
  return (
    <a className="lab-card" href={siteUrl('labs/' + lab.slug + '/')}>
      <div className={'lab-card-visual ' + (cover ? 'lab-card-screen' : 'lab-card-placeholder')} aria-hidden="true">
        {cover ? <img src={siteUrl(cover.file)} alt="" width={cover.width} height={cover.height} loading="lazy" decoding="async" /> : <Server size={44} strokeWidth={1.1} />}
        <span className="lab-visual-label">{lab.category === 'Virtualization' ? <HardDrive size={13} /> : <Server size={13} />}{lab.category.toUpperCase()}</span>
      </div>
      <div className="lab-card-copy"><p className="lab-card-kicker">PRACTICAL LAB<span>{String(lab.order).padStart(2, '0')}</span></p><h3>{lab.title}</h3><p className="lab-card-summary">{lab.summary}</p><ul className="writeup-topics" aria-label="Lab topics">{lab.topics.slice(0, 3).map((topic) => <li key={topic}>{topic}</li>)}</ul><div className="lab-card-footer"><span>{lab.stepCount} steps · {lab.evidenceCount} screenshots</span><ArrowUpRight size={18} aria-hidden="true" /></div></div>
    </a>
  )
}
