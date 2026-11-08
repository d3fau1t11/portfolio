import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
})

try {
  const { renderPage } = await server.ssrLoadModule('/src/entry-prerender.tsx')
  const { writeups } = await server.ssrLoadModule('/src/data/writeups.ts')
  const { applyWriteupTemplate } = await server.ssrLoadModule('/src/lib/writeup-template.ts')
  const articleTemplate = await readFile(resolve('dist/writeups/article.html'), 'utf8')
  const manifest = JSON.parse(await readFile(resolve('dist/.vite/manifest.json'), 'utf8'))
  const pages = [
    { page: 'home', file: 'dist/index.html' },
    { page: 'certifications', file: 'dist/certifications/index.html' },
    { page: 'writeups', file: 'dist/writeups/index.html' },
    ...writeups.map((writeup) => ({ page: 'writeup', file: 'dist/writeups/' + writeup.slug + '/index.html', writeup })),
  ]

  for (const { page, file, writeup } of pages) {
    const path = resolve(file)
    const template = writeup ? applyWriteupTemplate(articleTemplate, writeup) : await readFile(path, 'utf8')
    if (!template.includes('<!--prerender-->')) throw new Error('Missing prerender marker: ' + file)
    const rendered = await renderPage(page, writeup?.slug)
    let html = template.replace('<!--prerender-->', () => rendered)
    for (const [source, asset] of Object.entries(manifest)) {
      if (/\.(webp|woff2)$/.test(source)) html = html.replaceAll('/portfolio/' + source, '/portfolio/' + asset.file)
    }
    if (page === 'home') {
      const person = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Habtemariam Chuchu',
        url: 'https://d3fau1t11.github.io/portfolio/',
        sameAs: ['https://github.com/d3fau1t11'],
      }).replaceAll('<', '\\u003c')
      html = html.replace('</head>', () => '<script type="application/ld+json">' + person + '</script></head>')
    }
    if (writeup) {
      const article = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article', headline: writeup.title,
        description: writeup.summary, inLanguage: 'en',
        url: 'https://d3fau1t11.github.io/portfolio/writeups/' + writeup.slug + '/',
        author: { '@type': 'Person', name: 'Habtemariam Chuchu', url: 'https://d3fau1t11.github.io/portfolio/' },
        keywords: writeup.topics.join(', '),
      }).replaceAll('<', '\\u003c')
      html = html.replace('</head>', () => '<script type="application/ld+json">' + article + '</script></head>')
      await mkdir(resolve(path, '..'), { recursive: true })
    }
    await writeFile(path, html)
    process.stdout.write('Prerendered ' + file + '\n')
  }
  // Only this known generated template is removed; source files are retained.
  await rm(resolve('dist/writeups/article.html'))
  const urls = ['', 'certifications/', 'writeups/', ...writeups.map((item) => 'writeups/' + item.slug + '/')]
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((url) => '  <url><loc>https://d3fau1t11.github.io/portfolio/' + url + '</loc></url>').join('\n') + '\n</urlset>\n'
  await writeFile(resolve('dist/sitemap.xml'), sitemap)
} finally {
  await server.close()
}

