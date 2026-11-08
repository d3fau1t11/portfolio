import { createHash } from 'node:crypto'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { certificateAssets } from '../../src/data/certificate-assets'
import { credentials } from '../../src/data/credentials'

test('every certificate link serves the reviewed PDF and image under the Pages path', async ({ page, request }) => {
  await page.goto('certifications/')
  await expect(page.locator('.certificate-view-link')).toHaveCount(21)
  await expect(page.locator('.certificate-preview-pages img')).toHaveCount(0)
  for (const credential of credentials) {
    await expect(page.locator(`#${credential.slug} .certificate-view-link`)).toHaveAttribute('href', '/portfolio/' + certificateAssets[credential.slug].file)
  }
  await Promise.all(Object.values(certificateAssets).map(async (asset) => {
    const pdf = await request.get('/portfolio/' + asset.file)
    expect(pdf.status()).toBe(200)
    expect(pdf.headers()['content-type']).toContain('application/pdf')
    const document = await pdf.body()
    expect(document.subarray(0, 5).toString()).toBe('%PDF-')
    expect(createHash('sha256').update(document).digest('hex')).toBe(asset.sha256)
    for (const preview of asset.pages) {
      const image = await request.get('/portfolio/' + preview.file)
      expect(image.status()).toBe(200)
      expect(image.headers()['content-type']).toContain('image/webp')
      expect(createHash('sha256').update(await image.body()).digest('hex')).toBe(preview.sha256)
    }
  }))
})

for (const width of [390, 1440]) {
  test('the certificate viewer supports reading, download, keyboard dismissal and accessibility at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./')
    const link = page.getByRole('link', { name: 'View certificate for 4th Cyber Talent Summer Camp Program', exact: true })
    await link.focus()
    await link.press('Enter')
    const viewer = page.getByRole('dialog', { name: '4th Cyber Talent Summer Camp Program', exact: true })
    await expect(viewer).toBeVisible()
    const image = viewer.getByRole('img', { name: '4th Cyber Talent Summer Camp Program certificate', exact: true })
    await expect(image).toBeVisible()
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    expect(await image.evaluate((element) => {
      const imageBounds = element.getBoundingClientRect()
      const regionBounds = element.parentElement!.getBoundingClientRect()
      return imageBounds.top >= regionBounds.top && imageBounds.bottom <= regionBounds.bottom
    })).toBe(true)
    const close = viewer.getByRole('button', { name: 'Close certificate preview', exact: true })
    await expect(close).toBeFocused()
    await close.press('Shift+Tab')
    await expect(viewer.getByRole('region', { name: 'Certificate image', exact: true })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(close).toBeFocused()
    await viewer.getByRole('button', { name: 'Zoom in', exact: true }).click()
    expect(await viewer.locator('.certificate-preview-pages').evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
    await viewer.getByRole('button', { name: 'Fit to screen', exact: true }).click()
    await expect(viewer.getByRole('link', { name: 'Open PDF', exact: true })).toHaveAttribute('href', '/portfolio/certificates/insa-summer-camp.pdf')
    await expect(viewer.getByRole('link', { name: 'Open PDF', exact: true })).toHaveAttribute('target', '_blank')
    const downloadPending = page.waitForEvent('download')
    await viewer.getByRole('link', { name: 'Download PDF', exact: true }).click()
    const download = await downloadPending
    expect(download.suggestedFilename()).toBe('insa-summer-camp.pdf')
    expect(await download.failure()).toBeNull()
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(accessibility.violations).toEqual([])
    await page.keyboard.press('Escape')
    await expect(viewer).not.toBeVisible()
    await expect(link).toBeFocused()
    await expect(page.locator('.certificate-preview-pages img')).toHaveCount(0)
  })
}

test('certificate documents remain available when JavaScript is disabled', async ({ browser, request }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('http://127.0.0.1:4173/portfolio/certifications/')
    await expect(page.locator('.certificate-view-link')).toHaveCount(21)
    const link = page.locator('#opswat-icip .certificate-view-link')
    await expect(link).toHaveAttribute('href', '/portfolio/certificates/opswat-icip.pdf')
    await expect(link).toHaveAttribute('target', '_blank')
    const response = await request.get((await link.getAttribute('href'))!)
    expect(response.status()).toBe(200)
    expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-')
  } finally {
    await context.close()
  }
})

test('a failed image leaves the PDF available and the viewer dismissible', async ({ page, request }) => {
  await page.route('**/certificates/insa-summer-camp.webp', (route) => route.abort())
  await page.goto('./')
  await page.getByRole('link', { name: 'View certificate for 4th Cyber Talent Summer Camp Program', exact: true }).click()
  const viewer = page.getByRole('dialog', { name: '4th Cyber Talent Summer Camp Program', exact: true })
  await expect(viewer.getByRole('status')).toContainText('Use Open PDF')
  expect((await request.get('/portfolio/certificates/insa-summer-camp.pdf')).status()).toBe(200)
  await viewer.getByRole('button', { name: 'Close certificate preview', exact: true }).click()
  await expect(viewer).not.toBeVisible()
})
