import { useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, BookOpen, Search, SearchX, X } from 'lucide-react'
import { ctfEvent, ctfMonth, writeupCategories, writeups } from '../data/writeups'
import type { WriteupCategoryFilter } from '../data/writeups'
import { filterWriteups } from '../lib/writeups'
import { siteUrl } from '../lib/urls'
import { WriteupCard } from '../components/WriteupCard'

export function WriteupsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<WriteupCategoryFilter>('all')
  const searchInput = useRef<HTMLInputElement>(null)
  const filtered = filterWriteups(writeups, query, category)
  const hasFilters = query.trim().length > 0 || category !== 'all'

  function resetFilters() {
    setQuery('')
    setCategory('all')
    searchInput.current?.focus()
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <section className="writeups-page-header container">
        <a className="back-link" href={siteUrl()}><ArrowLeft size={16} aria-hidden="true" />Back to portfolio</a>
        <p className="eyebrow"><span aria-hidden="true" />CTF FIELD NOTES</p>
        <h1>Follow the evidence.<br /><span>Understand the weakness.</span></h1>
        <p className="writeups-page-intro">Challenge write-ups across web security, cryptography, binary exploitation, reverse engineering, forensics and more. A record of the approach, the details that mattered and the lessons to carry forward.</p>
        <div className="writeups-event"><BookOpen size={17} aria-hidden="true" /><span>{ctfEvent}</span><time dateTime="2026-10">{ctfMonth}</time></div>
      </section>
      <section className="writeup-collection container" aria-labelledby="writeup-collection-title">
        <h2 id="writeup-collection-title" className="sr-only">CTF write-up collection</h2>
        <p className="no-js-note">All {writeups.length} write-ups are shown below. Use your browser’s Find option to search by challenge or topic.</p>
        <form className="writeup-search-form" role="search" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="writeup-search" className="sr-only">Search write-ups</label>
          <div className="credential-search"><Search size={20} aria-hidden="true" /><input ref={searchInput} id="writeup-search" type="search" placeholder="Search by challenge, technique or topic…" value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" />{query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); searchInput.current?.focus() }}><X size={17} aria-hidden="true" /></button>}</div>
          <span className="collection-count">{writeups.length} challenge notes</span>
        </form>
        <div className="category-filters" role="group" aria-label="Filter write-ups by category">{writeupCategories.map((item) => <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div>
        <div className="writeup-results-bar"><p role="status" aria-live="polite" aria-atomic="true">Showing <strong>{filtered.length}</strong> of {writeups.length} write-ups</p>{hasFilters && <button type="button" className="reset-filters" onClick={resetFilters}>Reset filters<ArrowUpRight size={14} aria-hidden="true" /></button>}</div>
        {filtered.length ? <div className="writeup-grid">{filtered.map((item) => <WriteupCard key={item.slug} writeup={item} />)}</div> : <div className="credential-empty"><SearchX size={32} aria-hidden="true" /><h3>No matching write-ups</h3><p>Try another challenge or topic, or clear the filters.</p><button type="button" className="button button-secondary" onClick={resetFilters}>Reset filters</button></div>}
      </section>
    </main>
  )
}
