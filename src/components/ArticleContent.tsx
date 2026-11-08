import type { ComponentPropsWithoutRef } from 'react'
import Markdown from 'react-markdown'
import type { Components, ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { createHeadingIdFactory, safeArticleUrl } from '../lib/writeups'

interface TextTree { value?: string; children?: TextTree[] }
function textOf(node: TextTree | undefined): string {
  return node?.value ?? node?.children?.map(textOf).join('') ?? ''
}

export function ArticleContent({ markdown }: { markdown: string }) {
  const headingId = createHeadingIdFactory()
  function heading(level: 'h2' | 'h3' | 'h4' | 'h5' | 'h6') {
    return function Heading({ node, children, ...props }: ComponentPropsWithoutRef<'h2'> & ExtraProps) {
      const text = textOf(node)
      const id = headingId(text)
      const Tag = level
      return <Tag {...props} id={id}>{children}<a className="heading-anchor" href={'#' + id} aria-label={'Link to ' + text}>#</a></Tag>
    }
  }
  const components: Components = {
    h1: heading('h2'), h2: heading('h2'), h3: heading('h3'), h4: heading('h4'), h5: heading('h5'), h6: heading('h6'),
    a({ href, children, title }) {
      const safe = safeArticleUrl(href)
      if (!safe) return <span>{children}</span>
      const external = !safe.startsWith('#')
      return <a href={safe} title={title} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{children}</a>
    },
    img({ alt }) { return alt ? <span>{alt}</span> : null },
    pre({ node, children }) {
      const code = node?.children.find((child) => child.type === 'element' && child.tagName === 'code')
      const classes = code?.type === 'element' ? code.properties.className : undefined
      const language = Array.isArray(classes) ? String(classes.find((value) => String(value).startsWith('language-')) ?? '').replace('language-', '') : ''
      return <div className="article-code"><span className="code-label" aria-hidden="true">{language || 'text'}</span><pre tabIndex={0} aria-label={language ? language + ' code or output' : 'Code or recorded output'}>{children}</pre></div>
    },
    table({ children }) {
      return <div className="article-table-scroll" role="region" aria-label="Challenge data table" tabIndex={0}><table>{children}</table></div>
    },
  }
  return <div className="article-prose"><Markdown remarkPlugins={[remarkGfm]} skipHtml components={components} urlTransform={(url) => safeArticleUrl(url) ?? ''}>{markdown}</Markdown></div>
}
