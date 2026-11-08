import type { ReactNode } from 'react'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import { SiteHeader } from './components/SiteHeader'
import { SiteFooter } from './components/SiteFooter'
import { HomePage } from './pages/HomePage'
import { CredentialsPage } from './pages/CredentialsPage'
import { WriteupsPage } from './pages/WriteupsPage'
import { WriteupPage } from './pages/WriteupPage'
import type { Writeup } from './data/writeups'

export type Page = 'home' | 'certifications' | 'writeups' | 'writeup'
export interface ArticleView { writeup: Writeup; markdown: string; content: ReactNode }

export function App({ page, article }: { page: Page; article?: ArticleView }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <div id="top" />
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <SiteHeader page={page} />
        {page === 'home' && <HomePage />}
        {page === 'certifications' && <CredentialsPage />}
        {page === 'writeups' && <WriteupsPage />}
        {page === 'writeup' && article && <WriteupPage writeup={article.writeup} markdown={article.markdown}>{article.content}</WriteupPage>}
        <SiteFooter />
      </LazyMotion>
    </MotionConfig>
  )
}

