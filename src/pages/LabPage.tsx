import { ArrowLeft, ArrowUpRight, Check, ChevronDown } from 'lucide-react'
import type { Lab, LabContent } from '../data/labs'
import { labs } from '../data/labs'
import { labStepId } from '../lib/labs'
import { siteUrl } from '../lib/urls'
import { LabEvidence } from '../components/LabEvidence'
import { LabCard } from '../components/LabCard'

export function LabPage({ lab, content }: { lab: Lab; content: LabContent }) {
  const sections = [
    { id: 'overview', title: 'The task & environment' },
    { id: 'workflow', title: 'What I did' },
    ...(content.troubleshooting?.length ? [{ id: 'troubleshooting', title: 'Troubleshooting' }] : []),
    { id: 'verification', title: 'How I checked the result' },
    { id: 'lessons', title: 'What I learned' },
  ]
  const contents = <ol>{sections.map((section) => <li key={section.id}><a href={'#' + section.id}>{section.title}</a></li>)}</ol>
  const related = labs.filter((item) => item.slug !== lab.slug).sort((a, b) => Number(b.topics.some((topic) => lab.topics.includes(topic))) - Number(a.topics.some((topic) => lab.topics.includes(topic)))).slice(0, 2)
  return (
    <main id="main-content" tabIndex={-1}>
      <article className="lab-reader writeup-reader container">
        <nav className="article-breadcrumbs" aria-label="Breadcrumb"><ol><li><a href={siteUrl()}>Portfolio</a></li><li><a href={siteUrl('labs/')}>Labs</a></li><li aria-current="page">{lab.title}</li></ol></nav>
        <header className="article-header"><p className="eyebrow"><span aria-hidden="true" />{lab.category.toUpperCase()} · PRACTICAL LAB</p><h1>{lab.title}<span>.</span></h1><p className="article-summary">{lab.summary}</p><div className="article-meta"><span className="article-category">Educational lab</span><span>{lab.stepCount} steps</span><span>{lab.evidenceCount} reviewed screenshots</span></div><ul className="writeup-topics" aria-label="Topics">{lab.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul></header>
        <div className="article-layout">
          <aside className="article-sidebar"><nav aria-label="Table of contents"><h2>In this lab</h2>{contents}<details className="lab-step-nav"><summary>Browse the {lab.stepCount} steps<ChevronDown size={14} aria-hidden="true" /></summary><ol>{content.steps.map((step, index) => <li key={labStepId(index)}><a href={'#' + labStepId(index)}>{String(index + 1).padStart(2, '0')} · {step.title}</a></li>)}</ol></details><a className="article-library-link" href={siteUrl('labs/')}><ArrowLeft size={14} aria-hidden="true" />All labs</a></nav></aside>
          <div className="article-body lab-body">
            <details className="mobile-contents"><summary>In this lab<ChevronDown size={18} aria-hidden="true" /></summary><nav aria-label="Mobile table of contents">{contents}</nav></details>
            <p className="lab-context">My walkthrough of a training environment, based on my lab notes and captured evidence. Screenshots are cropped display copies; sensitive fields are removed.</p>
            <section className="lab-overview" aria-labelledby="overview"><h2 id="overview">The task & environment</h2><p>{content.overview}</p><ul className="lab-environment" aria-label="Lab environment">{content.environment.map((item) => <li key={item}>{item}</li>)}</ul>{content.variants && <p className="lab-variants">{content.variants}</p>}</section>
            <section className="lab-workflow" aria-labelledby="workflow"><h2 id="workflow">What I did</h2><ol className="lab-steps">{content.steps.map((step, index) => <li className="lab-step" key={labStepId(index)}><div className="lab-step-heading"><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h3 id={labStepId(index)}>{step.title}</h3></div><p>{step.description}</p>{step.commands && <div className="article-code"><span className="code-label">Verification commands</span><pre tabIndex={0} aria-label={'Commands for ' + step.title}><code>{step.commands}</code></pre></div>}{step.evidence?.map((id) => <LabEvidence key={id} id={id} />)}</li>)}</ol></section>
            {content.troubleshooting?.length && <section className="lab-troubleshooting" aria-labelledby="troubleshooting"><h2 id="troubleshooting">Troubleshooting</h2>{content.troubleshooting.map((problem) => <div className="lab-problem" key={problem.title}><h3>{problem.title}</h3><p><strong>What failed.</strong> {problem.symptom}</p><p><strong>What I changed.</strong> {problem.action}</p><p><strong>Result in my notes.</strong> {problem.result}</p></div>)}</section>}
            <section className="lab-verification" aria-labelledby="verification"><h2 id="verification">How I checked the result</h2><p className="lab-check-intro">The labels distinguish visible screenshot evidence from tests described in my notes.</p><ul className="lab-checks">{content.checks.map((check) => <li key={check.title}><Check size={17} aria-hidden="true" /><div><span className={'lab-check-basis ' + check.basis}>{check.basis === 'captured' ? 'CAPTURED EVIDENCE' : 'DOCUMENTED TEST'}</span><h3>{check.title}</h3><p>{check.description}</p></div></li>)}</ul></section>
            <section className="lab-lessons" aria-labelledby="lessons"><h2 id="lessons">What I learned</h2><ul>{content.lessons.map((lesson) => <li key={lesson}>{lesson}</li>)}</ul><p className="lab-scope">{content.scope}</p></section>
            <div className="article-end"><a className="text-link" href={siteUrl('labs/')}><ArrowLeft size={17} aria-hidden="true" />Back to all labs</a><a className="text-link" href="#top">Back to top<ArrowUpRight size={17} aria-hidden="true" /></a></div>
          </div>
        </div>
      </article>
      <section className="related-labs container" aria-labelledby="related-labs-title"><h2 id="related-labs-title">More practical labs</h2><div className="lab-grid">{related.map((item) => <LabCard key={item.slug} lab={item} />)}</div></section>
    </main>
  )
}
