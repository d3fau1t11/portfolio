import { ArrowUp, Mail } from 'lucide-react'
import { profile } from '../data/profile'
import { GitHubIcon } from './GitHubIcon'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div><a className="footer-name" href="#top">Habtemariam Chuchu<span>.</span></a><p>Software development, cybersecurity & server administration.</p></div>
        <div className="footer-links">
          <a href={profile.github} target="_blank" rel="noopener noreferrer"><GitHubIcon size={17} aria-hidden="true" />GitHub<ArrowUp className="external-marker" size={12} aria-hidden="true" /></a>
          <a href={`mailto:${profile.email}`}><Mail size={17} aria-hidden="true" />Email</a>
          <a href="#top" className="back-top">Back to top<ArrowUp size={15} aria-hidden="true" /></a>
        </div>
        <p className="copyright">© 2026 Habtemariam Chuchu</p>
      </div>
    </footer>
  )
}

