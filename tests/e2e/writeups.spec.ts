import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { writeups } from '../../src/data/writeups'

test('the profile picture is removed and official GitHub marks remain in the home page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await expect(page.getByRole('img', { name: 'Habtemariam Chuchu', exact: true })).toHaveCount(0)
  await expect(page.locator('.hero img, .hero-portrait')).toHaveCount(0)
  for (const selector of ['.hero-github', '.contact-github', '.footer-links a[href="https://github.com/d3fau1t11"]']) {
    await expect(page.locator(selector + ' svg.github-mark')).toHaveAttribute('viewBox', '0 0 16 16')
    await expect(page.locator(selector + ' svg.lucide-code-xml')).toHaveCount(0)
  }
})

test('write-up discovery combines search and category and resets with focus', async ({ page }) => {
  await page.goto('writeups/')
  const search = page.getByRole('searchbox', { name: 'Search write-ups' })
  const categories = page.getByRole('group', { name: 'Filter write-ups by category' })
  const results = page.getByRole('status')
  await expect(page.locator('.writeup-card')).toHaveCount(30)
  await expect(results).toHaveText('Showing 30 of 30 write-ups')
  await categories.getByRole('button', { name: 'Cryptography', exact: true }).click()
  await expect(results).toHaveText('Showing 5 of 30 write-ups')
  await search.fill('  nonce DSA ')
  await expect(page.locator('.writeup-card h3')).toHaveText(['Nonce Echo'])
  await categories.getByRole('button', { name: 'Forensics', exact: true }).click()
  await expect(results).toHaveText('Showing 0 of 30 write-ups')
  await expect(page.getByRole('heading', { name: 'No matching write-ups' })).toBeVisible()
  await page.locator('.credential-empty').getByRole('button', { name: 'Reset filters' }).click()
  await expect(search).toBeFocused()
  await expect(search).toHaveValue('')
  await expect(page.locator('.writeup-card')).toHaveCount(30)
  await search.fill('dijkstra')
  await expect(page.locator('.writeup-card h3')).toHaveText(['Caravan Routes'])
  await page.getByRole('button', { name: 'Clear search', exact: true }).click()
  await expect(search).toBeFocused()
  await expect(page.locator('.writeup-card')).toHaveCount(30)
})

test('featured articles, contents anchors and article refresh work under the Pages base', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto('./')
  await expect(page.locator('#writeups .writeup-card')).toHaveCount(3)
  await page.locator('#writeups').getByRole('link', { name: 'The Template Loom', exact: true }).click()
  await expect(page).toHaveURL(/\/portfolio\/writeups\/the-template-loom\/$/)
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The Template Loom.')
  await page.getByRole('navigation', { name: 'Table of contents', exact: true }).getByRole('link', { name: '5. Exploitation — Reading the Flag', exact: true }).click()
  await expect(page.locator('#section-5-exploitation-reading-the-flag')).toBeInViewport()
  await page.reload()
  await expect(page.locator('.article-prose')).toContainText('tibeb{loom_ce82addc3d9a84b6a9dd}')
  await page.getByRole('link', { name: 'Back to all write-ups', exact: true }).click()
  await expect(page).toHaveURL(/\/portfolio\/writeups\/$/)
  expect(errors).toEqual([])
})

test('the homepage defers the renderer and only the selected article text loads in a reader', async ({ page }) => {
  const loaded: string[] = []
  page.on('response', (response) => { if (response.url().endsWith('.js')) loaded.push(response.url()) })
  const isArticleChunk = (url: string) => writeups.some((item) => url.includes('/assets/' + item.slug + '-'))
  await page.goto('./')
  await page.waitForLoadState('networkidle')
  expect(loaded.filter(isArticleChunk)).toEqual([])
  expect(loaded.filter((url) => url.includes('/assets/ArticleContent-'))).toEqual([])
  await page.goto('writeups/old-paper/')
  await page.waitForLoadState('networkidle')
  expect(loaded.filter(isArticleChunk)).toHaveLength(1)
  expect(loaded.filter(isArticleChunk)[0]).toContain('/assets/old-paper-')
  await expect(page.locator('.article-prose')).toContainText('tibeb{old_paper_632aa86068f902e8aaac}')
})

test('all 30 article URLs return their own complete HTML with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  try {
    for (const item of writeups) {
      const response = await page.goto('http://127.0.0.1:4173/portfolio/writeups/' + item.slug + '/')
      expect(response?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(item.title + '.')
      await expect(page.locator('.article-prose')).toContainText('tibeb{')
    }
    await page.goto('http://127.0.0.1:4173/portfolio/writeups/')
    await expect(page.locator('.writeup-card')).toHaveCount(30)
    await expect(page.getByRole('searchbox')).toBeHidden()
    await page.getByRole('link', { name: 'Campus Footprints', exact: true }).click()
    const contents = page.locator('.mobile-contents')
    await contents.locator('summary').focus()
    await contents.locator('summary').press('Enter')
    await expect(contents).toHaveAttribute('open', '')
    await contents.getByRole('link', { name: 'Step 3 — Find the latest revision for each target', exact: true }).click()
    await expect(page.locator('#section-step-3-find-the-latest-revision-for-each-target')).toBeInViewport()
  } finally { await context.close() }
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test('collection, code and tables fit a ' + width + 'px viewport', async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const path of ['writeups/', 'writeups/two-seals/', 'writeups/campus-footprints/', 'writeups/sixteen-brass-dials/']) {
      await page.goto(path)
      await page.evaluate(() => document.fonts.ready)
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    }
  })
}

for (const width of [390, 1440]) {
  for (const path of ['writeups/', 'writeups/campus-footprints/', 'writeups/two-seals/']) {
    test(path + ' meets automated WCAG checks at ' + width + 'px', async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(path)
      await page.evaluate(() => document.fonts.ready)
      if (width === 390) {
        await page.locator('.mobile-menu summary').click()
        if (path !== 'writeups/') await page.locator('.mobile-contents summary').click()
      }
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
      expect(result.violations).toEqual([])
    })
  }
}
