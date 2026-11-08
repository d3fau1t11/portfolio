import { ArrowUpRight, BookOpen, Braces, Fingerprint, GraduationCap, Layers, MapPin, Network, ShieldCheck, Trophy } from 'lucide-react'
import { profile } from '../data/profile'
import { siteUrl } from '../lib/urls'
import { Hero } from '../components/Hero'
import { ProjectSection } from '../components/ProjectSection'
import { SectionHeading } from '../components/SectionHeading'
import { FeaturedCredentials } from '../components/FeaturedCredentials'
import { ContactSection } from '../components/ContactSection'
import { WriteupSection } from '../components/WriteupSection'

function AboutSection() {
  return (
    <section className="section about-section" id="about" aria-labelledby="about-title">
      <div className="container about-grid">
        <div className="about-copy">
          <p className="eyebrow"><span aria-hidden="true" />ABOUT ME</p>
          <h2 id="about-title">A developer’s curiosity.<br /><span>A security mindset.</span></h2>
          <p>{profile.about}</p>
          <span className="location-label"><MapPin size={15} aria-hidden="true" />{profile.location}</span>
          <div className="about-principle"><span aria-hidden="true" /><p>Understanding a system means learning both how to build it and how it can fail.</p></div>
        </div>
        <div className="education-list" role="group" aria-label="Current education and training">
          <article className="education-card"><span className="education-icon"><GraduationCap size={23} aria-hidden="true" /></span><div><span className="study-status">CURRENTLY ATTENDING</span><h3>BSc Computer Science</h3><p>Unity University</p><span className="education-detail">Expected graduation · 2027</span></div></article>
          <article className="education-card"><span className="education-icon"><BookOpen size={22} aria-hidden="true" /></span><div><span className="study-status">IN PROGRESS</span><h3>Cybersecurity Training Program</h3><p>IBT College of Canada</p><span className="education-detail">Addis Ababa, Ethiopia</span><p className="study-topics">Computer networking, Windows and Linux administration, penetration testing, and offensive and defensive security activities.</p></div></article>
        </div>
      </div>
      <div className="container expertise-grid">
        <div className="expertise-item"><Braces size={20} aria-hidden="true" /><h3>Web & mobile</h3><p>React · React Native · Expo<br />JavaScript · TypeScript</p></div>
        <div className="expertise-item"><Layers size={20} aria-hidden="true" /><h3>Backend & data</h3><p>Express · API development<br />PostgreSQL · Drizzle · Firebase</p></div>
        <div className="expertise-item"><ShieldCheck size={20} aria-hidden="true" /><h3>Security practice</h3><p>Authentication · Access control<br />Networks · Windows · Linux · CTFs</p></div>
      </div>
    </section>
  )
}

function SecuritySection() {
  const areas = [
    { icon: Fingerprint, title: 'Applications & access', description: 'Developing skills in web application testing, authentication and access-control assessment.' },
    { icon: Network, title: 'Systems & networks', description: 'Studying network security and Windows and Linux administration through ongoing training.' },
    { icon: ShieldCheck, title: 'Offense & defense', description: 'Learning vulnerability analysis, penetration testing and defensive thinking through practical security study.' },
  ]
  return (
    <section className="section security-section" id="security" aria-labelledby="security-title">
      <div className="container">
        <SectionHeading id="security-title" eyebrow="CYBERSECURITY" title="Think like a builder. Question like a tester."><p>I’m developing offensive and defensive skills through ongoing training and CTF competitions, with a focus on responsible practice and understanding security boundaries.</p></SectionHeading>
        <div className="security-areas">{areas.map(({ icon: Icon, title, description }) => <article key={title}><span className="security-area-icon"><Icon size={22} aria-hidden="true" /></span><h3>{title}</h3><p>{description}</p></article>)}</div>
        <div className="ctf-heading"><Trophy size={18} aria-hidden="true" /><h3>Competition experience</h3><span>LEARNING UNDER PRESSURE</span></div>
        <div className="ctf-grid">
          <article className="ctf-card national-ctf"><span className="ctf-kicker">UNIVERSITY CTF · ETHIOPIA</span><div className="ctf-rank">5<span>th</span></div><h4>National placement</h4><p>Solo competitor in the University Capture The Flag Cybersecurity Competition.</p><span className="ctf-type">Individual result</span></article>
          <article className="ctf-card htb-ctf"><span className="ctf-kicker">HACK THE BOX · 2026</span><h4>Cyber Apocalypse CTF<br />The Salt Crown</h4><p>Participated with <strong>Abyssinia Cyber</strong>. The team finished <strong>668 of 6,744 teams</strong>.</p><span className="ctf-type">Team result · 24–29 July 2026</span><a className="text-link" href={siteUrl('certifications/#htb-cyber-apocalypse')}>Participation details<ArrowUpRight size={15} aria-hidden="true" /></a></article>
        </div>
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Hero />
      <AboutSection />
      <ProjectSection />
      <SecuritySection />
      <WriteupSection />
      <FeaturedCredentials />
      <ContactSection />
    </main>
  )
}

