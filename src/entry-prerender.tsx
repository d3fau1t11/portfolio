import { renderToString } from 'react-dom/server'
import { App } from './App'
import type { ArticleView, LabView, Page } from './App'
import { getWriteup } from './lib/writeups'
import { loadWriteupContent } from './lib/writeup-content'
import { getLab } from './lib/labs'
import { loadLabContent } from './lib/lab-content'

export async function renderPage(page: Page, slug?: string): Promise<string> {
  let article: ArticleView | undefined
  let labView: LabView | undefined
  if (page === 'writeup') {
    const writeup = getWriteup(slug ?? '')
    if (!writeup) throw new Error('Unknown write-up page')
    const [{ ArticleContent }, markdown] = await Promise.all([import('./components/ArticleContent'), loadWriteupContent(writeup.slug)])
    article = { writeup, markdown, content: <ArticleContent markdown={markdown} /> }
  }
  if (page === 'lab') {
    const lab = getLab(slug ?? '')
    if (!lab) throw new Error('Unknown lab page')
    labView = { lab, content: await loadLabContent(lab.slug) }
  }
  return renderToString(<App page={page} article={article} labView={labView} />)
}

