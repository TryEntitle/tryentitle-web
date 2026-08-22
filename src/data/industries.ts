import type { IconName } from '../components/primitives/Icon/icons'

/**
 * The seven target industries (design spec §4.9, PRD §8.3 / FR10).
 *
 * Names and slugs are fixed. Each entry lists the concrete workflows we handle
 * in that field — generic industry copy actively damages credibility with an
 * ops lead who works there daily (PRD §17 risk).
 *
 * The list is explicitly NOT exhaustive; the section renders a note saying so.
 */
export interface IndustrySummary {
  slug: string
  name: string
  /** Concrete workflows shown when the industry dropdown opens. */
  workflows: readonly string[]
  /**
   * What changes for a firm in this field, in their own terms — the marquee
   * tiles lead with this rather than a workflow list, because the outcome is
   * what an ops lead recognises at a glance.
   */
  outcome: string
  icon: IconName
}

export const INDUSTRIES: IndustrySummary[] = [
  {
    slug: 'healthcare',
    name: 'Healthcare',
    workflows: [
      'Patient intake',
      'Insurance verification',
      'Prior authorization',
      'Referral processing',
      'Appointment routing',
    ],
    outcome:
      'Stop losing appointments to voicemail, cut turnaround from days to hours, and catch registration errors before they come back as denials.',
    icon: 'pulse',
  },
  {
    slug: 'legal',
    name: 'Legal',
    workflows: [
      'Matter intake',
      'Conflict checks',
      'Client onboarding',
      'Document review',
      'Billing entry sync',
    ],
    outcome:
      'Streamline intake, matter setup, and administrative workflows so your team can spend less time on repetitive work and more time on clients.',
    icon: 'scale',
  },
  {
    slug: 'insurance',
    name: 'Insurance',
    workflows: ['Claims intake', 'Policy validation', 'Adjuster assignment', 'Renewal processing'],
    outcome:
      'Simplify repetitive processes, improve document workflows, and reduce the administrative work that slows down your team.',
    icon: 'shield',
  },
  {
    slug: 'accounting',
    name: 'Accounting',
    workflows: [
      'Client document collection',
      'Data entry from statements',
      'Approval routing',
      'Recurring report generation',
    ],
    outcome:
      'Make document collection, client communication, and recurring workflows easier to manage while reducing the manual work behind the scenes.',
    icon: 'calculator',
  },
  {
    slug: 'real-estate-property-management',
    name: 'Real Estate',
    workflows: ['Transaction document handling', 'Client onboarding', 'Closing coordination'],
    outcome:
      'Improve lead response, tenant communication, maintenance workflows, and day-to-day property operations without adding more administrative work.',
    icon: 'building',
  },
  {
    slug: 'construction',
    name: 'Construction',
    workflows: [
      'Permit tracking',
      'Subcontractor document collection',
      'Invoice processing',
      'Change order routing',
    ],
    outcome:
      'Improve project workflows, reduce administrative bottlenecks, and keep documentation, approvals, and communication organized from start to finish.',
    icon: 'hardhat',
  },
  {
    slug: 'professional-services',
    name: 'Professional Services',
    workflows: [
      'Client intake',
      'Proposal and contract routing',
      'Recurring reporting',
      'Billing sync',
    ],
    outcome:
      'Turn proposals around faster, onboard clients the same way every time, and protect margin without adding overhead to grow.',
    icon: 'briefcase',
  },
]
