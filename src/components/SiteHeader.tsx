import { useEffect, useRef } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { profile } from '../data/profile'
import { siteUrl } from '../lib/urls'
import type { Page } from '../App'

export function SiteHeader({ page }: { page: Page }) {
  const menu = useRef<HTMLDetailsElement>(null)
  const links = [
    { label: 'About', href: siteUrl('#about') },
    { label: 'Projects', href: siteUrl('#projects') },
    { label: 'Labs', href: siteUrl('labs/'), current: page === 'labs' || page === 'lab' },
    { label: 'Security', href: siteUrl('#security') },
    { label: 'Write-ups', href: siteUrl('writeups/'), current: page === 'writeups' },
    { label: 'Credentials', href: siteUrl('certifications/'), current: page === 'certifications' },
  ]

  useEffect(() => {
    function dismiss(event: PointerEvent) {
      if (menu.current?.open && event.target instanceof Node && !menu.current.contains(event.target)) {
        menu.current.open = false
      }
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [])

  return (
    <header className="site-header">
      <div className="header-inner">
        <a href={siteUrl()} className="brand" aria-label="Habtemariam Chuchu — home">
          <span className="brand-mark" aria-hidden="true">hc<span>.</span></span>
          <span className="brand-name">Habtemariam<br />Chuchu</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => <a key={link.label} href={link.href} aria-current={link.current ? 'page' : undefined}>{link.label}</a>)}
        </nav>
        <a className="header-contact" href={`mailto:${profile.email}`}>Let’s talk <ArrowUpRight size={16} aria-hidden="true" /></a>
        <details className="mobile-menu" ref={menu} onKeyDown={(event) => {
          if (event.key === 'Escape' && menu.current?.open) {
            menu.current.open = false
            menu.current.querySelector('summary')?.focus()
          }
        }}>
          <summary><span className="sr-only">Navigation menu</span><Menu className="menu-open-icon" size={22} aria-hidden="true" /><X className="menu-close-icon" size={22} aria-hidden="true" /></summary>
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {links.map((link) => <a key={link.label} href={link.href} aria-current={link.current ? 'page' : undefined} onClick={() => { if (menu.current) menu.current.open = false }}>{link.label}<ArrowUpRight size={16} aria-hidden="true" /></a>)}
            <a href={siteUrl('#contact')} onClick={() => { if (menu.current) menu.current.open = false }}>Contact<ArrowUpRight size={16} aria-hidden="true" /></a>
          </nav>
        </details>
      </div>
    </header>
  )
}

