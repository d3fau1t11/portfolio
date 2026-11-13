import { ArrowUpRight } from 'lucide-react'
import { labs, labStats } from '../data/labs'
import { siteUrl } from '../lib/urls'
import { LabCard } from './LabCard'
import { SectionHeading } from './SectionHeading'

export function LabSection() {
  return (
    <section className="section labs-section" id="labs" aria-labelledby="labs-title">
      <div className="container">
        <SectionHeading id="labs-title" eyebrow="SYSTEM ADMINISTRATION · VIRTUALIZATION" title="Systems configured. Problems solved." action={<a className="text-link" href={siteUrl('labs/')}>Explore all {labs.length} labs<ArrowUpRight size={16} aria-hidden="true" /></a>}><p>My Windows Server and VMware lab work: deploying services, controlling access, managing storage and troubleshooting virtual infrastructure. Each walkthrough follows the steps I took and the evidence I recorded.</p></SectionHeading>
        <div className="lab-highlight-stats" aria-label="Lab collection overview"><p><strong>{labs.length}</strong><span>practical walkthroughs</span></p><p><strong>{labStats.steps}</strong><span>numbered work steps</span></p><p><strong>{labStats.screenshots}</strong><span>reviewed screenshots</span></p></div>
        <div className="lab-grid">{labs.filter((lab) => lab.featured).map((lab) => <LabCard key={lab.slug} lab={lab} />)}</div>
      </div>
    </section>
  )
}
