/**
 * SEO metadata — one source of truth (PRD §11.7, FR5).
 *
 * Routes call `buildHead()`; no route hand-writes meta tags. It produces title,
 * description, canonical, Open Graph, and Twitter card entries in the shape
 * `@unhead/vue`'s `useHead` expects. JSON-LD is added separately via `jsonLd()`.
 */
import type { ReactiveHead } from '@unhead/vue'
import { SITE_NAME, SITE_URL, SITE_TAGLINE } from './constants'

export interface PageMeta {
  /** Page title, without the site-name suffix (added here). */
  title: string
  description: string
  /** Absolute path for this route, e.g. "/services". Used for canonical + OG url. */
  path: string
  /** OG image path relative to /public, e.g. "/og/home.png". */
  image?: string
  /** OG type — "website" for pages, "article" for blog posts. */
  type?: 'website' | 'article'
  /** Set true on pages that should not be indexed (e.g. 404). */
  noindex?: boolean
}

function absolute(path: string): string {
  return new URL(path, SITE_URL).toString()
}

/** Title as shown in the browser and OG card; home uses the bare site name. */
export function pageTitle(title: string, path: string): string {
  return path === '/' ? `${SITE_NAME} | ${SITE_TAGLINE}` : `${title} | ${SITE_NAME}`
}

export function buildHead(meta: PageMeta): ReactiveHead {
  const url = absolute(meta.path)
  const title = pageTitle(meta.title, meta.path)
  const image = absolute(meta.image ?? '/og/default.png')

  return {
    title,
    link: [{ rel: 'canonical', href: url }],
    meta: [
      { name: 'description', content: meta.description },
      ...(meta.noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),

      // Open Graph
      { property: 'og:type', content: meta.type ?? 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:title', content: title },
      { property: 'og:description', content: meta.description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },

      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: meta.description },
      { name: 'twitter:image', content: image },
    ],
  }
}

/** Wrap a JSON-LD object as a script tag for useHead's `script` array. */
export function jsonLd(data: Record<string, unknown>) {
  return {
    type: 'application/ld+json',
    // Serialised here so unhead emits it verbatim into <head>.
    innerHTML: JSON.stringify(data),
  }
}
