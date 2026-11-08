import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ctfEvent, ctfMonth, writeupCategories, writeups } from '../../src/data/writeups'
import { filterWriteups, getTableOfContents, safeArticleUrl } from '../../src/lib/writeups'
import { applyWriteupTemplate } from '../../src/lib/writeup-template'
import { ArticleContent } from '../../src/components/ArticleContent'

describe('supplied CTF collection', () => {
  it('keeps 30 unique articles, their supplied metadata and six subject categories', () => {
    expect(writeups).toHaveLength(30)
    expect(new Set(writeups.map((item) => item.slug)).size).toBe(30)
    for (const category of writeupCategories.filter((item) => item.id !== 'all')) {
      expect(writeups.filter((item) => item.category === category.id)).toHaveLength(5)
    }
    expect(ctfEvent).toBe('Tibeb / QIYAS CTF')
    expect(ctfMonth).toBe('October 2026')
    expect(writeups.find((item) => item.slug === 'two-seals')?.points).toBe(500)
    expect(writeups.find((item) => item.slug === 'shift-change')?.points).toBeUndefined()
    expect(writeups.filter((item) => item.featured).map((item) => item.slug)).toEqual(['the-template-loom', 'borrowed-badge', 'pixel-weave'])
  })

  it('combines normalized search terms with category without mutating records', () => {
    const before = JSON.stringify(writeups)
    expect(filterWriteups(writeups, '  SQL   SQLITE ', 'web').map((item) => item.slug)).toEqual(['catalogue-of-secrets'])
    expect(filterWriteups(writeups, 'ＮＯＮＣＥ', 'cryptography').map((item) => item.slug)).toEqual(['nonce-echo'])
    expect(filterWriteups(writeups, 'nonce', 'forensics')).toHaveLength(0)
    expect(filterWriteups(writeups, 'October 2026', 'all')).toHaveLength(30)
    expect(filterWriteups(writeups, 'dijkstra graph', 'misc').map((item) => item.slug)).toEqual(['caravan-routes'])
    expect(JSON.stringify(writeups)).toBe(before)
  })

  it('provides a Markdown source and recorded flag for every public record', () => {
    const directory = resolve('src/content/writeups')
    expect(readdirSync(directory).filter((name) => name.endsWith('.md')).sort()).toEqual(writeups.map((item) => item.slug + '.md').sort())
    for (const item of writeups) {
      const markdown = readFileSync(resolve(directory, item.slug + '.md'), 'utf8')
      expect(markdown).toMatch(/tibeb\{[a-z0-9_]+\}/)
      expect(getTableOfContents(markdown).length).toBeGreaterThan(0)
      expect(markdown).not.toMatch(/(?:[A-Z]:[\\/]Users|\.codex[\\/]attachments|\*\*Solves:\*\*)/)
    }
  })
})

describe('article navigation and content handling', () => {
  it('matches rendered heading anchors while ignoring code and disambiguating duplicates', () => {
    const markdown = '## Read the **source**\n\n```python\n## Fake heading\n```\n\n## Read the source\n\n### A detail\n\n## Café & `bits`\n'
    const contents = getTableOfContents(markdown)
    expect(contents.map((item) => item.id)).toEqual(['section-read-the-source', 'section-read-the-source-2', 'section-cafe-bits'])
    const html = renderToStaticMarkup(createElement(ArticleContent, { markdown }))
    for (const item of contents) expect(html).toContain('id="' + item.id + '"')
    expect(html).not.toContain('id="section-fake-heading"')
  })

  it('keeps pasted HTML and code inert and strips unsafe destinations', () => {
    const markdown = '<script>alert("raw")</script>\n\n[Bad](javascript:alert(1))\n\n[Local](file:///private)\n\n![Remote](https://example.test/pixel.png)\n\n[Challenge](https://challenges.tibeb.org/)\n\n```html\n<script>alert("example")</script>\n```'
    const html = renderToStaticMarkup(createElement(ArticleContent, { markdown }))
    expect(html).not.toMatch(/<script\b|<img\b|href="(?:javascript:|file:)/)
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('href="https://challenges.tibeb.org/"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).toContain('tabindex="0"')
  })

  it('allows documented web references and anchors while rejecting other protocols and credentials', () => {
    expect(safeArticleUrl('http://challenges.tibeb.org:8080/example/')).toBe('http://challenges.tibeb.org:8080/example/')
    expect(safeArticleUrl('#section-overview')).toBe('#section-overview')
    for (const url of ['javascript:alert(1)', 'data:text/html,hello', 'file:///private', '//example.test/', 'https://user:password@example.test/', '../unknown']) {
      expect(safeArticleUrl(url)).toBeUndefined()
    }
  })

  it('escapes article metadata before inserting it in an HTML template', () => {
    const template = '<title>__WRITEUP_TITLE__</title><meta content="__WRITEUP_DESCRIPTION__"><body data-slug="__WRITEUP_SLUG__">'
    const html = applyWriteupTemplate(template, { ...writeups[0], title: 'Quotes " & <tags>', summary: 'An <example> with "quotes".' })
    expect(html).not.toContain('<tags>')
    expect(html).toContain('&quot;')
    expect(html).toContain('&lt;example&gt;')
    expect(html).not.toContain('__WRITEUP_')
  })
})
