/**
 * Site-wide constants — the single source of truth for identity and destinations.
 *
 * BOOKING_URL is consumed ONLY by the BookingButton component (PRD FR2). Every
 * CTA on the site renders through BookingButton, so changing the scheduler is a
 * one-line change here. An e2e test asserts a single unique booking origin across
 * the built site.
 */

/** Canonical production origin. Update alongside D2 (domain/DNS). */
export const SITE_URL = 'https://tryentitle.com'

export const SITE_NAME = 'TryEntitle'

export const SITE_TAGLINE = 'Workflows that move business forward'

/**
 * The single booking destination for the entire site.
 * [DECISION NEEDED · PRD D1] — replace <handle> with the real Calendly event.
 */
export const BOOKING_URL = 'https://calendly.com/tryentitle/workflow-review'

/** Human-readable label for the primary action, reused across placements. */
export const BOOKING_LABEL = 'Book Now'

/**
 * Hero-only label for the same booking action.
 *
 * The hero opens the page, so it invites rather than instructs — every other
 * placement keeps BOOKING_LABEL. Same destination either way; only the wording
 * differs, and it lives here so the e2e suite binds to the constant instead of
 * retyping the copy.
 */
export const HERO_CTA_LABEL = 'Get Started'

/**
 * Contact addresses surfaced in legal pages and the footer.
 * Confirm these inboxes are monitored before launch (PRD D8).
 */
export const CONTACT = {
  general: 'hello@tryentitle.com',
  privacy: 'privacy@tryentitle.com',
  security: 'security@tryentitle.com',
} as const

/**
 * Legal identity used by Terms, Privacy, DPA, and Security pages.
 * Keep the markdown in `src/content/legal/` aligned with these values.
 */
export const LEGAL = {
  /** Name used in contracts and policies. */
  legalName: 'TryEntitle',
  /** Public trading / brand name. */
  tradingName: 'TryEntitle',
  /** How the business is described in policies. */
  entityDescription: 'a workflow redesign and automation firm',
  /** Governing law for website terms. Update if incorporation jurisdiction differs. */
  governingLaw: 'the laws of England and Wales',
  /** Exclusive venue for disputes under the website Terms. */
  venue: 'the courts of England and Wales',
  /** Website-use liability cap (informational site; engagement liability is contractual). */
  websiteLiabilityCap: 'one hundred pounds sterling (£100)',
  /** Scheduling provider named in privacy / DPA. */
  scheduler: 'Calendly',
  /** Static host / CDN named in privacy / security. */
  host: 'Vercel',
} as const

/**
 * Append a per-placement UTM tag so it is possible to learn which CTA converts
 * (PRD §11.6). `placement` is a free-form slug: hero | nav | closing | footer | …
 *
 * `extra` carries scheduler prefill values — the hours calculator passes its
 * computed figure through as `a1` so the call opens with the visitor's own
 * number already on the table (design spec §4.10).
 */
export function bookingUrl(placement: string, extra?: Record<string, string>): string {
  const url = new URL(BOOKING_URL)
  url.searchParams.set('utm_source', 'website')
  url.searchParams.set('utm_content', placement)
  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value) url.searchParams.set(key, value)
  }
  return url.toString()
}
