import { ArrowUpRight, Braces, Database, Layers, Monitor, Smartphone } from 'lucide-react'
import * as m from 'motion/react-m'
import { projects } from '../data/projects'
import type { Project } from '../data/projects'
import { GitHubIcon } from './GitHubIcon'
import { SectionHeading } from './SectionHeading'

function TechnologyTags({ items }: { items: string[] }) {
  return <ul className="technology-tags" aria-label="Technologies">{items.map((item) => <li key={item}>{item}</li>)}</ul>
}

function ProjectLinks({ project, featured = false }: { project: Project; featured?: boolean }) {
  const privateSource = project.repositoryVisibility === 'private'
  const sourceLabel = privateSource ? 'Private repository' : featured ? 'Explore the repository' : 'View repository'
  return (
    <div className="project-links">
      <a className="text-link project-source" href={project.repository} target="_blank" rel="noopener noreferrer" aria-label={sourceLabel + ' for ' + project.name + ' on GitHub'}>
        <GitHubIcon size={16} aria-hidden="true" />{sourceLabel}<ArrowUpRight size={16} aria-hidden="true" />
      </a>
      {project.demo && <a className="text-link project-demo" href={project.demo} target="_blank" rel="noopener noreferrer" aria-label={'View live site for ' + project.name}>View live site<ArrowUpRight size={16} aria-hidden="true" /></a>}
    </div>
  )
}

function AttendanceArchitecture() {
  return (
    <figure className="architecture">
      <figcaption><span className="architecture-dot" aria-hidden="true" />ARCHITECTURE OVERVIEW</figcaption>
      <div className="architecture-clients">
        <div className="architecture-node"><Smartphone size={22} aria-hidden="true" /><strong>Mobile app</strong><span>Expo / React Native</span></div>
        <div className="architecture-node"><Monitor size={22} aria-hidden="true" /><strong>Admin interface</strong><span>React / Vite</span></div>
      </div>
      <div className="architecture-connector" aria-hidden="true"><span /></div>
      <div className="architecture-node api-node"><Braces size={23} aria-hidden="true" /><div><strong>TypeScript API</strong><span>Express</span></div><span className="node-side-label">REST</span></div>
      <div className="architecture-connector single" aria-hidden="true"><span /></div>
      <div className="architecture-node database-node"><Database size={22} aria-hidden="true" /><div><strong>PostgreSQL</strong><span>Drizzle ORM / Supabase</span></div></div>
      <div className="architecture-shared"><Layers size={15} aria-hidden="true" /><span>Shared attendance core</span></div>
    </figure>
  )
}

function SecondaryProject({ project, index }: { project: Project; index: string }) {
  return (
    <m.article className="project-card secondary-project" whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <div className="project-card-top"><span className="project-index">{index}</span><span className="project-category">{project.category}</span><ArrowUpRight size={19} aria-hidden="true" /></div>
      <div className="project-title-row"><h3>{project.name}</h3><span className="project-label">{project.label}</span></div>
      <div className="project-narrative"><p className="narrative-label">THE PROBLEM</p><p>{project.problem}</p></div>
      <div className="project-narrative"><p className="narrative-label">THE APPROACH</p><p>{project.solution}</p></div>
      <TechnologyTags items={project.technologies} />
      <ProjectLinks project={project} />
    </m.article>
  )
}

export function ProjectSection() {
  const featured = projects[0]
  return (
    <section className="section projects-section" id="projects" aria-labelledby="projects-title">
      <div className="container">
        <SectionHeading id="projects-title" eyebrow="SELECTED WORK" title="Software with a practical purpose."><p>Applications, websites and security research across personal work, academic projects and team prototypes. Explore the source and available live sites.</p></SectionHeading>
        <article className="project-card featured-project">
          <div className="featured-project-copy">
            <div className="project-card-top"><span className="project-index">01</span><span className="featured-badge">FEATURED PROJECT</span><span className="project-category">{featured.category}</span></div>
            <h3>{featured.name}</h3>
            <div className="project-narrative"><p className="narrative-label">THE PROBLEM</p><p>{featured.problem}</p></div>
            <div className="project-narrative"><p className="narrative-label">THE APPROACH</p><p>{featured.solution}</p></div>
            <ul className="implementation-list" aria-label="Implemented areas">{featured.focus.map((item) => <li key={item}><span aria-hidden="true" />{item}</li>)}</ul>
            <TechnologyTags items={featured.technologies} />
            <ProjectLinks project={featured} featured />
          </div>
          <AttendanceArchitecture />
        </article>
        <div className="secondary-project-grid">{projects.slice(1).map((project, index) => <SecondaryProject key={project.slug} project={project} index={String(index + 2).padStart(2, '0')} />)}</div>
      </div>
    </section>
  )
}

