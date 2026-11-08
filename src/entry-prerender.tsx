import { renderToString } from 'react-dom/server'
import { App } from './App'
import type { ArticleView, Page } from './App'
import { getWriteup } from './lib/writeups'
import { loadWriteupContent } from './lib/writeup-content'

export async function renderPage(page: Page, slug?: string): Promise<string> {
  let article: ArticleView | undefined
  if (page === 'writeup') {
    const writeup = getWriteup(slug ?? '')
    if (!writeup) throw new Error('Unknown write-up page')
    const [{ ArticleContent }, markdown] = await Promise.all([import('./components/ArticleContent'), loadWriteupContent(writeup.slug)])
    article = { writeup, markdown, content: <ArticleContent markdown={markdown} /> }
  }
  return renderToString(<App page={page} article={article} />)
}

