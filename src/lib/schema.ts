/**
 * JSON-LD builders (PRD §11.7, design spec §6). `Organization` and `FAQPage` on
 * home, `Article` on blog posts, `BreadcrumbList` on nested routes. Kept
 * data-only; pages wrap the output with `jsonLd()` from metadata.ts and hand it
 * to useHead.
 */
import { SITE_NAME, SITE_URL, SITE_TAGLINE } from './constants'

export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/icon-512.png`,
    description: SITE_TAGLINE,
    slogan: SITE_TAGLINE,
  }
}

/**
 * FAQPage from the on-page accordion (design spec §6 SEO).
 *
 * Built from the SAME data the FAQ section renders, so the structured data can
 * never drift from the visible answers — Google treats a mismatch between markup
 * and page content as a manual-action risk, and a second copy of the copy is how
 * that drift happens.
 */
export function faqSchema(
  items: readonly { question: string; answer: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

export function articleSchema(input: {
  title: string
  description: string
  path: string
  datePublished: string
  dateModified?: string
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: new URL(input.path, SITE_URL).toString(),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  }
}

export function breadcrumbSchema(
  crumbs: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: new URL(c.path, SITE_URL).toString(),
    })),
  }
}
