import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { labs } from '../../src/data/labs'
import { labAssets } from '../../src/data/lab-assets'

test('labs are linked from the home page and main navigation', async ({ page }) => {
  await page.goto('./')
  const section = page.locator('#labs')
  await expect(section.locator('.lab-card')).toHaveCount(3)
  await expect(section.getByRole('link', { name: /Explore all 9 labs/ })).toHaveAttribute('href', '/portfolio/labs/')
  await expect(page.locator('body')).not.toContainText(/\bIBT\b|\bmodules?\s+[23]\b/i)
  await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Labs', exact: true }).click()
  await expect(page).toHaveURL(/\/portfolio\/labs\/$/)
  await expect(page.locator('.lab-card')).toHaveCount(9)
  await expect(page.locator('.lab-tracks, .lab-module-filters')).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Labs', exact: true })).toHaveAttribute('aria-current', 'page')
})

test('topic search announces results and resets focus', async ({ page }) => {
  await page.goto('labs/')
  const search = page.getByRole('searchbox', { name: 'Search labs' })
  const status = page.getByRole('status')
  await expect(status).toHaveText('Showing 9 of 9 labs')
  await search.fill(' vpn ')
  await expect(page.locator('.lab-card h3')).toHaveText(['RRAS VPN, NAT & connection accounting'])
  await expect(status).toHaveText('Showing 1 of 9 labs')
  await search.fill('does-not-exist')
  await expect(page.getByRole('heading', { name: 'No matching labs' })).toBeVisible()
  await page.locator('.credential-empty').getByRole('button', { name: 'Reset search' }).click()
  await expect(search).toBeFocused()
  await expect(search).toHaveValue('')
  await expect(page.locator('.lab-card')).toHaveCount(9)
  await search.fill('ESXi')
  await expect(page.locator('.lab-card h3')).toHaveText(['Nested ESXi & virtual infrastructure troubleshooting'])
  await page.getByRole('button', { name: 'Clear lab search' }).click()
  await expect(search).toBeFocused()
  await expect(page.locator('.lab-card')).toHaveCount(9)
})

test('all nine direct lab URLs load complete steps and evidence without hydration errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  for (const lab of labs) {
    const response = await page.goto('labs/' + lab.slug + '/')
    expect(response?.status(), lab.slug).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(lab.title)
    await expect(page.locator('body')).not.toContainText(/\bIBT\b|\bmodules?\s+[23]\b/i)
    expect(await page.title()).not.toMatch(/\bIBT\b|\bmodules?\s+[23]\b/i)
    await expect(page.locator('.lab-step')).toHaveCount(lab.stepCount)
    await expect(page.locator('.lab-evidence')).toHaveCount(lab.evidenceCount)
    await expect(page.locator('#step-' + String(lab.stepCount).padStart(2, '0'))).toBeAttached()
  }
  for (const asset of Object.values(labAssets)) {
    const response = await page.request.get('/portfolio/' + asset.file)
    expect(response.status(), asset.file).toBe(200)
    expect(response.headers()['content-type']).toContain('image/webp')
  }
  expect(errors).toEqual([])
})

test('step navigation, refresh and full-size screenshots work', async ({ page }) => {
  await page.goto('labs/windows-dhcp-wds/')
  const sidebar = page.locator('.article-sidebar')
  await sidebar.getByText('Browse the 12 steps', { exact: true }).click()
  await sidebar.getByRole('link', { name: '12 · Verify the deployed desktop', exact: true }).click()
  await expect(page).toHaveURL(/#step-12$/)
  await page.reload()
  await expect(page.locator('#step-12')).toBeVisible()
  const figure = page.locator('[data-evidence="wds-desktop"]')
  await figure.scrollIntoViewIfNeeded()
  await expect(figure.getByRole('img')).toBeVisible()
  await expect.poll(() => figure.getByRole('img').evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  const popupReady = page.waitForEvent('popup')
  await figure.getByRole('link', { name: /^View full-size:/ }).click()
  const popup = await popupReady
  await popup.waitForLoadState()
  await expect(popup).toHaveURL(/\/portfolio\/labs\/screenshots\/wds-desktop\.webp$/)
  await popup.close()
})

test('lab collections and illustrated walkthroughs remain usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:4173/portfolio/labs/')
  await expect(page.locator('.lab-card')).toHaveCount(9)
  await expect(page.locator('.no-js-note')).toBeVisible()
  await expect(page.locator('.lab-search-form')).toBeHidden()
  await expect(page.locator('.lab-module-filters')).toHaveCount(0)
  await page.goto('http://127.0.0.1:4173/portfolio/labs/windows-storage-raid/')
  await expect(page.locator('.lab-step')).toHaveCount(8)
  await expect(page.locator('.lab-evidence')).toHaveCount(5)
  await page.locator('.mobile-contents summary').click()
  await page.getByRole('navigation', { name: 'Mobile table of contents' }).getByRole('link', { name: 'How I checked the result', exact: true }).click()
  await expect(page).toHaveURL(/#verification$/)
  await context.close()
})

test('lab pages fit desktop, tablet and small phones and pass accessibility checks', async ({ page }) => {
  for (const path of ['labs/', 'labs/windows-dhcp-wds/', 'labs/nested-esxi-virtualization/']) {
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(path)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(overflow, path + ' at ' + width).toBeLessThanOrEqual(1)
    }
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(results.violations, path).toEqual([])
  }
})
