import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { getWriteup } from './src/lib/writeups.ts'
import { applyWriteupTemplate } from './src/lib/writeup-template.ts'

function writeupDevPages(): Plugin {
  return {
    name: 'writeup-dev-pages',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://localhost')
        const match = url.pathname.match(/^\/portfolio\/writeups\/([a-z0-9-]+)(?:\/(?:index\.html)?)?$/)
        if (!match) return next()
        const writeup = getWriteup(match[1])
        if (!writeup) {
          response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
          response.end('Write-up not found')
          return
        }
        if (!url.pathname.endsWith('/') && !url.pathname.endsWith('/index.html')) {
          response.writeHead(308, { Location: url.pathname + '/' + url.search })
          response.end()
          return
        }
        try {
          const template = await readFile(fileURLToPath(new URL('./writeups/article.html', import.meta.url)), 'utf8')
          const html = await server.transformIndexHtml(url.pathname, applyWriteupTemplate(template, writeup))
          response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
          response.end(html)
        } catch (error) { next(error) }
      })
    },
  }
}

export default defineConfig({
  base: '/portfolio/',
  plugins: [writeupDevPages(), react(), tailwindcss()],
  build: {
    manifest: true,
    target: ['chrome111', 'edge111', 'firefox128', 'safari16.4'],
    sourcemap: false,
    rolldownOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        certifications: fileURLToPath(new URL('./certifications/index.html', import.meta.url)),
        writeups: fileURLToPath(new URL('./writeups/index.html', import.meta.url)),
        article: fileURLToPath(new URL('./writeups/article.html', import.meta.url)),
      },
    },
  },
})

