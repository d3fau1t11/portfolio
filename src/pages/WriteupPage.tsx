import type { ReactNode } from 'react'
import { ArrowLeft, ArrowUpRight, ChevronDown } from 'lucide-react'
import { ctfEvent, ctfMonth, writeups } from '../data/writeups'
import type { Writeup } from '../data/writeups'
import { getTableOfContents, writeupCategoryLabel } from '../lib/writeups'
import { siteUrl } from '../lib/urls'
import { WriteupCard } from '../components/WriteupCard'

export function WriteupPage({ writeup, markdown, children }: { writeup: Writeup; markdown: string; children: ReactNode }) {
  const headings = getTableOfContents(markdown)
  const related = writeups.filter((item) => item.category === writeup.category && item.slug !== writeup.slug).slice(0, 2)
  const contents = <ol>{headings.map((heading) => <li key={heading.id}><a href={'#' + heading.id}>{heading.text}</a></li>)}</ol>

  return (
    <main id="main-content" tabIndex={-1}>
      <article className="writeup-reader container">
        <nav className="article-breadcrumbs" aria-label="Breadcrumb"><ol><li><a href={siteUrl()}>Portfolio</a></li><li><a href={siteUrl('writeups/')}>Write-ups</a></li><li aria-current="page">{writeup.title}</li></ol></nav>
        <header className="article-header">
          <p className="eyebrow"><span aria-hidden="true" />{ctfEvent.toUpperCase()}</p>
          <h1>{writeup.title}<span>.</span></h1>
          <p className="article-summary">{writeup.summary}</p>
          <div className="article-meta"><span className={'article-category category-' + writeup.category}>{writeupCategoryLabel(writeup.category)}</span><time dateTime="2026-10">{ctfMonth}</time>{writeup.points !== undefined && <span>{writeup.points} points</span>}{writeup.difficulty && <span>{writeup.difficulty}</span>}</div>
          <ul className="writeup-topics" aria-label="Topics">{writeup.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
        </header>
        <div className="article-layout">
          <aside className="article-sidebar"><nav aria-label="Table of contents"><h2>In this write-up</h2>{contents}<a className="article-library-link" href={siteUrl('writeups/')}><ArrowLeft size={14} aria-hidden="true" />All write-ups</a></nav></aside>
          <div className="article-body">
            <details className="mobile-contents"><summary>In this write-up<ChevronDown size={18} aria-hidden="true" /></summary><nav aria-label="Mobile table of contents">{contents}</nav></details>
            <p className="article-context">These notes document the October 2026 CTF challenge. Commands, addresses and outputs refer to the supplied challenge environment.</p>
            {children}
            <div className="article-end"><a className="text-link" href={siteUrl('writeups/')}><ArrowLeft size={17} aria-hidden="true" />Back to all write-ups</a><a className="text-link" href="#top">Back to top<ArrowUpRight size={17} aria-hidden="true" /></a></div>
          </div>
        </div>
      </article>
      <section className="related-writeups container" aria-labelledby="related-writeups-title"><h2 id="related-writeups-title">More in {writeupCategoryLabel(writeup.category).toLowerCase()}</h2><div className="writeup-grid">{related.map((item) => <WriteupCard key={item.slug} writeup={item} />)}</div></section>
    </main>
  )
}
