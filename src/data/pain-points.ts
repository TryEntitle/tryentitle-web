import type { IconName } from '@/components/primitives/Icon'

/**
 * "Where the hours go" — six time sinks (design spec §4.4, PRD FR8).
 *
 * Each is stated as an OBSERVABLE SYMPTOM — something you would watch happen in
 * the office — not as a feature or a technology.
 *
 * STAT CHIP NOTE. Chips describe the shape of the process (time ranges) rather
 * than a measured client benchmark. Replace with engagement-backed ranges once
 * there is data to draw from (§4.4).
 */
export interface PainPoint {
  id: string
  label: string
  symptom: string
  icon: IconName
  /** Mono stat chip pinned to the card corner. */
  stat: string
  /** Service detail route this card deep-links to. */
  to: string
}

export const PAIN_POINTS: PainPoint[] = [
  {
    id: 'operations-assessment',
    label: 'Workflow strategy assessment',
    symptom:
      "We map how work moves through your business today and identify exactly where it's getting stuck",
    icon: 'map',
    stat: '60-90 minutes',
    to: '/services/operations-assessment',
  },
  {
    id: 'systems-integration',
    label: 'Document operations',
    symptom:
      'PDFs, forms, and emails get converted into clean, structured data in your system automatically',
    icon: 'document',
    stat: '5-10 minutes per document',
    to: '/services/systems-integration',
  },
  {
    id: 'client-case-onboarding',
    label: 'Client & Case Onboarding',
    symptom: 'New client or case intake runs end to end without manual chasing',
    icon: 'users',
    stat: '1-2 hours',
    to: '/services/managed-operations',
  },
  {
    id: 'approval-and-routing',
    label: 'Approval & Routing',
    symptom: 'Requests reach the right person automatically, with a clear record of every decision',
    icon: 'check',
    stat: '1-2 days',
    to: '/services/operational-intelligence',
  },
  {
    id: 'reporting-and-data-sync',
    label: 'Reporting & Data Sync',
    symptom: 'Reports pull from live data instead of a manual weekly build',
    icon: 'activity',
    stat: '5-10 minutes per report',
    to: '/services/operational-intelligence',
  },
  {
    id: 'integration-and-process-intelligence',
    label: 'Integration & Process Intelligence',
    symptom: 'Your existing systems finally share information with each other',
    icon: 'plug',
    stat: '1-2 days',
    to: '/services/integrations-process-intelligence',
  },
]
