import { ArrowUpRight } from 'lucide-react'
import { credentials } from '../data/credentials'
import { siteUrl } from '../lib/urls'
import { CredentialCard } from './CredentialCard'
import { SectionHeading } from './SectionHeading'

export function FeaturedCredentials() {
  const selected = credentials.filter((credential) => credential.featured)
  const summerCamp = selected.find((credential) => credential.slug === 'insa-summer-camp')
  const featuredCredentials = summerCamp ? [summerCamp, ...selected.filter((credential) => credential !== summerCamp)] : selected
  return (
    <section className="section credentials-section" id="credentials" aria-labelledby="credentials-title">
      <div className="container">
        <SectionHeading id="credentials-title" eyebrow="PROFESSIONAL DEVELOPMENT" title="Learning, with something to show." action={<a className="text-link" href={siteUrl('certifications/')}>All credentials<ArrowUpRight size={17} aria-hidden="true" /></a>}><p>Selected programs, training and competency awards across cybersecurity, information security, network operations and infrastructure protection.</p></SectionHeading>
        <div className="credential-grid featured-credential-grid">{featuredCredentials.map((credential) => <CredentialCard key={credential.slug} credential={credential} />)}</div>
        <a className="credential-collection-link" href={siteUrl('certifications/')}><span>Explore course completions, CTF participation and more.</span><ArrowUpRight size={19} aria-hidden="true" /></a>
      </div>
    </section>
  )
}

