import { ArrowDown, ArrowUpRight, Braces, Check, ShieldCheck } from 'lucide-react'
import * as m from 'motion/react-m'
import { profile } from '../data/profile'
import { GitHubIcon } from './GitHubIcon'

function PracticeGraphic() {
  return (
    <div className="practice-graphic" role="img" aria-label="A practice that connects building, testing and security">
      <p className="graphic-caption">DEVELOPMENT <span>×</span> SECURITY</p>
      <svg className="practice-lines" viewBox="0 0 440 400" fill="none" aria-hidden="true">
        <defs><linearGradient id="practice-gradient" x1="84" y1="68" x2="343" y2="334" gradientUnits="userSpaceOnUse"><stop stopColor="#96e4c3" stopOpacity=".8" /><stop offset="1" stopColor="#6f92ae" stopOpacity=".5" /></linearGradient></defs>
        <circle cx="218" cy="204" r="121" stroke="#29393b" strokeDasharray="3 7" />
        <circle cx="218" cy="204" r="76" stroke="#24322f" />
        <path d="M96 118C161 67 278 74 325 144M344 230C324 306 197 343 115 288M83 214C66 165 75 143 96 118" stroke="url(#practice-gradient)" strokeWidth="1.5" />
        <path d="m319 138 8 7-1-11m-203 157-11-2 6-10" stroke="#96e4c3" strokeWidth="1.5" />
        <circle cx="156" cy="92" r="3" fill="#96e4c3" />
        <circle cx="289" cy="316" r="3" fill="#96e4c3" />
        <circle cx="97" cy="212" r="2.5" fill="#6f92ae" />
      </svg>
      <div className="graphic-core"><span aria-hidden="true">hc<span>.</span></span><span className="core-caption">A connected practice</span></div>
      <m.div className="practice-node build-node" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        <span className="node-icon"><Braces size={20} aria-hidden="true" /></span><div><span className="node-step">01 / BUILD</span><strong>Useful software</strong></div>
      </m.div>
      <m.div className="practice-node test-node" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        <span className="node-icon blue"><Check size={20} aria-hidden="true" /></span><div><span className="node-step">02 / TEST</span><strong>Understand behavior</strong></div>
      </m.div>
      <m.div className="practice-node secure-node" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        <span className="node-icon"><ShieldCheck size={20} aria-hidden="true" /></span><div><span className="node-step">03 / SECURE</span><strong>Think about boundaries</strong></div>
      </m.div>
      <p className="graphic-footnote">Build with purpose. Keep learning.</p>
    </div>
  )
}

export function Hero() {
  return (
    <section className="hero container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow"><span aria-hidden="true" />SOFTWARE / SECURITY / SERVER ADMINISTRATION</p>
        <h1 id="hero-title">Habtemariam<br /><span>Chuchu<span className="name-period">.</span></span></h1>
        <p className="hero-role">{profile.headline.split(' | ').map((role, index) => <span key={role}>{index > 0 && <span className="role-divider"> | </span>}{role}</span>)}</p>
        <p className="hero-intro">{profile.intro}</p>
        <div className="hero-actions">
          <m.a className="button button-primary" href="#projects" whileHover={{ y: -2 }}>View projects<ArrowUpRight size={18} aria-hidden="true" /></m.a>
          <a className="button button-secondary" href="#contact">Contact me<ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
        <a className="hero-github" href={profile.github} target="_blank" rel="noopener noreferrer"><GitHubIcon size={17} aria-hidden="true" />d3fau1t11<span className="small-arrow"><ArrowUpRight size={14} aria-hidden="true" /></span></a>
      </div>
      <PracticeGraphic />
      <a className="hero-scroll" href="#about"><ArrowDown size={14} aria-hidden="true" />EXPLORE THE PORTFOLIO</a>
    </section>
  )
}

