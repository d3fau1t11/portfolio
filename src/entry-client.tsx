import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './App'
import type { ArticleView, LabView, Page } from './App'
import { getWriteup } from './lib/writeups'
import { loadWriteupContent } from './lib/writeup-content'
import { getLab } from './lib/labs'
import { loadLabContent } from './lib/lab-content'
import './styles.css'

const root = document.getElementById('root')
if (!root) throw new Error('Missing application root')
document.documentElement.classList.add('js-ready')

const requestedPage = document.body.dataset.page
const page: Page = requestedPage === 'certifications' || requestedPage === 'writeups' || requestedPage === 'writeup' || requestedPage === 'labs' || requestedPage === 'lab' ? requestedPage : 'home'
let article: ArticleView | undefined
let labView: LabView | undefined
if (page === 'writeup') {
  const writeup = getWriteup(document.body.dataset.slug ?? '')
  if (!writeup) throw new Error('Unknown write-up page')
  const [{ ArticleContent }, markdown] = await Promise.all([import('./components/ArticleContent'), loadWriteupContent(writeup.slug)])
  article = { writeup, markdown, content: <ArticleContent markdown={markdown} /> }
}
if (page === 'lab') {
  const lab = getLab(document.body.dataset.slug ?? '')
  if (!lab) throw new Error('Unknown lab page')
  labView = { lab, content: await loadLabContent(lab.slug) }
}
const app = <StrictMode><App page={page} article={article} labView={labView} /></StrictMode>

if (root.children.length > 0) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}

