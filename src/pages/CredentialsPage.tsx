import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Search, SearchX, X } from 'lucide-react'
import { credentialCategories, credentials } from '../data/credentials'
import type { CategoryFilter } from '../data/credentials'
import { filterCredentials } from '../lib/credentials'
import { siteUrl } from '../lib/urls'
import { CredentialCard } from '../components/CredentialCard'
import { ContactSection } from '../components/ContactSection'

export function CredentialsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const searchInput = useRef<HTMLInputElement>(null)
  const filtered = filterCredentials(credentials, query, category, featuredOnly)
  const hasFilters = query.trim().length > 0 || category !== 'all' || featuredOnly

  function resetFilters() {
    setQuery('')
    setCategory('all')
    setFeaturedOnly(false)
    searchInput.current?.focus()
  }

  useEffect(() => {
    function openLinkedCredential() {
      const slug = window.location.hash.slice(1)
      const card = document.getElementById(slug)
      const details = card?.querySelector('details')
      if (details) details.open = true
    }
    openLinkedCredential()
    window.addEventListener('hashchange', openLinkedCredential)
    return () => window.removeEventListener('hashchange', openLinkedCredential)
  }, [])

  return (
    <main id="main-content" tabIndex={-1}>
      <section className="credentials-page-header container">
        <a className="back-link" href={siteUrl()}><ArrowLeft size={16} aria-hidden="true" />Back to portfolio</a>
        <p className="eyebrow"><span aria-hidden="true" />CONTINUOUS LEARNING</p>
        <h1>Credentials<br /><span>& achievements.</span></h1>
        <p className="credentials-page-intro">A record of cybersecurity study, practical competition experience and software-development learning. Each award is described according to its documented type.</p>
        <div className="credentials-page-note"><span aria-hidden="true" /><p>Course completions, competency awards, nanodegrees and participation — each tells a different part of the story.</p></div>
      </section>
      <section className="credential-collection container" aria-labelledby="collection-title">
        <h2 id="collection-title" className="sr-only">Credential collection</h2>
        <p className="no-js-note">All credentials are shown below. Use your browser’s Find option to search by title, issuer or topic.</p>
        <form className="credential-search-form" role="search" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="credential-search" className="sr-only">Search credentials</label>
          <div className="credential-search"><Search size={20} aria-hidden="true" /><input ref={searchInput} id="credential-search" type="search" placeholder="Search by title, issuer or topic…" value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" />{query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); searchInput.current?.focus() }}><X size={17} aria-hidden="true" /></button>}</div>
          <label className="featured-filter"><input type="checkbox" checked={featuredOnly} onChange={(event) => setFeaturedOnly(event.target.checked)} /><span>Featured only</span></label>
        </form>
        <div className="category-filters" role="group" aria-label="Filter by category">{credentialCategories.map((item) => <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div>
        <div className="credential-results-bar"><p role="status" aria-live="polite" aria-atomic="true">Showing <strong>{filtered.length}</strong> of {credentials.length} credentials</p>{hasFilters && <button type="button" className="reset-filters" onClick={resetFilters}>Reset filters<ArrowUpRight size={14} aria-hidden="true" /></button>}</div>
        {filtered.length > 0 ? <div className="credential-grid all-credentials">{filtered.map((credential) => <CredentialCard key={credential.slug} credential={credential} />)}</div> : <div className="credential-empty"><SearchX size={32} aria-hidden="true" /><h3>No matching credentials</h3><p>Try another title, issuer or topic, or clear the filters.</p><button className="button button-secondary" type="button" onClick={resetFilters}>Reset filters</button></div>}
      </section>
      <ContactSection />
    </main>
  )
}

