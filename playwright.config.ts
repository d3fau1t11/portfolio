import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

const localChrome = process.platform === 'win32' && existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe')

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173/portfolio/',
    channel: localChrome ? 'chrome' : undefined,
    headless: true,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/portfolio/',
    reuseExistingServer: !process.env.CI,
  },
})

