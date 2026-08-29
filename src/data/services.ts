/**
 * The six core services (design spec §4.6, PRD §8.2).
 *
 * THE SIX NAMES ARE FIXED. They must match across nav, home, services, footer,
 * and metadata. `name` and `slug` do not change without a PRD update.
 *
 * Each entry carries what the sticky tab rail needs: a `headline` (the outcome,
 * in the customer's terms) and a `summary` (the one-line promise).
 */
import type { IconName } from '../components/primitives/Icon/icons'

export interface ServiceSummary {
  slug: string
  name: string
  /** Outcome headline shown in the rail panel. */
  headline: string
  /** One-line promise — plain, operational, no jargon (PRD §8.1). */
  summary: string
  /** Concrete examples rendered as record chips. Optional: the services rail no
   *  longer shows them, but the service detail hero still accepts them. */
  chips?: readonly string[]
  /** Glyph from the shared icon set. */
  icon: IconName
}

export const SERVICES: ServiceSummary[] = [
  {
    slug: 'operations-assessment',
    name: 'Operations Assessment',
    headline: 'See what the work actually costs',
    summary:
      'We follow your operation end to end and show you where the time, the cost, and the capacity are going.',
    icon: 'map',
  },
  {
    slug: 'process-design-optimization',
    name: 'Process Design & Optimization',
    headline: 'Build Better Operations',
    summary:
      'We redesign how work gets done to remove bottlenecks, unnecessary steps, and the costs they create.',
    icon: 'repeat',
  },
  {
    slug: 'systems-integration',
    name: 'Systems Integration',
    headline: 'One connected operation',
    summary: 'Your systems share information instead of being bridged by someone retyping it.',
    icon: 'inbox',
  },
  {
    slug: 'managed-operations',
    name: 'Managed Operations',
    headline: 'Keep Operations Performing',
    summary:
      'Ongoing oversight that keeps the operation running well and improving after the project ends.',
    icon: 'document',
  },
  {
    slug: 'operational-intelligence',
    name: 'Operational Intelligence',
    headline: 'Know how the operation is performing',
    summary:
      'Reporting built on live data, so cost, throughput, and bottlenecks are visible as they happen.',
    icon: 'users',
  },

  {
    slug: 'integrations-process-intelligence',
    name: 'Integrations & Process Intelligence',
    headline: 'Your systems, finally talking',
    summary:
      'Data moves between the tools you already pay for, and you can see where work slows down.',
    icon: 'plug',
  },
]

export function getService(slug: string): ServiceSummary | undefined {
  return SERVICES.find((s) => s.slug === slug)
}
