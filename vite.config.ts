import { fileURLToPath, URL } from 'node:url'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { mdContent } from './vite/md-content'
import { proofGuard } from './vite/proof'
import { detailPaths, indexableRoutes } from './vite/routes'
import { generateOgImages } from './vite/og'
import { SITE_URL } from './src/lib/constants'
// Type-only import: pulls in vite-ssg's `declare module 'vite'` augmentation
// so `ssgOptions` is a known, typed key on the Vite config below.
import type { ViteSSGOptions } from 'vite-ssg'

/** Absolute URL for a route path, always without a trailing slash (except root). */
function absUrl(route: string): string {
  return new URL(route, SITE_URL).toString().replace(/\/$/, route === '/' ? '/' : '')
}

/** Generate sitemap.xml + robots.txt into dist after prerender (PRD FR6). */
function writeSeoFiles(outDir: string): void {
  const routes = indexableRoutes()
  const urls = routes
    .map((r) => `  <url><loc>${absUrl(r)}</loc></url>`)
    .join('\n')
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap)

  const robots = [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${new URL('/sitemap.xml', SITE_URL).toString()}`,
    '',
  ].join('\n')
  writeFileSync(path.join(outDir, 'robots.txt'), robots)
}

const ssgOptions: ViteSSGOptions = {
  formatting: 'minify',
  // Explicitly enumerate the paths to statically render. Static routes are
  // discovered from the router; dynamic detail routes (services, industries,
  // blog) are appended from the content layer. `/404` renders the catch-all.
  async includedRoutes(paths) {
    const staticPaths = paths.filter((p) => !p.includes(':') && !p.includes('*'))
    return Array.from(new Set([...staticPaths, ...detailPaths(), '/', '/404']))
  },
  async onFinished() {
    const outDir = fileURLToPath(new URL('./dist', import.meta.url))
    writeSeoFiles(outDir)
    await generateOgImages(outDir)
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mdContent(),
    proofGuard(),
    vue(),
    vueDevTools(),
    // Must be last so it sees the final bundle. Uploads source maps to
    // Sentry for readable stack traces; no-ops (with a warning) when
    // SENTRY_AUTH_TOKEN is unset, so CI/local builds without it still pass.
    sentryVitePlugin({
      org: 'tryentitle-wu',
      project: 'tryentitle-web',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        filesToDeleteAfterUpload: ['dist/**/*.map'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Hidden source maps: generated for Sentry's upload, not referenced by a
    // sourceMappingURL comment, so they're never served to end users.
    sourcemap: 'hidden',
  },
  ssgOptions,
})
