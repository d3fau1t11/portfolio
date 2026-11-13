import { useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Image as ImageIcon, ListChecks, Search, SearchX, Server, X } from 'lucide-react'
import { labs, labStats } from '../data/labs'
import { filterLabs } from '../lib/labs'
import { siteUrl } from '../lib/urls'
import { LabCard } from '../components/LabCard'

export function LabsPage() {
  const [query, setQuery] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const filtered = filterLabs(labs, query)
  const active = query.trim().length > 0
  function reset() { setQuery(''); input.current?.focus() }
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="labs-page-header container">
        <a className="back-link" href={siteUrl('#labs')}><ArrowLeft size={16} aria-hidden="true" />Back to portfolio</a>
        <p className="eyebrow"><span aria-hidden="true" />SYSTEM ADMINISTRATION · VIRTUALIZATION</p>
        <h1>Windows Server<br /><span>& virtual infrastructure.</span></h1>
        <p className="labs-page-intro">{labs.length} practical labs in Windows Server administration and virtualization. Explore how I deployed services, managed access and storage, and worked through the problems I encountered.</p>
        <div className="lab-library-stats"><span><Server size={16} aria-hidden="true" />{labs.length} practical labs</span><span><ListChecks size={16} aria-hidden="true" />{labStats.steps} numbered steps</span><span><ImageIcon size={16} aria-hidden="true" />{labStats.screenshots} reviewed screenshots</span></div>
      </section>
      <section className="lab-collection container" aria-labelledby="lab-collection-title">
        <h2 id="lab-collection-title" className="sr-only">Practical lab collection</h2>
        <p className="no-js-note">All {labs.length} labs are shown below. Use your browser’s Find option to search by topic.</p>
        <form className="lab-search-form" role="search" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="lab-search" className="sr-only">Search labs</label>
          <div className="credential-search"><Search size={20} aria-hidden="true" /><input ref={input} id="lab-search" type="search" placeholder="Search Active Directory, storage, VPN, ESXi…" value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" />{query && <button type="button" aria-label="Clear lab search" onClick={() => { setQuery(''); input.current?.focus() }}><X size={17} aria-hidden="true" /></button>}</div>
          <span className="collection-count">{labs.length} lab walkthroughs</span>
        </form>
        <div className="lab-results-bar"><p role="status" aria-live="polite" aria-atomic="true">Showing <strong>{filtered.length}</strong> of {labs.length} labs</p>{active && <button type="button" className="reset-filters" onClick={reset}>Reset search<ArrowUpRight size={14} aria-hidden="true" /></button>}</div>
        {filtered.length ? <div className="lab-grid">{filtered.map((lab) => <LabCard key={lab.slug} lab={lab} />)}</div> : <div className="credential-empty"><SearchX size={32} aria-hidden="true" /><h2>No matching labs</h2><p>Try another topic or clear the search.</p><button type="button" className="button button-secondary" onClick={reset}>Reset search</button></div>}
      </section>
    </main>
  )
}
