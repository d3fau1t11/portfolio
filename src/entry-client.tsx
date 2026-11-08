import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './App'
import type { ArticleView, Page } from './App'
import { getWriteup } from './lib/writeups'
import { loadWriteupContent } from './lib/writeup-content'
import './styles.css'

const root = document.getElementById('root')
if (!root) throw new Error('Missing application root')
document.documentElement.classList.add('js-ready')

const requestedPage = document.body.dataset.page
const page: Page = requestedPage === 'certifications' || requestedPage === 'writeups' || requestedPage === 'writeup' ? requestedPage : 'home'
let article: ArticleView | undefined
if (page === 'writeup') {
  const writeup = getWriteup(document.body.dataset.slug ?? '')
  if (!writeup) throw new Error('Unknown write-up page')
  const [{ ArticleContent }, markdown] = await Promise.all([import('./components/ArticleContent'), loadWriteupContent(writeup.slug)])
  article = { writeup, markdown, content: <ArticleContent markdown={markdown} /> }
}
const app = <StrictMode><App page={page} article={article} /></StrictMode>

if (root.children.length > 0) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}

