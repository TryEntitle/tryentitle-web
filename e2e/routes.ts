/**
 * Every route the e2e suite sweeps. Kept explicit (rather than derived from app
 * code) so a route silently disappearing from the app is caught as a test
 * failure rather than quietly shrinking the suite.
 */
/*
 * The CTA label, imported rather than retyped — the opposite call from ROUTES
 * below, and deliberately so.
 *
 * A route vanishing is a bug, so those stay hardcoded to catch it. Renaming the
 * booking CTA is ordinary copy work, and hardcoding it meant the rename to
 * "Book Now" left three specs matching "book a workflow review" and failing with
 * "element(s) not found" — which reads like the button disappeared rather than
 * like the label moved. Binding to the constant makes copy changes free and
 * keeps these tests asserting what they are actually about: that the CTA is
 * reachable.
 */
export { BOOKING_LABEL, HERO_CTA_LABEL } from '../src/lib/constants'

export const SERVICE_SLUGS = [
  'workflow-strategy-assessment',
  'workflow-agents',
  'document-operations',
  'customer-operations',
  'internal-operations',
  'integrations-process-intelligence',
]

export const INDUSTRY_SLUGS = [
  'healthcare',
  'legal',
  'insurance',
  'accounting',
  'real-estate-property-management',
  'construction',
  'professional-services',
]

export const LEGAL_SLUGS = ['privacy', 'terms', 'security', 'dpa']

export const ROUTES: string[] = [
  '/',
  '/services',
  '/industries',
  '/blog',
  '/faq',
  ...SERVICE_SLUGS.map((s) => `/services/${s}`),
  ...INDUSTRY_SLUGS.map((s) => `/industries/${s}`),
  ...LEGAL_SLUGS.map((s) => `/${s}`),
]
