/**
 * Structured detail content for each service page (PRD FR14 / §8.2).
 *
 * The Markdown body of a service already carries the narrative, the symptoms it
 * addresses, what we deliver, and where a human stays in the loop. What it does
 * not carry is the concrete "show me" layer: named, recognisable situations with
 * what we actually build for each. That lives here and renders through the same
 * UseCaseGrid the industry pages use, so the two page types read as one site.
 *
 * Same honesty rules as the industry content (see data/industry-detail.ts):
 * outcomes are qualitative, because invented metrics are the fake-dashboard
 * failure the design guardrails ban (§10.2).
 *
 * `industries` lists the fields where this service does the most work — the
 * cross-links that keep a reader moving between the two page types (FR3).
 */
import type { UseCase } from '@/data/industry-detail'

export interface ServiceDetail {
  slug: string
  /** Slugs of the industries this service most often runs in. */
  industries: string[]
  useCases: UseCase[]
}

export const SERVICE_DETAIL: ServiceDetail[] = [
  {
    slug: 'operations-assessment',
    industries: ['healthcare', 'accounting', 'professional-services'],
    useCases: [
      {
        title: 'One process, followed end to end',
        problem:
          'You know a process is expensive, but not which step inside it costs the time.',
        build:
          'We follow live work from trigger to close, timing every handoff, wait, and rekey as it actually happens — not as the process doc describes it.',
        impacts: [
          'A map you can check against reality',
          'Time located by step, not by department',
          'Agreement on where the cost sits',
        ],
      },
      {
        title: 'The rekey count',
        problem:
          'The same details are typed into two or three systems, and nobody has counted how often.',
        build:
          'We count every duplicate entry, where each one originates, and what it would take to remove it.',
        impacts: [
          'Duplicate entry made visible',
          'Integration work aimed at the worst offender',
          'A number you can hold a decision against',
        ],
      },
      {
        title: 'Automate, redesign, or leave alone',
        problem:
          'Automation gets proposed for steps that should not exist at all, and skipped for the ones that quietly cost the most.',
        build:
          'Every step gets one of three recommendations with the reason attached — including the steps we advise you not to touch.',
        impacts: [
          'A defensible reason per step',
          'Bad automation candidates ruled out early',
          'Nothing changed in your systems yet',
        ],
      },
      {
        title: 'A first build you can actually start',
        problem:
          'Assessments end in a slide deck that nobody can act on next week.',
        build:
          'We scope one workflow — the sequence, the exception rules, the systems involved, and the rough effort — as a plan you could start from immediately.',
        impacts: [
          'One scoped workflow, not a wish list',
          'Effort estimated before you commit',
          'A clear decision point at the end',
        ],
      },
    ],
  },
  {
    slug: 'process-design-optimization',
    industries: ['insurance', 'construction', 'healthcare'],
    useCases: [
      {
        title: 'Inbox to system of record',
        problem:
          'Work arrives as an attachment and stalls until a person opens it, reads it, and types it somewhere else.',
        build:
          'An agent watches the inbox, identifies what arrived, extracts the fields you use, and enters them into the system of record.',
        impacts: [
          'Work moves without a person carrying it',
          'Arrival to entry in minutes',
          'Every action logged and traceable',
        ],
      },
      {
        title: 'The chase',
        problem:
          'Outstanding items — signatures, documents, approvals — only move when someone remembers to follow up.',
        build:
          'An agent tracks what is outstanding, follows up on your schedule, and stops the moment the item comes back.',
        impacts: [
          'Follow-ups happen on time, every time',
          'Nobody keeping a mental chase list',
          'Stalled items escalated, not repeated forever',
        ],
      },
      {
        title: 'Checks against your rules',
        problem:
          'Errors are caught late, by the person downstream who happens to notice.',
        build:
          'An agent validates each item against your rules before it is saved, and routes anything that fails to a review queue.',
        impacts: [
          'Errors caught at entry',
          'Rules applied the same way every time',
          'Failures reviewed, never silently fixed',
        ],
      },
      {
        title: 'Defined handoffs and an audit trail',
        problem:
          'Automation that cannot explain what it did is automation nobody trusts with real work.',
        build:
          'Each agent has a written scope, an explicit escalation rule, and a log of every action it takes.',
        impacts: [
          'Clear line between agent and person',
          'Every action reconstructable',
          'Scope changes are a decision, not a drift',
        ],
      },
    ],
  },
  {
    slug: 'systems-integration',
    industries: ['healthcare', 'legal', 'accounting'],
    useCases: [
      {
        title: 'Intake from every channel',
        problem:
          'Documents arrive by email, upload, portal, and fax, and each channel is handled by a different habit.',
        build:
          'One intake point that captures documents from every channel, identifies what each one is, and queues it for processing.',
        impacts: [
          'One place to look for anything received',
          'Nothing sitting in a personal inbox',
          'Channel no longer changes the process',
        ],
      },
      {
        title: 'Extraction and validation',
        problem:
          'Someone reads the document and retypes the fields, and a typo is only found when it causes a problem.',
        build:
          'Extract the fields you actually use, validate them against your rules and existing records, and confirm before anything is saved.',
        impacts: [
          'No field-by-field retyping',
          'Values checked against your own data',
          'Bad data stopped before it spreads',
        ],
      },
      {
        title: 'Naming and filing',
        problem:
          'Filing is inconsistent, so finding a document later means searching three places and asking someone.',
        build:
          'Consistent naming and filing rules applied on the way in, so every document lands where it belongs the first time.',
        impacts: [
          'Documents findable without asking',
          'Consistent naming across the firm',
          'No re-filing project later',
        ],
      },
      {
        title: 'The exception queue',
        problem:
          'When a document is unreadable or does not fit the pattern, it is either guessed at or quietly parked.',
        build:
          'Anything unreadable, unexpected, or failing a rule goes to a review queue with the document and the reason attached.',
        impacts: [
          'Nothing guessed at silently',
          'Review time only on the odd ones',
          'Visible count of what needs a person',
        ],
      },
    ],
  },
  {
    slug: 'managed-operations',
    industries: ['real-estate-property-management', 'professional-services', 'insurance'],
    useCases: [
      {
        title: 'One intake point with an acknowledgement',
        problem:
          'Requests come in through email, forms, and voicemail, and some quietly fall through.',
        build:
          'Every request lands in one queue and gets an acknowledgement immediately, whichever channel it came from.',
        impacts: [
          'Every request acknowledged',
          'One queue instead of several inboxes',
          'Nothing lost between channels',
        ],
      },
      {
        title: 'Status without being asked',
        problem:
          'Customers ask "where are we?" because nobody has told them, and answering means digging through systems.',
        build:
          'Status updates triggered by the work moving forward, not by someone finding time to write them.',
        impacts: [
          'Fewer inbound status calls',
          'Updates that match reality',
          'No one assembling updates by hand',
        ],
      },
      {
        title: 'Scheduling and reminders',
        problem:
          'Booking the next step and reminding people about it depends on someone remembering.',
        build:
          'Scheduling and reminders that run on their own and stop as soon as the step is done.',
        impacts: [
          'Fewer no-shows and missed steps',
          'Reminders stop when they should',
          'Calendar work off your team’s desk',
        ],
      },
      {
        title: 'Handoff with the history attached',
        problem:
          'When a request needs a person, they start by reconstructing what already happened.',
        build:
          'Anything needing judgment goes to a person with the full history, documents, and prior messages attached.',
        impacts: [
          'No reconstructing the thread',
          'Faster resolution on hard cases',
          'Human attention where it belongs',
        ],
      },
    ],
  },
  {
    slug: 'operational-intelligence',
    industries: ['accounting', 'legal', 'construction'],
    useCases: [
      {
        title: 'Approvals that do not sit',
        problem:
          'An approval waits in an inbox for days because nobody can see what is pending on them.',
        build:
          'Approval routing that shows who owns each decision, how long it has waited, and what it is holding up.',
        impacts: [
          'Waiting time visible to everyone',
          'Reminders without a person nagging',
          'Owner clear on every decision',
        ],
      },
      {
        title: 'Month-end assembly',
        problem:
          'The same reconciliation is rebuilt by hand every close, copying figures between tabs.',
        build:
          'Reconciliations and close schedules assembled from the source systems, with only the variances left for a person.',
        impacts: [
          'Close work reduced to exceptions',
          'Figures traceable to their source',
          'Same process every month',
        ],
      },
      {
        title: 'Recurring reporting',
        problem:
          'Someone spends a morning each week rebuilding a report that has not changed shape in a year.',
        build:
          'Recurring reports assembled and distributed on schedule, drawn from the systems where the work happens.',
        impacts: [
          'A morning a week returned',
          'Reports arrive without a request',
          'Numbers consistent between reports',
        ],
      },
      {
        title: 'Handoffs between teams',
        problem:
          'Work handed from one team to another loses context and has to be reassembled by the receiver.',
        build:
          'Structured handoffs that carry the context, documents, and open questions the next team needs.',
        impacts: [
          'Receiving team starts, not restarts',
          'Fewer "who has this?" threads',
          'Context kept with the work',
        ],
      },
    ],
  },
  {
    slug: 'integrations-process-intelligence',
    industries: ['insurance', 'healthcare', 'real-estate-property-management'],
    useCases: [
      {
        title: 'Systems that stop needing a courier',
        problem:
          'People are the integration: copying records between tools you already pay for.',
        build:
          'Integrations between your existing systems, so data moves on its own and each system stays current.',
        impacts: [
          'No person carrying data across',
          'Records current in every system',
          'Tools you already pay for actually used',
        ],
      },
      {
        title: 'One current view of a record',
        problem:
          'The same client, matter, or property lives in three systems and none of them agree.',
        build:
          'A single current view assembled from the systems of record, with the source of each field identified.',
        impacts: [
          'One version people can act on',
          'Field-level source always visible',
          'Fewer decisions made on stale data',
        ],
      },
      {
        title: 'Conflicts surfaced, not overwritten',
        problem:
          'Sync tools quietly pick a winner when two systems disagree, and the wrong value spreads.',
        build:
          'Where systems conflict, the disagreement is surfaced for a person to resolve, with both values shown.',
        impacts: [
          'No silent overwrites',
          'Disagreements resolved once',
          'Data quality improves over time',
        ],
      },
      {
        title: 'Where the work actually waits',
        problem:
          'You suspect a step is the bottleneck, but you cannot show it — so improvement is guesswork.',
        build:
          'Process reporting that shows where work waits, how long, and how often, per step.',
        impacts: [
          'Bottleneck identified, not guessed',
          'Change measured against a baseline',
          'Effort aimed at the real constraint',
        ],
      },
    ],
  },
]

const bySlug = new Map(SERVICE_DETAIL.map((d) => [d.slug, d]))

export function getServiceDetail(slug: string): ServiceDetail | undefined {
  return bySlug.get(slug)
}
