import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const projectNames = [
  'Attendance App', 'WatchVault', 'GPA Calculator', 'Green Africa Farms', 'TrueImpact',
  'Remote Admin Tool', 'BookReview', 'Python Reverse TCP', 'Forge', 'Social Media Link Hub', 'Hary Pictures',
]

test('home presents the requested profile, projects and working contact targets', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Habtemariam')
  await expect(page.locator('.hero-role')).toHaveText('Software Developer | Cybersecurity Practitioner | Server Administration')
  await expect(page.locator('#about')).toContainText('Expected graduation · 2027')
  await expect(page.locator('#about')).toContainText('IN PROGRESS')
  await expect(page.locator('#projects h3')).toHaveText(projectNames)
  await expect(page.locator('#projects .project-source')).toHaveCount(11)

  const repositories = [
    'https://github.com/d3fau1t11/attendance-app',
    'https://github.com/d3fau1t11/watchvault',
    'https://github.com/d3fau1t11/Gpa-Calculator',
    'https://github.com/d3fau1t11/Green-Africa-Farms',
    'https://github.com/d3fau1t11/TrueImpact',
    'https://github.com/d3fau1t11/Remote-Admin-Tool',
    'https://github.com/d3fau1t11/IP-final-project-',
    'https://github.com/d3fau1t11/Python-Reverse-TCP',
    'https://github.com/d3fau1t11/Forge',
    'https://github.com/d3fau1t11/-Social-Media-Link-Hub',
    'https://github.com/d3fau1t11/Hary-Pictures',
  ]
  for (const [index, href] of repositories.entries()) {
    const link = page.locator('#projects .project-source').nth(index)
    await expect(link).toHaveAttribute('href', href)
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link.locator('svg.github-mark')).toHaveAttribute('viewBox', '0 0 16 16')
  }
  const demos = [
    'https://watchvaults.netlify.app/',
    'https://green-farms.netlify.app/',
    'https://trueimpact1.netlify.app/',
    'https://ip-final-project.vercel.app/',
    'https://mezmuredawit.netlify.app/',
    'https://harypictures.netlify.app/',
  ]
  await expect(page.locator('#projects .project-demo')).toHaveCount(6)
  for (const [index, href] of demos.entries()) {
    const link = page.locator('#projects .project-demo').nth(index)
    await expect(link).toHaveAttribute('href', href)
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(link).toHaveAttribute('target', '_blank')
  }
  await expect(page.getByRole('link', { name: 'View repository for Green Africa Farms on GitHub', exact: true })).toContainText('View repository')
  await expect(page.locator('#credentials-title')).toHaveText('Learning, with something to show.')
  await expect(page.locator('#credentials .credential-card')).toHaveCount(4)
  await expect(page.locator('#credentials .credential-card').first()).toHaveAttribute('id', 'insa-summer-camp')
  const summerCamp = page.locator('#credentials #insa-summer-camp')
  await expect(summerCamp.getByRole('heading', { level: 3 })).toHaveText('4th Cyber Talent Summer Camp Program')
  await expect(summerCamp.locator('.award-label')).toHaveText('Program participation')
  await expect(summerCamp.locator('.credential-dates')).toContainText('October 2025 (G.C.)')
  await expect(page.locator('#contact .contact-email')).toHaveAttribute('href', 'mailto:habtechoon@gmail.com')
  await expect(page.locator('#contact .contact-github')).toHaveAttribute('href', 'https://github.com/d3fau1t11')
  await expect(page.locator('.national-ctf')).toContainText('Solo competitor')
  await expect(page.locator('.htb-ctf')).toContainText('668 of 6,744 teams')
})

test('both static pages load assets cleanly and navigate under the Pages subpath', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('response', (response) => {
    if (response.url().startsWith('http://127.0.0.1:4173/') && response.status() >= 400) {
      errors.push(response.status() + ' ' + response.url())
    }
  })
  await page.goto('./')
  await page.getByRole('navigation', { name: 'Main navigation', exact: true })
    .getByRole('link', { name: 'Credentials', exact: true }).click()
  await expect(page).toHaveURL(/\/portfolio\/certifications\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Credentials')
  await expect(page.locator('.credential-card')).toHaveCount(21)
  await page.getByRole('link', { name: 'Back to portfolio', exact: true }).click()
  await page.getByRole('link', { name: 'View projects', exact: true }).click()
  await expect(page).toHaveURL(/\/portfolio\/#projects$/)
  await expect(page.locator('#projects-title')).toBeInViewport()
  expect(errors).toEqual([])
})

test('credential search, category and featured filters intersect and reset with focus', async ({ page }) => {
  await page.goto('certifications/')
  const search = page.getByRole('searchbox', { name: 'Search credentials' })
  const categories = page.getByRole('group', { name: 'Filter by category' })
  const results = page.getByRole('status')
  await expect(results).toHaveText('Showing 21 of 21 credentials')
  await search.fill('  FORTINET operator ')
  await categories.getByRole('button', { name: 'Network & infrastructure', exact: true }).click()
  await page.getByRole('checkbox', { name: 'Featured only' }).check()
  await expect(results).toHaveText('Showing 1 of 21 credentials')
  await expect(page.locator('.credential-card h3')).toHaveText(['FortiGate 7.6 Operator Self-Paced'])

  await categories.getByRole('button', { name: 'Software & data', exact: true }).click()
  await expect(results).toHaveText('Showing 0 of 21 credentials')
  await expect(page.getByRole('heading', { name: 'No matching credentials' })).toBeVisible()
  await page.locator('.credential-empty').getByRole('button', { name: 'Reset filters' }).click()
  await expect(search).toBeFocused()
  await expect(search).toHaveValue('')
  await expect(page.getByRole('checkbox', { name: 'Featured only' })).not.toBeChecked()
  await expect(categories.getByRole('button', { name: 'All credentials' })).toHaveAttribute('aria-pressed', 'true')
  await expect(results).toHaveText('Showing 21 of 21 credentials')

  await search.fill('internet governance')
  await expect(page.locator('.credential-card h3')).toHaveText(['103 ICANN Public Meetings for Newcomers'])
  await page.getByRole('button', { name: 'Clear search', exact: true }).click()
  await expect(search).toBeFocused()
  await expect(page.locator('.credential-card')).toHaveCount(21)
})

test('a credential deep link opens its details and remains keyboard operable', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('link', { name: 'Participation details', exact: true }).click()
  await expect(page).toHaveURL(/\/portfolio\/certifications\/#htb-cyber-apocalypse$/)
  const card = page.locator('#htb-cyber-apocalypse')
  await expect(card.locator('details')).toHaveAttribute('open', '')
  await expect(card).toContainText('These are team results.')
  const summary = card.locator('summary')
  await summary.focus()
  await summary.press('Enter')
  await expect(card.locator('details')).not.toHaveAttribute('open')
  await summary.press('Space')
  await expect(card.locator('details')).toHaveAttribute('open', '')
  await expect(summary).toBeFocused()
})

test('keyboard users can skip navigation and dismiss the mobile menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()

  const menu = page.locator('.mobile-menu')
  const summary = menu.locator('summary')
  await summary.focus()
  await summary.press('Enter')
  await expect(menu).toHaveAttribute('open', '')
  await page.keyboard.press('Tab')
  await expect(menu.getByRole('link', { name: 'About', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(menu).not.toHaveAttribute('open')
  await expect(summary).toBeFocused()

  await summary.press('Enter')
  await menu.getByRole('link', { name: 'Projects', exact: true }).click()
  await expect(page).toHaveURL(/#projects$/)
  await expect(menu).not.toHaveAttribute('open')
  await summary.click()
  await expect(menu).toHaveAttribute('open', '')
  await page.locator('#hero-title').click({ position: { x: 5, y: 5 } })
  await expect(menu).not.toHaveAttribute('open')
})

test('reduced motion disables smooth scrolling and decorative transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
  expect(await page.locator('html').evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe('auto')
  expect(await page.getByRole('link', { name: 'View projects', exact: true }).evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s')
  await page.locator('.mobile-menu summary').click()
  expect(await page.locator('.mobile-nav').evaluate((element) => getComputedStyle(element).animationName)).toBe('none')
})

test('prerendered content and native disclosures work with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  try {
    await page.goto('http://127.0.0.1:4173/portfolio/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Habtemariam')
    await expect(page.locator('#projects h3')).toHaveText(projectNames)
    await expect(page.locator('#projects .project-demo')).toHaveCount(6)
    await expect(page.locator('#credentials .credential-card').first()).toHaveAttribute('id', 'insa-summer-camp')
    await page.locator('.mobile-menu summary').click()
    await page.getByRole('navigation', { name: 'Mobile navigation', exact: true })
      .getByRole('link', { name: 'Credentials', exact: true }).click()
    await expect(page.locator('.credential-card')).toHaveCount(21)
    const card = page.locator('#iso-iec-27001-lead-auditor')
    await card.locator('summary').click()
    await expect(card.getByText(/16 credit hours/)).toBeVisible()
    await expect(page.locator('.contact-email')).toHaveAttribute('href', 'mailto:habtechoon@gmail.com')
    await expect(page.getByRole('searchbox')).toBeHidden()
  } finally {
    await context.close()
  }
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test('both pages fit a ' + width + 'px viewport without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const path of ['./', 'certifications/']) {
      await page.goto(path)
      await page.evaluate(() => document.fonts.ready)
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    }
  })
}

for (const width of [390, 1440]) {
  for (const path of ['./', 'certifications/']) {
    test(path + ' meets automated WCAG checks at ' + width + 'px', async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(path)
      await page.evaluate(() => document.fonts.ready)
      if (path === 'certifications/') await page.locator('.credential-card summary').first().click()
      if (width === 390) await page.locator('.mobile-menu summary').click()
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
      expect(result.violations).toEqual([])
    })
  }
}
