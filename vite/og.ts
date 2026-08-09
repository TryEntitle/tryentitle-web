import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { SITE_NAME, SITE_TAGLINE } from '../src/lib/constants'

/**
 * Open Graph card generation (PRD FR5 / §11.7).
 *
 * Renders "a static branded card per section type" at build time, in the site's
 * own typography (Bricolage Grotesque + IBM Plex Mono) and palette. Never an
 * AI-generated image, never stock art — type, rules, and the seal mark only.
 *
 * Palette values are parsed from styles/tokens.css so this generator cannot
 * drift from the design tokens (PRD §11.4 single source of truth).
 *
 * NOTE: because the palette is looked up by token NAME, renaming a token in
 * tokens.css silently yields `undefined` here and satori fails with an opaque
 * "Cannot read properties of undefined" error. `colour()` below turns that into
 * a named, actionable failure instead.
 */

const root = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url))

/**
 * Parse `--name: #hex;` declarations out of tokens.css.
 *
 * Matches ANY token whose value is a literal hex — the palette is no longer
 * namespaced under `--color-*`, so anchoring on that prefix would silently return
 * an empty palette and every colour would come back undefined.
 */
function loadPalette(): Record<string, string> {
  const css = readFileSync(root('src/styles/tokens.css'), 'utf-8')
  const palette: Record<string, string> = {}
  for (const [, name, hex] of css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,8});/g)) {
    palette[name!] = hex!
  }
  return palette
}

function font(pkg: string, file: string): Buffer {
  return readFileSync(root(`node_modules/${pkg}/files/${file}`))
}

interface CardSpec {
  /** Output filename without extension, e.g. "services". */
  name: string
  /** Mono eyebrow, uppercased in the card. */
  eyebrow: string
  /** The headline. */
  title: string
}

const CARDS: CardSpec[] = [
  { name: 'default', eyebrow: SITE_NAME, title: SITE_TAGLINE },
  { name: 'home', eyebrow: '', title: SITE_TAGLINE },
  { name: 'services', eyebrow: 'Services', title: 'Six ways we take work off your team.' },
  {
    name: 'industries',
    eyebrow: 'Industries',
    title: 'Built around the documents your field runs on.',
  },
  { name: 'blog', eyebrow: 'Blog', title: 'Notes on how work actually moves.' },
  { name: 'legal', eyebrow: 'Legal', title: `${SITE_NAME} legal documents` },
]

/** Build the satori element tree for one card. */
function cardElement(spec: CardSpec, c: Record<string, string>): Record<string, unknown> {
  const div = (style: Record<string, unknown>, children: unknown) => ({
    type: 'div',
    props: { style: { display: 'flex', ...style }, children },
  })

  /** Look up a token, failing loudly if it has been renamed or removed. */
  const colour = (token: string): string => {
    const value = c[token]
    if (!value) {
      throw new Error(
        `OG card: token --${token} is missing from src/styles/tokens.css. ` +
          `Update vite/og.ts to match the current palette.`,
      )
    }
    return value
  }

  return div(
    {
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: colour('bond'),
      padding: '72px',
      fontFamily: 'IBM Plex Mono',
    },
    [
      // Eyebrow — mono, uppercase, wide tracking
      div(
        {
          fontSize: 24,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: colour('graphite'),
        },
        spec.eyebrow.toUpperCase(),
      ),

      // Headline — Bricolage Grotesque at display leading
      div(
        {
          fontFamily: 'Bricolage Grotesque',
          fontSize: 68,
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: colour('ink'),
          maxWidth: '900px',
        },
        spec.title,
      ),

      // Footer rule: wordmark + the seal mark
      div(
        {
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid ${colour('graphite')}`,
          paddingTop: '28px',
        },
        [
          div({ alignItems: 'center', gap: '10px' }, [
            div(
              {
                fontFamily: 'Bricolage Grotesque',
                fontSize: 32,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: colour('ink'),
              },
              SITE_NAME,
            ),
            div(
              {
                width: '12px',
                height: '12px',
                borderRadius: '6px',
                backgroundColor: colour('seal'),
              },
              '',
            ),
          ]),
          div(
            { fontSize: 22, letterSpacing: '0.12em', color: colour('graphite') },
            'TRYENTITLE.COM',
          ),
        ],
      ),
    ],
  )
}

export async function generateOgImages(outDir: string): Promise<void> {
  const palette = loadPalette()
  const dir = path.join(outDir, 'og')
  mkdirSync(dir, { recursive: true })

  const fonts = [
    {
      name: 'Bricolage Grotesque',
      // NOTE: the .woff from the STATIC package, not the variable .woff2 —
      // satori parses woff but not woff2, and fails opaquely on the latter.
      data: font('@fontsource/bricolage-grotesque', 'bricolage-grotesque-latin-600-normal.woff'),
      weight: 600 as const,
      style: 'normal' as const,
    },
    {
      name: 'IBM Plex Mono',
      data: font('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff'),
      weight: 500 as const,
      style: 'normal' as const,
    },
  ]

  for (const spec of CARDS) {
    const svg = await satori(cardElement(spec, palette) as never, {
      width: 1200,
      height: 630,
      fonts,
    })
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng()
    writeFileSync(path.join(dir, `${spec.name}.png`), png)
  }
}
