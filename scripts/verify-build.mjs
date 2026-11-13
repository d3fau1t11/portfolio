import assert from 'node:assert/strict'
import { readdir, readFile, stat } from 'node:fs/promises'
import { resolve, relative, extname } from 'node:path'
import { gzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'

const base = '/portfolio/'
const siteOrigin = 'https://d3fau1t11.github.io' + base
const output = resolve('dist')
const writeupSlugs = (await readdir(resolve('src/content/writeups'))).filter((file) => file.endsWith('.md')).map((file) => file.slice(0, -3)).sort()
assert.equal(writeupSlugs.length, 30, 'Expected 30 supplied write-ups')
const labs = JSON.parse(await readFile(resolve('src/data/labs.json'), 'utf8'))
const labAssets = JSON.parse(await readFile(resolve('src/data/lab-assets.json'), 'utf8'))
const labSlugs = labs.map((lab) => lab.slug)
assert.equal(labs.length, 9, 'Expected nine reviewed server and virtualization labs')
assert.equal(new Set(labSlugs).size, labs.length, 'Duplicate lab slugs')
assert.deepEqual([...labSlugs].sort(), ['active-directory-deployment', 'windows-dhcp-wds', 'ad-accounts-access-controls', 'windows-storage-raid', 'rras-vpn-nat', 'domain-controller-replication', 'external-domain-trust', 'windows-network-load-balancing', 'nested-esxi-virtualization'].sort(), 'Only the approved server and virtualization labs may be included')
assert(labs.every((lab) => ['Windows Server', 'Virtualization'].includes(lab.category) && !Object.hasOwn(lab, 'module')), 'Course/module metadata must be absent')
assert.deepEqual((await readdir(resolve('src/content/labs'))).sort(), labSlugs.map((slug) => slug + '.json').sort(), 'Missing or unexpected lab sources')
assert.equal(labs.reduce((count, lab) => count + lab.stepCount, 0), 97, 'Expected 97 documented steps')
const labContents = new Map(await Promise.all(labs.map(async (lab) => {
  assert.match(lab.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid lab slug')
  return [lab.slug, JSON.parse(await readFile(resolve('src/content/labs', lab.slug + '.json'), 'utf8'))]
})))
const pages = ['index.html', 'certifications/index.html', 'writeups/index.html', 'labs/index.html', ...writeupSlugs.map((slug) => 'writeups/' + slug + '/index.html'), ...labSlugs.map((slug) => 'labs/' + slug + '/index.html')]
assert.equal(pages.length, 43, 'Expected 43 static pages')
const googleVerificationFile = 'google27aa09e668bdc9f3.html'
const googleVerificationSource = await readFile(resolve('public', googleVerificationFile))
assert.equal(googleVerificationSource.toString('utf8').trim(), 'google-site-verification: ' + googleVerificationFile, 'Only the supplied Google verification text may be published')
assert.deepEqual(await readFile(resolve(output, googleVerificationFile)), googleVerificationSource, 'Google verification file must be copied without changes')
const files = []
const approvedArtwork = new Set(['favicon.svg', 'social-card.svg', 'social-card.png'])
const certificateAssets = JSON.parse(await readFile(resolve('src/data/certificate-assets.json'), 'utf8'))
const reviewedCertificateFiles = new Map()
assert.equal(Object.keys(certificateAssets).length, 21, 'Expected 21 reviewed certificate display copies')
for (const [slug, asset] of Object.entries(certificateAssets)) {
  assert.equal(asset.file, 'certificates/' + slug + '.pdf', 'Invalid reviewed document path')
  assert.equal(asset.pages.length, 1, 'Expected one nonblank display page per certificate')
  reviewedCertificateFiles.set(asset.file, asset.sha256)
  for (const page of asset.pages) {
    assert.equal(page.file, 'certificates/' + slug + '.webp', 'Invalid reviewed preview path')
    assert(page.width > 0 && page.height > 0, 'Missing preview dimensions')
    reviewedCertificateFiles.set(page.file, page.sha256)
  }
}

const reviewedLabFiles = new Map()
assert.equal(Object.keys(labAssets).length, 69, 'Expected 69 reviewed lab screenshots')
for (const [id, asset] of Object.entries(labAssets)) {
  assert.match(id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid lab evidence identifier')
  assert.equal(asset.file, 'labs/screenshots/' + id + '.webp', 'Invalid reviewed screenshot path')
  assert(Number.isInteger(asset.width) && asset.width > 0 && asset.width <= 1600, 'Invalid screenshot width')
  assert(Number.isInteger(asset.height) && asset.height > 0 && asset.height <= 1200, 'Invalid screenshot height')
  assert(asset.alt.trim().length > 10 && asset.caption.trim().length > 10, 'Missing screenshot description')
  assert.match(asset.sha256, /^[a-f0-9]{64}$/, 'Missing reviewed screenshot hash')
  reviewedLabFiles.set(asset.file, asset.sha256)
}
assert.equal(reviewedLabFiles.size, 69, 'Duplicate reviewed screenshot paths')
const referencedEvidence = new Set()
for (const lab of labs) {
  const content = labContents.get(lab.slug)
  assert.equal(content.steps.length, lab.stepCount, 'Lab step count mismatch: ' + lab.slug)
  assert(content.overview && content.environment.length && content.checks.length && content.lessons.length && content.scope, 'Incomplete walkthrough: ' + lab.slug)
  const evidence = new Set()
  for (const step of content.steps) {
    assert(step.title && step.description, 'Empty lab step: ' + lab.slug)
    for (const id of step.evidence ?? []) {
      assert(labAssets[id], 'Missing or mismatched screenshot: ' + id)
      evidence.add(id)
      referencedEvidence.add(id)
    }
  }
  assert.equal(evidence.size, lab.evidenceCount, 'Lab screenshot count mismatch: ' + lab.slug)
  if (lab.cover) assert(evidence.has(lab.cover), 'Cover must come from the lab evidence: ' + lab.slug)
  for (const check of content.checks) {
    assert(['captured', 'documented'].includes(check.basis), 'Missing evidence basis: ' + lab.slug)
    if (check.basis === 'captured') assert(evidence.size > 0, 'Captured result lacks evidence: ' + lab.slug)
  }
}
assert.deepEqual([...referencedEvidence].sort(), Object.keys(labAssets).sort(), 'Unused or unapproved screenshots')

function checkWebp(bytes, name) {
  assert.equal(bytes.subarray(0, 4).toString(), 'RIFF', 'Invalid WebP container: ' + name)
  assert.equal(bytes.subarray(8, 12).toString(), 'WEBP', 'Invalid WebP signature: ' + name)
  assert.equal(bytes.readUInt32LE(4) + 8, bytes.length, 'Invalid WebP length: ' + name)
  let offset = 12
  while (offset + 8 <= bytes.length) {
    const type = bytes.subarray(offset, offset + 4).toString()
    assert(!['EXIF', 'XMP '].includes(type), 'Private image metadata present: ' + name)
    const size = bytes.readUInt32LE(offset + 4)
    offset += 8 + size + (size % 2)
    assert(offset <= bytes.length, 'Invalid WebP chunk: ' + name)
  }
  assert.equal(offset, bytes.length, 'Unexpected image payload: ' + name)
}

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
  /\bIBT\b|\bmodules?\s+[23]\b|labs\/module-[23]\//i,
  /(?:Telegram[ /]Desktop|ibt-review|private-(?:index|asset-provenance|candidate-ocr)|candidate-assets\.json)/i,
  /(?:file:\/\/|\.codex[\\/]|Downloads[\\/]Telegram)/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
  /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[A-Z0-9]{16})\b/,
  /(?:^|\n|\\n)\s*(?:enable\s+(?:secret|password)|crypto\s+isakmp\s+key|username\s+\S+\s+(?:password|secret))\s+\S+/i,
]
for (const path of files) {
  const name = relative(output, path).replaceAll('\\', '/')
  assert(!/\.(?:docx?|docm|odt|rtf|xlsx?|xlsm|csv|pkt|pka|zip|7z|rar|bin|iso|img|vmdk|vmx|vhdx?|ova|ovf|pem|key|pfx|pcap(?:ng)?|map)$/i.test(name), 'Original report, lab media or private file in output: ' + name)
  assert(!/(?:^|\/)(?:artifacts|Module [23]|\.env[^/]*)(?:\/|$)/i.test(name), 'Private folder in output: ' + name)
  if (/\.(pdf|jpe?g)$/i.test(path)) {
    assert(reviewedCertificateFiles.has(name), 'Unreviewed document/image in output: ' + name)
  }
  if (/\.(svg|png|webp|gif|avif)$/i.test(path)) {
    assert(approvedArtwork.has(name) || reviewedCertificateFiles.has(name) || reviewedLabFiles.has(name), 'Artwork requires publication review: ' + name)
  }
  if (reviewedLabFiles.has(name)) {
    const bytes = await readFile(path)
    assert.equal(createHash('sha256').update(bytes).digest('hex'), reviewedLabFiles.get(name), 'Screenshot changed after review: ' + name)
    checkWebp(bytes, name)
  }
  if (reviewedCertificateFiles.has(name)) {
    const bytes = await readFile(path)
    const expectedHash = reviewedCertificateFiles.get(name)
    assert.match(expectedHash, /^[a-f0-9]{64}$/, 'Missing reviewed asset hash')
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expectedHash, 'Certificate copy changed after review: ' + name)
    if (name.endsWith('.pdf')) assert.equal(bytes.subarray(0, 5).toString(), '%PDF-', 'Invalid certificate PDF: ' + name)
    else assert.equal(bytes.subarray(8, 12).toString(), 'WEBP', 'Invalid certificate preview: ' + name)
  }
  if (/\.(html|js|css|json|xml|txt)$/i.test(path)) {
    const text = await readFile(path, 'utf8')
    // Only the specifically authorized CTF host's historical challenge URLs
    // may contain UUIDs. Certificate IDs and other UUIDs still fail the scan.
    const reviewed = text.replace(/https?:\/\/challenges\.tibeb\.org(?::8080)?\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, 'CTF_CHALLENGE_REFERENCE')
    for (const pattern of forbidden) assert(!pattern.test(reviewed), 'Private/excluded content in ' + relative(output, path))
  }
}
assert.deepEqual(files.map((path) => relative(output, path).replaceAll('\\', '/'))
  .filter((name) => name.startsWith('certificates/')).sort(), [...reviewedCertificateFiles.keys()].sort(), 'Reviewed certificate assets missing or unexpected files present')
assert.deepEqual(files.map((path) => relative(output, path).replaceAll('\\', '/'))
  .filter((name) => name.startsWith('labs/')).sort(), ['labs/index.html', ...labSlugs.map((slug) => 'labs/' + slug + '/index.html'), ...reviewedLabFiles.keys()].sort(), 'Unapproved or missing lab output')
assert.deepEqual(files.filter((path) => path.endsWith('.html')).map((path) => relative(output, path).replaceAll('\\', '/')).sort(), [...pages, googleVerificationFile].sort(), 'Expected exactly the 43 portfolio pages and the supplied Google verification file')

const canonicalUrls = new Set()
const pageTitles = new Set()
for (const page of pages) {
  const html = await readFile(resolve(output, page), 'utf8')
  const expectedUrl = siteOrigin + page.replace(/index\.html$/, '')
  const canonicals = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/g)]
  assert.equal(canonicals.length, 1, 'Expected one canonical URL: ' + page)
  assert.equal(canonicals[0][1], expectedUrl, 'Canonical URL must match the public page: ' + page)
  canonicalUrls.add(expectedUrl)
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]
  assert(title && !pageTitles.has(title), 'Missing or duplicate search title: ' + page)
  pageTitles.add(title)
  assert(html.match(/<meta\s+name="description"\s+content="([^"]+)"/)?.[1].trim().length > 20, 'Missing search description: ' + page)
  const robots = html.match(/<meta\s+name="robots"\s+content="([^"]+)"/)?.[1]
  assert(robots && /\bindex\b/.test(robots) && /\bfollow\b/.test(robots) && !/noindex|nofollow|none/i.test(robots), 'Page must permit search indexing: ' + page)
  assert.equal(html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/)?.[1], expectedUrl, 'Social URL must match the canonical page: ' + page)
  const structured = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]))
  assert(structured.length > 0 && structured.every((data) => data['@context'] === 'https://schema.org'), 'Missing or invalid structured data: ' + page)
  const entities = structured.flatMap((data) => data['@graph'] ?? [data])
  if (page === 'index.html') {
    const person = entities.find((entity) => entity['@type'] === 'Person')
    assert(person && person.knowsAbout.includes('Server Administration'), 'Profile skills missing from structured data')
    assert(entities.some((entity) => entity['@type'] === 'WebSite' && entity.url === expectedUrl), 'Website structured data missing')
    assert(entities.some((entity) => entity['@type'] === 'ProfilePage' && entity.mainEntity['@id'] === person['@id']), 'Profile page must identify its owner')
  } else {
    const breadcrumb = entities.find((entity) => entity['@type'] === 'BreadcrumbList')
    assert(breadcrumb && breadcrumb.itemListElement.at(-1).item === expectedUrl, 'Breadcrumb must lead to the canonical page: ' + page)
    const article = entities.find((entity) => entity['@type'] === 'Article')
    if (page.endsWith('/index.html') && !['certifications/index.html', 'writeups/index.html', 'labs/index.html'].includes(page)) {
      assert(article && article.url === expectedUrl && article.author.name === 'Habtemariam Chuchu', 'Article structured data must identify the page and author: ' + page)
    } else {
      assert(entities.some((entity) => entity['@type'] === 'CollectionPage' && entity.url === expectedUrl), 'Collection structured data missing: ' + page)
    }
  }
  assert(!html.includes('<!--prerender-->'), 'Page lacks prerendered content: ' + page)
  assert(!/__WRITEUP_|__LAB_/.test(html), 'Article metadata was not populated: ' + page)
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
    assert(!relative(output, target).startsWith('..'), 'Asset path outside output')
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
const labCollection = await readFile(resolve(output, 'labs/index.html'), 'utf8')
assert(home.includes('Currently') || home.includes('CURRENTLY ATTENDING'), 'Education status missing')
assert(home.includes('Expected graduation'), 'Expected graduation missing')
assert.equal((collection.match(/class="credential-card/g) || []).length, 21, 'Expected all 21 safe metadata records')
assert.equal((writeupCollection.match(/class="writeup-card(?:\s|")/g) || []).length, 30, 'Expected all 30 write-up cards')
assert.equal((home.match(/class="writeup-card(?:\s|")/g) || []).length, 3, 'Expected three featured write-ups')
assert.equal((labCollection.match(/class="lab-card(?:\s|")/g) || []).length, 9, 'Expected all nine lab cards')
assert.equal((home.match(/class="lab-card(?:\s|")/g) || []).length, 3, 'Expected three featured labs')
assert(home.includes('id="labs"') && home.includes(base + 'labs/'), 'Home lab navigation missing')
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
assert(projectSection.includes('View repository for Green Africa Farms on GitHub'), 'Public Green Africa Farms source link missing')
const credentialSection = home.match(/<section[^>]+id="credentials"[\s\S]*?<\/section>/)?.[0] ?? ''
const featuredCredentials = [...credentialSection.matchAll(/class="credential-card[^"]*" id="([^"]+)"/g)].map((match) => match[1])
assert.equal((credentialSection.match(/class="text-link certificate-view-link"/g) || []).length, 4, 'Featured certificate links missing')
assert.equal((collection.match(/class="text-link certificate-view-link"/g) || []).length, 21, 'Certificate viewing links missing')
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
for (const lab of labs) {
  const content = labContents.get(lab.slug)
  const article = await readFile(resolve(output, 'labs', lab.slug, 'index.html'), 'utf8')
  assert(article.includes('class="lab-steps"'), 'Walkthrough missing: ' + lab.slug)
  assert.equal((article.match(/class="lab-step"/g) || []).length, lab.stepCount, 'Rendered step count mismatch: ' + lab.slug)
  assert.deepEqual([...new Set([...article.matchAll(/data-evidence="([^"]+)"/g)].map((match) => match[1]))].sort(), [...new Set(content.steps.flatMap((step) => step.evidence ?? []))].sort(), 'Rendered evidence mismatch: ' + lab.slug)
  for (let index = 0; index < content.steps.length; index++) {
    assert(article.includes('id="step-' + String(index + 1).padStart(2, '0') + '"'), 'Missing lab step anchor: ' + lab.slug)
  }
  for (const section of ['overview', 'workflow', 'verification', 'lessons']) assert(article.includes('id="' + section + '"'), 'Missing lab section: ' + lab.slug)
}
const sitemap = await readFile(resolve(output, 'sitemap.xml'), 'utf8')
assert.equal((sitemap.match(/<loc>/g) || []).length, 43, 'Sitemap must include every static page')
assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort(), [...canonicalUrls].sort(), 'Sitemap must list exactly the canonical public URLs')
for (const slug of labSlugs) assert(sitemap.includes('/portfolio/labs/' + slug + '/</loc>'), 'Lab missing from sitemap: ' + slug)
const crawlerRules = await readFile(resolve(output, 'robots.txt'), 'utf8')
assert.match(crawlerRules, /^User-agent:\s*\*\s*$/m, 'Crawler rules must apply to search engines')
assert(!/^Disallow:\s*\/\s*$/mi.test(crawlerRules), 'Crawler rules must not block the site')
assert.match(crawlerRules, /^Allow:\s*\/portfolio\/\s*$/m, 'Portfolio crawling must be allowed')
assert(crawlerRules.includes('Sitemap: ' + siteOrigin + 'sitemap.xml'), 'Crawler rules must advertise the public sitemap')

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
process.stdout.write('Verified 43 real static pages, the Google verification file, canonical URLs, search metadata, structured data, crawler access, the complete sitemap, 11 projects, 6 live-site links, 4 featured credentials, 30 supplied write-ups, nine lab walkthroughs, 97 steps, 69 reviewed screenshots, 21 viewable certificates, removed course/networking content, navigation and public-data boundaries.\n')

