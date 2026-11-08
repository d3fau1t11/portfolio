import assert from 'node:assert/strict'
import { readdir, readFile, stat } from 'node:fs/promises'
import { resolve, relative, extname } from 'node:path'
import { gzipSync } from 'node:zlib'

const base = '/portfolio/'
const output = resolve('dist')
const writeupSlugs = (await readdir(resolve('src/content/writeups'))).filter((file) => file.endsWith('.md')).map((file) => file.slice(0, -3)).sort()
assert.equal(writeupSlugs.length, 30, 'Expected 30 supplied write-ups')
const pages = ['index.html', 'certifications/index.html', 'writeups/index.html', ...writeupSlugs.map((slug) => 'writeups/' + slug + '/index.html')]
const files = []
const approvedArtwork = new Set(['favicon.svg', 'social-card.svg', 'social-card.png'])

async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) await collect(path)
    else files.push(path)
  }
}
await collect(output)

const forbidden = [
  /\bForgeNext\b/i,
  /(?:Cers[\\/]|CERTIFICATES\.md|PRIVATE_VERIFICATION)/i,
  /(?:[A-Z]:[\\/]Users[\\/])/i,
  /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i,
  /(?:www\.)?(?:udacity|mygreatlearning)\.com\/(?:certificate|confirm)/i,
  /opswatacademy\.com\/certificate/i,
]
for (const path of files) {
  assert(!/\.(pdf|jpe?g)$/i.test(path), 'Unreviewed document/image in output: ' + relative(output, path))
  if (/\.(svg|png|webp|gif|avif)$/i.test(path)) {
    const name = relative(output, path).replaceAll('\\', '/')
    assert(approvedArtwork.has(name), 'Artwork requires publication review: ' + name)
  }
  if (/\.(html|js|css|json|xml|txt)$/i.test(path)) {
    const text = await readFile(path, 'utf8')
    // Only the specifically authorized CTF host's historical challenge URLs
    // may contain UUIDs. Certificate IDs and other UUIDs still fail the scan.
    const reviewed = text.replace(/https?:\/\/challenges\.tibeb\.org(?::8080)?\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, 'CTF_CHALLENGE_REFERENCE')
    for (const pattern of forbidden) assert(!pattern.test(reviewed), 'Private/excluded content in ' + relative(output, path))
  }
}
assert.equal(files.filter((path) => path.endsWith('.html')).length, 33, 'Expected 33 actual static HTML pages')

for (const page of pages) {
  const html = await readFile(resolve(output, page), 'utf8')
  assert(!html.includes('<!--prerender-->'), 'Page lacks prerendered content: ' + page)
  assert(!html.includes('__WRITEUP_'), 'Article metadata was not populated: ' + page)
  assert(html.includes('Habtemariam'), 'Profile missing from HTML: ' + page)
  assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Page must contain one primary heading')
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
  assert.equal(new Set(ids).size, ids.length, 'Duplicate element IDs: ' + page)

  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = match[1]
    if (/^(https?:|mailto:)/.test(url)) continue
    if (url.startsWith('#')) {
      assert(ids.includes(decodeURIComponent(url.slice(1))), 'Missing page anchor: ' + url)
      continue
    }
    assert(url.startsWith(base), 'Asset/link escapes Pages base: ' + url)
    const pathname = decodeURIComponent(url.split(/[?#]/)[0]).slice(base.length)
    const target = pathname === '' ? resolve(output, 'index.html') : pathname.endsWith('/') ? resolve(output, pathname, 'index.html') : resolve(output, pathname)
    assert(target.startsWith(output), 'Asset path outside output')
    await stat(target)
    const fragment = url.split('#')[1]
    if (fragment) {
      const targetHtml = await readFile(target, 'utf8')
      const targetIds = [...targetHtml.matchAll(/\bid="([^"]+)"/g)].map((item) => item[1])
      assert(targetIds.includes(decodeURIComponent(fragment)), 'Missing destination anchor: ' + url)
    }
  }
}
const home = await readFile(resolve(output, 'index.html'), 'utf8')
const collection = await readFile(resolve(output, 'certifications/index.html'), 'utf8')
const writeupCollection = await readFile(resolve(output, 'writeups/index.html'), 'utf8')
assert(home.includes('Currently') || home.includes('CURRENTLY ATTENDING'), 'Education status missing')
assert(home.includes('Expected graduation'), 'Expected graduation missing')
assert.equal((collection.match(/class="credential-card/g) || []).length, 21, 'Expected all 21 safe metadata records')
assert.equal((writeupCollection.match(/class="writeup-card(?:\s|")/g) || []).length, 30, 'Expected all 30 write-up cards')
assert.equal((home.match(/class="writeup-card(?:\s|")/g) || []).length, 3, 'Expected three featured write-ups')
const projectSection = home.match(/<section[^>]+id="projects"[\s\S]*?<\/section>/)?.[0] ?? ''
assert.deepEqual([...projectSection.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map((match) => match[1]), [
  'Attendance App', 'WatchVault', 'GPA Calculator', 'Green Africa Farms', 'TrueImpact',
  'Remote Admin Tool', 'BookReview', 'Python Reverse TCP', 'Forge', 'Social Media Link Hub', 'Hary Pictures',
], 'Unexpected project showcase')
assert.deepEqual([...projectSection.matchAll(/class="text-link project-demo" href="([^"]+)"/g)].map((match) => match[1]), [
  'https://watchvaults.netlify.app/',
  'https://green-farms.netlify.app/',
  'https://trueimpact1.netlify.app/',
  'https://ip-final-project.vercel.app/',
  'https://mezmuredawit.netlify.app/',
  'https://harypictures.netlify.app/',
], 'Supplied live-site links missing or changed')
assert(projectSection.includes('Private repository for Green Africa Farms on GitHub'), 'Private source availability must be clear')
const credentialSection = home.match(/<section[^>]+id="credentials"[\s\S]*?<\/section>/)?.[0] ?? ''
const featuredCredentials = [...credentialSection.matchAll(/class="credential-card[^"]*" id="([^"]+)"/g)].map((match) => match[1])
assert.deepEqual(featuredCredentials, ['insa-summer-camp', 'iso-iec-27001-lead-auditor', 'fortigate-operator', 'opswat-icip'], 'Featured credentials missing or out of order')
assert(!/hero-portrait|habtemariam-portrait|portrait-frame/i.test(home), 'Profile picture must be absent')
assert(!files.some((path) => /habtemariam-portrait/i.test(path)), 'Removed portrait asset is still in output')
assert(!/6th|7th|53 teams/i.test(home + collection), 'Unresolved competition rank present')
assert(!/certified API developer|certified by ISO/i.test(home + collection), 'Credential overclaim present')
for (const slug of writeupSlugs) {
  const markdown = await readFile(resolve('src/content/writeups', slug + '.md'), 'utf8')
  const article = await readFile(resolve(output, 'writeups', slug, 'index.html'), 'utf8')
  assert(article.includes('class="article-prose"'), 'Missing article text: ' + slug)
  const flags = new Set(markdown.match(/tibeb\{[a-z0-9_]+\}/g))
  assert(flags.size > 0, 'Missing recorded flag: ' + slug)
  for (const flag of flags) assert(article.includes(flag), 'Recorded flag lost during rendering: ' + slug)
}
const sitemap = await readFile(resolve(output, 'sitemap.xml'), 'utf8')
assert.equal((sitemap.match(/<loc>/g) || []).length, 33, 'Sitemap must include every static page')

const bundles = []
for (const path of files.filter((path) => /\.(js|css)$/.test(path))) {
  const bytes = gzipSync(await readFile(path)).byteLength
  const limit = extname(path) === '.js' ? 180 * 1024 : 35 * 1024
  assert(bytes <= limit, 'Bundle exceeds budget: ' + relative(output, path))
  bundles.push({ name: relative(output, path), bytes })
}
for (const bundle of bundles.sort((a, b) => b.bytes - a.bytes).slice(0, 3)) {
  process.stdout.write(bundle.name + ': ' + (bundle.bytes / 1024).toFixed(1) + ' KiB gzip\n')
}
process.stdout.write('Verified 33 real static pages, 11 projects, 6 live-site links, 4 featured credentials, 30 supplied write-ups, 21 credential records, picture removal, navigation and public-data boundaries.\n')

