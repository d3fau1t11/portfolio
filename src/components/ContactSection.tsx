import { ArrowUpRight, Mail } from 'lucide-react'
import * as m from 'motion/react-m'
import { profile } from '../data/profile'
import { GitHubIcon } from './GitHubIcon'

export function ContactSection() {
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="container contact-inner">
        <div><p className="eyebrow"><span aria-hidden="true" />LET’S CONNECT</p><h2 id="contact-title">Have something<br />in mind<span>?</span></h2><p className="contact-intro">A software project, a security conversation or an opportunity to learn together. I’d be glad to hear from you.</p></div>
        <div className="contact-links">
          <m.a className="contact-email" href={`mailto:${profile.email}`} whileHover={{ x: 3 }}><span className="contact-link-label"><Mail size={16} aria-hidden="true" />EMAIL</span><span>{profile.email}<ArrowUpRight size={24} aria-hidden="true" /></span></m.a>
          <a className="contact-github" href={profile.github} target="_blank" rel="noopener noreferrer"><GitHubIcon size={18} aria-hidden="true" /><span>Find me on GitHub<strong>d3fau1t11</strong></span><ArrowUpRight size={20} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  )
}

