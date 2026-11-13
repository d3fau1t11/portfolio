import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
})

try {
  const siteOrigin = 'https://d3fau1t11.github.io/portfolio/'
  const personId = siteOrigin + '#person'
  const websiteId = siteOrigin + '#website'
  const { profile } = await server.ssrLoadModule('/src/data/profile.ts')
  const { renderPage } = await server.ssrLoadModule('/src/entry-prerender.tsx')
  const { writeups } = await server.ssrLoadModule('/src/data/writeups.ts')
  const { labs } = await server.ssrLoadModule('/src/data/labs.ts')
  const { applyWriteupTemplate } = await server.ssrLoadModule('/src/lib/writeup-template.ts')
  const { applyLabTemplate } = await server.ssrLoadModule('/src/lib/lab-template.ts')
  const articleTemplate = await readFile(resolve('dist/writeups/article.html'), 'utf8')
  const labTemplate = await readFile(resolve('dist/labs/article.html'), 'utf8')
  const manifest = JSON.parse(await readFile(resolve('dist/.vite/manifest.json'), 'utf8'))
  const collections = {
    certifications: { name: 'Credentials & Achievements', url: siteOrigin + 'certifications/' },
    writeups: { name: 'CTF Write-ups', url: siteOrigin + 'writeups/' },
    labs: { name: 'Server Administration & VMware Labs', url: siteOrigin + 'labs/' },
  }
  const pages = [
    { page: 'home', file: 'dist/index.html' },
    { page: 'certifications', file: 'dist/certifications/index.html' },
    { page: 'writeups', file: 'dist/writeups/index.html' },
    { page: 'labs', file: 'dist/labs/index.html' },
    ...writeups.map((writeup) => ({ page: 'writeup', file: 'dist/writeups/' + writeup.slug + '/index.html', writeup })),
    ...labs.map((lab) => ({ page: 'lab', file: 'dist/labs/' + lab.slug + '/index.html', lab })),
  ]

  for (const { page, file, writeup, lab } of pages) {
    const path = resolve(file)
    const template = writeup ? applyWriteupTemplate(articleTemplate, writeup) : lab ? applyLabTemplate(labTemplate, lab) : await readFile(path, 'utf8')
    if (!template.includes('<!--prerender-->')) throw new Error('Missing prerender marker: ' + file)
    const rendered = await renderPage(page, writeup?.slug ?? lab?.slug)
    let html = template.replace('<!--prerender-->', () => rendered)
    for (const [source, asset] of Object.entries(manifest)) {
      if (/\.(webp|woff2)$/.test(source)) html = html.replaceAll('/portfolio/' + source, '/portfolio/' + asset.file)
    }
    if (page === 'home') {
      const person = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Person', '@id': personId, name: profile.name,
            description: profile.intro, url: siteOrigin,
            sameAs: [profile.github, profile.telegram], knowsAbout: profile.skills,
          },
          {
            '@type': 'WebSite', '@id': websiteId, name: profile.name + ' — Portfolio',
            url: siteOrigin, inLanguage: 'en', publisher: { '@id': personId },
          },
          {
            '@type': 'ProfilePage', '@id': siteOrigin + '#profile',
            name: profile.name + ' — Software, Security & Server Administration',
            url: siteOrigin, description: profile.intro,
            mainEntity: { '@id': personId }, isPartOf: { '@id': websiteId },
          },
        ],
      }).replaceAll('<', '\\u003c')
      html = html.replace('</head>', () => '<script type="application/ld+json">' + person + '</script></head>')
    }
    if (writeup) {
      const article = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article', headline: writeup.title,
        description: writeup.summary, inLanguage: 'en',
        url: 'https://d3fau1t11.github.io/portfolio/writeups/' + writeup.slug + '/',
        mainEntityOfPage: siteOrigin + 'writeups/' + writeup.slug + '/',
        image: [siteOrigin + 'social-card.png'], isPartOf: { '@id': websiteId },
        author: { '@type': 'Person', '@id': personId, name: profile.name, url: siteOrigin },
        keywords: writeup.topics.join(', '),
      }).replaceAll('<', '\\u003c')
      html = html.replace('</head>', () => '<script type="application/ld+json">' + article + '</script></head>')
      await mkdir(resolve(path, '..'), { recursive: true })
    }
    if (lab) {
      const article = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article', headline: lab.title,
        description: lab.summary, inLanguage: 'en',
        url: 'https://d3fau1t11.github.io/portfolio/labs/' + lab.slug + '/',
        mainEntityOfPage: siteOrigin + 'labs/' + lab.slug + '/',
        image: [siteOrigin + 'social-card.png'], isPartOf: { '@id': websiteId },
        author: { '@type': 'Person', '@id': personId, name: profile.name, url: siteOrigin },
        keywords: lab.topics.join(', '),
      }).replaceAll('<', '\\u003c')
      html = html.replace('</head>', () => '<script type="application/ld+json">' + article + '</script></head>')
      await mkdir(resolve(path, '..'), { recursive: true })
    }
    if (page !== 'home') {
      const collection = collections[writeup ? 'writeups' : lab ? 'labs' : page]
      const item = writeup ?? lab
      const breadcrumbs = [
        { '@type': 'ListItem', position: 1, name: profile.name, item: siteOrigin },
        { '@type': 'ListItem', position: 2, name: collection.name, item: collection.url },
      ]
      if (item) breadcrumbs.push({ '@type': 'ListItem', position: 3, name: item.title, item: collection.url + item.slug + '/' })
      const graph = [{ '@type': 'BreadcrumbList', itemListElement: breadcrumbs }]
      if (!item) {
        const entries = page === 'labs' ? labs : page === 'writeups' ? writeups : []
        graph.push({
          '@type': 'CollectionPage', name: collection.name, url: collection.url,
          inLanguage: 'en', isPartOf: { '@id': websiteId },
          ...(entries.length ? { mainEntity: {
            '@type': 'ItemList', numberOfItems: entries.length,
            itemListElement: entries.map((entry, index) => ({
              '@type': 'ListItem', position: index + 1, name: entry.title,
              url: collection.url + entry.slug + '/',
            })),
          } } : {}),
        })
      }
      const discovery = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c')
      html = html.replace('</head>', () => '<script type="application/ld+json">' + discovery + '</script></head>')
    }
    await writeFile(path, html)
    process.stdout.write('Prerendered ' + file + '\n')
  }
  // Only this known generated template is removed; source files are retained.
  await rm(resolve('dist/writeups/article.html'))
  await rm(resolve('dist/labs/article.html'))
  const urls = ['', 'certifications/', 'writeups/', 'labs/', ...writeups.map((item) => 'writeups/' + item.slug + '/'), ...labs.map((item) => 'labs/' + item.slug + '/')]
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((url) => '  <url><loc>https://d3fau1t11.github.io/portfolio/' + url + '</loc></url>').join('\n') + '\n</urlset>\n'
  await writeFile(resolve('dist/sitemap.xml'), sitemap)
} finally {
  await server.close()
}

