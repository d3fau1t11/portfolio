import { CalendarDays, ChevronDown, FileBadge } from 'lucide-react'
import type { Credential } from '../data/credentials'
import { certificateAssets } from '../data/certificate-assets'
import { CertificateViewer } from './CertificateViewer'

export function CredentialCard({ credential }: { credential: Credential }) {
  return (
    <article className={`credential-card${credential.featured ? ' featured-credential' : ''}`} id={credential.slug}>
      <div className="credential-top"><span className="credential-icon"><FileBadge size={22} aria-hidden="true" /></span>{credential.featured && <span className="credential-feature-label">SELECTED</span>}</div>
      <p className="credential-issuer">{credential.issuer}</p>
      <h3>{credential.title}</h3>
      <span className="award-label">{credential.awardType}</span>
      <div className="credential-dates">
        {credential.date && <p><CalendarDays size={14} aria-hidden="true" /><span>{credential.date}</span></p>}
        {credential.expires && <p className="expiry-date">Expires {credential.expires}</p>}
      </div>
      <details className="credential-details">
        <summary>About this award<ChevronDown size={16} aria-hidden="true" /></summary>
        <p>{credential.summary}</p>
        <ul className="credential-topics" aria-label="Topics">{credential.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
      </details>
      <CertificateViewer credential={credential} asset={certificateAssets[credential.slug]} />
    </article>
  )
}

