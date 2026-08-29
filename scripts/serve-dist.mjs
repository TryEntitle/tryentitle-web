import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

/**
 * Static server for the built site.
 *
 * `vite preview` uses SPA fallback — it would serve index.html for every path,
 * so tests would never touch the prerendered per-route HTML and would hit
 * hydration mismatches. This server instead mimics a real static host
 * (Vercel/Netlify/CDN): clean URLs map to their `.html` file, an unknown path
 * serves 404.html with a genuine 404 status (PRD FR4), and text responses go out
 * compressed.
 *
 * Compression is here for Lighthouse, which also runs against this server. Every
 * host that will ever serve this site compresses text — Vercel brotlis it — so
 * shipping the `three` chunk over the wire at its full 708 kB measures a
 * transfer nobody makes and reads back as a page-weight problem the deploy does
 * not have.
 */

const DIST = fileURLToPath(new URL('../dist/', import.meta.url))
const PORT = Number(process.env.PORT ?? 4173)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

async function readIfFile(path) {
  try {
    const s = await stat(path)
    if (!s.isFile()) return null
    return await readFile(path)
  } catch {
    return null
  }
}

/** Resolve a request path to a file, following static-host clean-URL rules. */
async function resolve(pathname) {
  const safe = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '')
  const base = join(DIST, safe)

  if (safe === '/' || safe === '\\') {
    return { body: await readIfFile(join(DIST, 'index.html')), ext: '.html' }
  }
  // Exact file (assets, og images, sitemap.xml, robots.txt)
  const exact = await readIfFile(base)
  if (exact) return { body: exact, ext: extname(base) }

  // Clean URL: /services -> services.html
  const asHtml = await readIfFile(`${base}.html`)
  if (asHtml) return { body: asHtml, ext: '.html' }

  // Directory index: /services/ -> services/index.html
  const asIndex = await readIfFile(join(base, 'index.html'))
  if (asIndex) return { body: asIndex, ext: '.html' }

  return null
}

/** Types worth compressing. Fonts and images are already compressed formats. */
const COMPRESSIBLE = new Set(['.html', '.js', '.mjs', '.css', '.json', '.svg', '.xml', '.txt'])

/** Send a body, gzipped when the type benefits and the client asked for it. */
function send(req, res, status, body, ext) {
  const headers = { 'Content-Type': TYPES[ext] ?? 'application/octet-stream' }
  const wants = (req.headers['accept-encoding'] ?? '').includes('gzip')

  if (wants && COMPRESSIBLE.has(ext)) {
    const gz = gzipSync(body)
    res.writeHead(status, { ...headers, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' })
    res.end(gz)
    return
  }

  res.writeHead(status, headers)
  res.end(body)
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  const found = await resolve(url.pathname)

  if (found?.body) {
    send(req, res, 200, found.body, found.ext)
    return
  }

  const notFound = await readIfFile(join(DIST, '404.html'))
  send(req, res, 404, notFound ?? Buffer.from('Not found'), '.html')
}).listen(PORT, () => {
  console.log(`serving dist on http://localhost:${PORT}`)
})
