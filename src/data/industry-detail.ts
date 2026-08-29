/**
 * Structured detail content for each industry page (PRD FR15 / §8.3).
 *
 * The industry detail pages are the credibility gate: a reader from the field
 * has to recognise their own week in the first screen (PRD §17). So each entry
 * names real artifacts — prior-authorization packets, ACORD forms, AIA G702
 * pay applications — never a find-and-replaced generic.
 *
 * Each use case is written as three plain statements a reader can check against
 * their own office:
 *   - `problem` — what happens today, observable, no jargon.
 *   - `build`   — what we put in place instead.
 *   - `impacts` — the operational change to expect. Deliberately QUALITATIVE:
 *                 we have no client metrics yet, and invented percentages are
 *                 the fake-dashboard failure the design guardrails ban (§10.2).
 *
 * `systems` names categories of software, not vendors. We are not claiming a
 * partnership or a certified integration with any named product.
 *
 * `human` is the human-in-the-loop guarantee for the field, rendered in the
 * brass exception accent (§10.3) — brass only ever means "a person is involved".
 *
 * Copy, not components (PRD §11.3 rule 4): editing an industry page is an edit
 * to this file or its Markdown body, never to a section.
 */

/** One document-heavy workflow, stated as today → what we build → what changes. */
export interface UseCase {
  /** Short workflow name, in the field's own vocabulary. */
  title: string
  /** What happens today. Observable in the office, not a feature gap. */
  problem: string
  /** What we put in place instead. */
  build: string
  /** Qualitative operational outcomes. Two to three; never invented numbers. */
  impacts: string[]
}

export interface IndustryDetail {
  slug: string
  /** Categories of systems the work moves between — no vendor names (see above). */
  systems: string[]
  /** Where a person stays in the work, for this field specifically. */
  human: string
  /** Slugs of the services that carry this work, in reading order. */
  services: string[]
  useCases: UseCase[]
}

export const INDUSTRY_DETAIL: IndustryDetail[] = [
  {
    slug: 'healthcare',
    systems: [
      'EHR / chart',
      'Practice management',
      'Payer portals',
      'Clearinghouse',
      'Inbound fax and secure email',
      'Document storage',
    ],
    human:
      'Nothing clinical is automated. A person reviews anything that affects care, and any prior-auth denial or claim discrepancy reaches your team with the packet already assembled — not left to be rebuilt from scratch.',
    services: ['systems-integration', 'process-design-optimization', 'managed-operations'],
    useCases: [
      {
        title: 'Prior-authorization packets',
        problem:
          'Every payer wants a slightly different set of clinical notes, codes, and forms, and the packet is assembled by hand each time — then chased by phone.',
        build:
          'Assemble the packet from the chart against each payer’s current requirements, submit it, and track the request until it is approved or denied.',
        impacts: [
          'Fewer packets returned incomplete',
          'Auth status without a hold-music call',
          'Denials arrive already documented',
        ],
      },
      {
        title: 'Referral intake',
        problem:
          'Referrals land by fax, portal, and email, then wait to be rekeyed into the EHR by whoever has a free minute.',
        build:
          'Capture every inbound referral from all three channels, check the set is complete, and file it into the EHR without a rekey.',
        impacts: [
          'Same-day referral entry',
          'Nothing lost between fax and inbox',
          'Missing detail chased on its own',
        ],
      },
      {
        title: 'New-patient intake',
        problem:
          'Intake forms and insurance cards are retyped into the chart on the morning of the visit, with the front desk holding the queue.',
        build:
          'Turn intake forms, ID, and insurance cards into structured records before the first appointment, and flag what is still outstanding.',
        impacts: [
          'Shorter front-desk queue',
          'Registration complete before arrival',
          'Fewer corrections after the visit',
        ],
      },
      {
        title: 'Eligibility and benefits checks',
        problem:
          'Coverage is checked one patient at a time in a payer portal, often minutes before the appointment.',
        build:
          'Verify coverage against tomorrow’s schedule and flag the appointments where benefits will not cover the planned visit.',
        impacts: [
          'Coverage problems found before the visit',
          'Fewer surprises at the front desk',
          'Cleaner claims downstream',
        ],
      },
      {
        title: 'EOB and claim follow-up',
        problem:
          'Explanations of benefits and remittances pile up, and reconciling them against what was billed is line-by-line manual work.',
        build:
          'Reconcile remittances against billed charges and route only the variances to a person, with the claim history attached.',
        impacts: [
          'Shorter follow-up cycle on aged claims',
          'Underpayments actually noticed',
          'Write-offs become a decision, not a default',
        ],
      },
      {
        title: 'Records requests and release of information',
        problem:
          'Each request means locating the documents, confirming the authorization is valid, and packaging the release by hand.',
        build:
          'Log every request, verify the authorization on file, and assemble the release for a person to approve before it goes out.',
        impacts: [
          'Requests answered inside the required window',
          'Every release traceable',
          'Authorization checked, never assumed',
        ],
      },
    ],
  },
  {
    slug: 'legal',
    systems: [
      'Practice management',
      'Document management',
      'E-signature',
      'Court docket and calendar',
      'Email and shared drives',
      'Time and billing',
    ],
    human:
      'Legal judgment stays with your attorneys. We assemble, organize, and route; an attorney reviews anything substantive before it goes out, and any conflict or missing detail is surfaced for a person rather than assumed away.',
    services: ['systems-integration', 'process-design-optimization', 'operational-intelligence'],
    useCases: [
      {
        title: 'Matter intake and conflict checks',
        problem:
          'New matter details arrive in an email thread, get typed into practice management, and the conflict check waits on someone to run it.',
        build:
          'Capture the matter details once, run the conflict check against existing files, and open the matter with the intake record attached.',
        impacts: [
          'Conflicts cleared before work starts',
          'Matter opened the same day',
          'One intake record instead of a thread',
        ],
      },
      {
        title: 'Engagement letters',
        problem:
          'Each letter is rebuilt from the last one someone can find, then chased for signature over several weeks.',
        build:
          'Generate the letter from the matter record, route it for signature, and keep reminding until it is executed.',
        impacts: [
          'Consistent terms across matters',
          'Signed letter on file before work begins',
          'No one chasing signatures by hand',
        ],
      },
      {
        title: 'Discovery document handling',
        problem:
          'Productions arrive as unsorted exports, so the first days of review go to de-duplicating and indexing at billable rates.',
        build:
          'Ingest, de-duplicate, index, and organize each production so review starts from a clean, searchable set.',
        impacts: [
          'Review starts on a clean set',
          'Duplicates removed before they are read',
          'Every document indexed and traceable',
        ],
      },
      {
        title: 'Court dates and filing deadlines',
        problem:
          'Deadlines live inside orders and filings, and getting them onto the calendar depends on someone reading every page.',
        build:
          'Extract dates from orders and filings into the firm calendar, each entry linked back to the source document.',
        impacts: [
          'No deadline held in someone’s memory',
          'Every entry traceable to its order',
          'Earlier warning on tight dates',
        ],
      },
      {
        title: 'Document assembly and closing sets',
        problem:
          'Assembling a closing set or exhibit binder means collecting, ordering, paginating, and indexing by hand.',
        build:
          'Assemble the set from the matter file in the required order — paginated and indexed — for attorney review.',
        impacts: [
          'Binders assembled in hours',
          'Consistent pagination and index',
          'Missing exhibits flagged early',
        ],
      },
      {
        title: 'Prebills and billing narratives',
        problem:
          'Prebills come back needing rewritten narratives, and the edit cycle takes a partner’s week every month.',
        build:
          'Assemble prebills with the supporting detail attached and flag the entries that need a narrative fix before review.',
        impacts: [
          'Shorter prebill cycle',
          'Fewer client write-downs',
          'Review time spent on judgment, not formatting',
        ],
      },
    ],
  },
  {
    slug: 'insurance',
    systems: [
      'Agency management system',
      'Carrier and MGA portals',
      'Rating and quoting tools',
      'Email and attachments',
      'E-signature',
      'Document storage',
    ],
    human:
      'Coverage decisions and advice stay with your licensed staff. The forms and follow-ups run on their own; anything that changes an exposure, or a submission a carrier questions, goes to a producer with the file already in hand.',
    services: ['systems-integration', 'process-design-optimization', 'integrations-process-intelligence'],
    useCases: [
      {
        title: 'ACORD form intake',
        problem:
          'Standardized does not mean automated: ACORD forms still get read and rekeyed field by field into the management system.',
        build:
          'Read submitted ACORD forms, validate the fields against your rules, and write them into the management system without a rekey.',
        impacts: [
          'No producer retyping a submission',
          'Fields validated before they are saved',
          'Consistent data across the book',
        ],
      },
      {
        title: 'Submissions to carriers',
        problem:
          'A submission goes to six markets by email, and tracking who has responded lives in one person’s sent folder.',
        build:
          'Assemble the submission package once, send it to each market, and track responses until you have quotes back.',
        impacts: [
          'One view of every market’s status',
          'Follow-ups sent without a reminder',
          'Quotes compared from complete data',
        ],
      },
      {
        title: 'Certificates of insurance',
        problem:
          'Routine COI requests interrupt account managers all day, and each one is issued by hand against the policy on file.',
        build:
          'Issue certificates against the policy on file, handle the routine holder requests, and escalate the ones with unusual wording.',
        impacts: [
          'Routine COIs out the same day',
          'Account managers off certificate duty',
          'Unusual requests reach a licensed person',
        ],
      },
      {
        title: 'Loss runs and renewal prep',
        problem:
          'Renewal season starts with chasing loss runs from carriers, then rebuilding each account’s history by hand.',
        build:
          'Gather loss runs ahead of each renewal, assemble the account history, and flag the accounts that need underwriting attention.',
        impacts: [
          'Renewals prepared weeks earlier',
          'Loss runs gathered without chasing',
          'Attention aimed at the hard accounts',
        ],
      },
      {
        title: 'Policy checking and endorsements',
        problem:
          'Issued policies are checked against what was bound only when someone has time — so errors surface at claim time.',
        build:
          'Compare the issued policy against the bound submission, and route every discrepancy to a person with both documents side by side.',
        impacts: [
          'Discrepancies caught at issue',
          'Endorsement requests tracked to confirmation',
          'Fewer E&O surprises later',
        ],
      },
      {
        title: 'First notice of loss',
        problem:
          'A claim comes in by phone or email, and the intake details are captured differently by whoever answers.',
        build:
          'Capture the notice into one structured record, acknowledge it to the insured, and hand the file to the adjuster or carrier.',
        impacts: [
          'Every claim acknowledged immediately',
          'Consistent intake regardless of channel',
          'Adjuster starts from a complete file',
        ],
      },
    ],
  },
  {
    slug: 'accounting',
    systems: [
      'Tax preparation software',
      'General ledger and bookkeeping',
      'Practice management',
      'Client portal',
      'Bank feeds and statements',
      'Document storage',
    ],
    human:
      'Every return and reconciliation is reviewed and signed off by your staff. The system gathers, organizes, and flags exceptions; it does not make an accounting judgment, and an item that does not tie out is sent to a person, not forced to balance.',
    services: ['systems-integration', 'operational-intelligence', 'process-design-optimization'],
    useCases: [
      {
        title: 'Client source documents',
        problem:
          'W-2s, 1099s, and statements arrive in every format imaginable, and busy season starts with sorting a pile and chasing what is missing.',
        build:
          'Collect documents through one channel, check each client’s set against a required-document list, and organize by client and period.',
        impacts: [
          'One checklist per client, always current',
          'Missing documents chased automatically',
          'Preparers start from a complete file',
        ],
      },
      {
        title: 'Bank and account reconciliations',
        problem:
          'Reconciliations are done by hand every close, copying figures between statements and the ledger.',
        build:
          'Match transactions from source statements against the ledger and surface only the items that do not tie out.',
        impacts: [
          'Close work down to the exceptions',
          'Unmatched items visible immediately',
          'Nothing forced to balance quietly',
        ],
      },
      {
        title: 'Engagement letters and organizers',
        problem:
          'Every season opens with issuing letters and organizers one client at a time, then tracking who has returned what.',
        build:
          'Issue letters and organizers on a schedule, track returns, and keep reminding the clients who have not responded.',
        impacts: [
          'Season opens on time',
          'Signed letters on file before work starts',
          'No manual reminder list',
        ],
      },
      {
        title: 'Filing deadlines and extensions',
        problem:
          'Deadlines and the documents outstanding against them are tracked in a spreadsheet someone has to remember to update.',
        build:
          'Track each client’s deadlines against the documents still outstanding, and escalate the ones at risk while there is time to act.',
        impacts: [
          'Deadline risk visible weeks out',
          'Extensions decided, not discovered',
          'One list the whole firm trusts',
        ],
      },
      {
        title: 'Bookkeeping intake',
        problem:
          'Bills, receipts, and invoices come in by email and photo, and coding them into the ledger is a daily manual chore.',
        build:
          'Capture each document, extract the fields you code on, and post to the ledger with the source image attached.',
        impacts: [
          'Daily intake handled without a person',
          'Source document attached to every entry',
          'Coding questions routed, not guessed',
        ],
      },
      {
        title: '1099 and vendor W-9 preparation',
        problem:
          'Year-end 1099s mean tracking down W-9s that were never collected and reconciling vendor totals by hand.',
        build:
          'Collect W-9s as vendors are onboarded, reconcile payment totals through the year, and assemble the filing set for review.',
        impacts: [
          'W-9s on file before year-end',
          'Vendor totals reconciled continuously',
          'Filing set ready for sign-off',
        ],
      },
    ],
  },
  {
    slug: 'real-estate-property-management',
    systems: [
      'Property management system',
      'Transaction management',
      'E-signature',
      'Accounting and ledger',
      'Listing and portal feeds',
      'Email and shared drives',
    ],
    human:
      'Approvals — a tenant application, a lease term, a vendor for a repair — stay with your team. The paperwork is assembled and routed; a person decides, and any incomplete file or urgent maintenance issue is escalated rather than left in a queue.',
    services: ['systems-integration', 'managed-operations', 'process-design-optimization'],
    useCases: [
      {
        title: 'Closing binders and transaction files',
        problem:
          'The documents a closing requires are spread across inboxes, and what is still outstanding is only known by asking.',
        build:
          'Assemble the transaction file against a required-document list and track what is outstanding as the closing date approaches.',
        impacts: [
          'Outstanding items visible daily',
          'Binder complete before closing',
          'No last-minute document scramble',
        ],
      },
      {
        title: 'Leases and renewals',
        problem:
          'Leases are rebuilt from the last similar one, and renewal cycles start late because nothing prompts them.',
        build:
          'Generate the lease from the deal terms, route it for signature, and open the renewal cycle on schedule.',
        impacts: [
          'Signed lease before move-in',
          'Renewals started on time',
          'Consistent terms across the portfolio',
        ],
      },
      {
        title: 'Tenant applications',
        problem:
          'Applications arrive with pieces missing, and each one is chased by hand before anyone can make a decision.',
        build:
          'Collect the application and supporting documents, check the set is complete, and present the file to a person to decide.',
        impacts: [
          'Complete files reach the decision-maker',
          'Applicants chased without staff time',
          'Faster time to a yes or no',
        ],
      },
      {
        title: 'Maintenance requests',
        problem:
          'Requests come in by email, portal, and phone, so some sit for days in an inbox nobody owns.',
        build:
          'Capture every request into one queue, acknowledge it to the tenant, dispatch the vendor, and follow up until it is closed.',
        impacts: [
          'No request lost between channels',
          'Tenants acknowledged immediately',
          'Urgent issues escalated, not queued',
        ],
      },
      {
        title: 'Move-in and move-out documentation',
        problem:
          'Inspection photos, condition reports, and deposit calculations live in phones and spreadsheets.',
        build:
          'Assemble the inspection record, condition report, and deposit statement into one file for review and release.',
        impacts: [
          'Deposit decisions documented',
          'Condition evidence in one place',
          'Disputes answered from the record',
        ],
      },
      {
        title: 'Vendor compliance',
        problem:
          'Vendor insurance certificates and W-9s expire quietly, and it is noticed when a repair is already scheduled.',
        build:
          'Keep vendor certificates and tax forms current, and flag the ones about to lapse before work is assigned.',
        impacts: [
          'No uninsured vendor on site',
          'Lapses caught before they matter',
          'Vendor file audit-ready',
        ],
      },
    ],
  },
  {
    slug: 'construction',
    systems: [
      'Project management platform',
      'Accounting and job cost',
      'Document control / plan room',
      'Subcontractor email',
      'E-signature',
      'Field capture apps',
    ],
    human:
      'Approvals on a draw or a change order stay with your project managers. The system tracks, assembles, and chases; a person approves, and any missing waiver or lapsed certificate is raised before it holds up a payment — not discovered after.',
    services: ['systems-integration', 'process-design-optimization', 'integrations-process-intelligence'],
    useCases: [
      {
        title: 'Lien waivers',
        problem:
          'Conditional and unconditional waivers are chased from every subcontractor each draw, and one missing signature holds the payment.',
        build:
          'Request the right waiver from each subcontractor per draw, track returns, and flag what is missing before the pay period closes.',
        impacts: [
          'Draws not held by missing paper',
          'Waiver status visible per sub',
          'Chasing handled without a coordinator',
        ],
      },
      {
        title: 'Pay applications',
        problem:
          'Each AIA G702/G703 application is assembled by hand with its supporting documentation, then followed through approval by email.',
        build:
          'Assemble the pay application with continuation sheets and backup attached, and track it through approval to payment.',
        impacts: [
          'Applications submitted on schedule',
          'Backup attached the first time',
          'Approval status visible to the team',
        ],
      },
      {
        title: 'Submittals and RFIs',
        problem:
          'Submittals and RFIs live in a log someone updates when they can, so overdue responses are found late.',
        build:
          'Log every submittal and RFI, track who owns the response, and surface the ones going overdue while they can still be fixed.',
        impacts: [
          'Overdue responses surfaced early',
          'Clear owner on every open item',
          'Schedule impact visible sooner',
        ],
      },
      {
        title: 'Subcontractor compliance',
        problem:
          'Certificates of insurance and licenses expire mid-project, and the lapse is discovered when a sub is already on site.',
        build:
          'Keep certificates and licenses current per subcontractor, and flag the ones about to lapse before the next scheduled work.',
        impacts: [
          'No lapsed certificate on site',
          'Compliance file audit-ready',
          'Renewals requested automatically',
        ],
      },
      {
        title: 'Change orders',
        problem:
          'Change orders start as a field conversation and reach paper days later, after the cost has already been incurred.',
        build:
          'Capture the change at the source, assemble the pricing and backup, and route it for owner approval with a status trail.',
        impacts: [
          'Changes priced before work proceeds',
          'Approval trail on every change',
          'Fewer disputed extras at closeout',
        ],
      },
      {
        title: 'Project closeout',
        problem:
          'Closeout means assembling as-builts, warranties, and O&M manuals from a year of email — usually months late.',
        build:
          'Collect closeout documents as the work completes, check the set against the contract, and assemble the closeout package.',
        impacts: [
          'Closeout package assembled as you build',
          'Retention released sooner',
          'Missing warranties found before handover',
        ],
      },
    ],
  },
  {
    slug: 'professional-services',
    systems: [
      'CRM and pipeline',
      'Proposal and e-signature tools',
      'Project management',
      'Time tracking and invoicing',
      'Email and shared drives',
      'Client portal',
    ],
    human:
      'Scope, pricing, and client judgment stay with your team. The documents assemble and route themselves; a person approves anything that commits the firm, and a stalled onboarding or an unusual time entry is surfaced rather than passed through silently.',
    services: [
      'managed-operations',
      'operational-intelligence',
      'integrations-process-intelligence',
    ],
    useCases: [
      {
        title: 'Proposals and statements of work',
        problem:
          'Every proposal is rebuilt from the closest previous one, so scope language drifts and the turnaround takes days.',
        build:
          'Generate the proposal and SOW from the deal record and your approved language, then track it through signature.',
        impacts: [
          'Proposals out within a day',
          'Scope language consistent',
          'Signature status visible without asking',
        ],
      },
      {
        title: 'Client onboarding',
        problem:
          'Kickoff waits on documents, access, and details that are requested one email at a time.',
        build:
          'Request everything a new engagement needs at once, track what has come back, and confirm the set is complete before kickoff.',
        impacts: [
          'Kickoff on the planned date',
          'Nothing requested twice',
          'Stalled onboardings escalated',
        ],
      },
      {
        title: 'Time capture and invoicing',
        problem:
          'Billing runs late because time entries are incomplete, and someone assembles invoices by hand each cycle.',
        build:
          'Assemble billable time into invoices on schedule, and flag the entries that need a person to confirm before they go out.',
        impacts: [
          'Invoices out on the billing date',
          'Fewer unbilled hours written off',
          'Questions raised before the client sees them',
        ],
      },
      {
        title: 'Status reporting',
        problem:
          'Weekly status is rebuilt by hand from where the work actually happens, and the report is stale by the time it lands.',
        build:
          'Pull status from the systems the work runs in, and assemble the client-ready report on your reporting day.',
        impacts: [
          'Reports out without a scramble',
          'Status drawn from the real source',
          'Slipping work visible earlier',
        ],
      },
      {
        title: 'RFPs and client questionnaires',
        problem:
          'Each RFP or security questionnaire is answered from scratch, pulling senior people off client work for days.',
        build:
          'Draft responses from your approved answer library and route only the new questions to the person who owns them.',
        impacts: [
          'First draft in hours',
          'Consistent answers across responses',
          'Senior time spent on the new questions only',
        ],
      },
    ],
  },
]

const bySlug = new Map(INDUSTRY_DETAIL.map((d) => [d.slug, d]))

export function getIndustryDetail(slug: string): IndustryDetail | undefined {
  return bySlug.get(slug)
}
