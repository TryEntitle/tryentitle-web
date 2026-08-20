/**
 * Insights shown on /blog — TryEntitle notes mixed with curated external reading.
 * External cards never invent publishers or URLs; they link out to real sources.
 */

export type InsightSource = { kind: 'tryentitle' } | { kind: 'external'; name: string; url: string }

export interface Insight {
  id: string
  title: string
  description: string
  publishedAt: string
  readingMinutes: number
  source: InsightSource
  /**
   * Cover image under /public/images. Every cover is authored at 1600×900; the
   * grid states those intrinsic dimensions, so a cover at another size will
   * still display but stops guarding against layout shift.
   */
  image: string
  imageAlt: string
  /** Trusted HTML rendered inside the reading modal. */
  bodyHtml: string
}

export const INSIGHTS: Insight[] = [
  {
    id: 'reduce-manual-data-entry',
    title: 'How to Reduce Manual Data Entry Without Cutting Staff',
    description:
      'Automation should move people off keyboards and into review — not off the payroll.',
    publishedAt: '2026-06-12',
    readingMinutes: 6,
    source: { kind: 'tryentitle' },
    image: '/images/reduce-manual-data-entry.png',
    imageAlt:
      'Chart panel: a jagged line falling from a red MANUAL marker to a green REVIEWED one, over stage bars for retype, validate, extract and approve across sixteen weeks.',
    bodyHtml: `
<p>Most “data entry problems” are not headcount problems. They are routing problems: the same fields get typed into three systems, nobody trusts the first pass, and the person who knows the exception is also the person stuck copying yesterday’s spreadsheet.</p>
<p>Start by naming the work that should stay human. Exceptions, judgment calls, and client-facing follow-up belong with people. Volume typing, rekeying, and status chasing do not.</p>
<h2>Map the copy chain</h2>
<p>List every place a fact is entered by hand after it already exists somewhere else — intake form, PDF, email, portal, spreadsheet, then the system of record. Each hop is a place automation can extract once and sync, with a person only when confidence drops.</p>
<h2>Keep capacity; change the job</h2>
<p>When keystrokes fall, hours should move to review queues, customer follow-up, and clearing the exceptions that used to sit in inboxes. That is how you cut manual entry without cutting staff: the team still owns the outcome; they stop owning the retype.</p>
<h2>Put a human gate where it matters</h2>
<p>Anything that touches money, identity, or regulated records should land in a review step before it writes. Automation that skips that step is not efficiency — it is risk deferred.</p>
<p>If you want a concrete next step, pick one document type with the highest rekey volume and design intake → extract → validate → human review → sync. Measure hours moved off the keyboard, not headcount removed.</p>
`,
  },
  {
    id: 'ai-vs-automation',
    title: 'AI vs. Automation: What Your Business Actually Needs',
    description:
      'AI guesses; automation executes. Most operational wins come from deciding which is which.',
    publishedAt: '2026-05-28',
    readingMinutes: 5,
    source: { kind: 'tryentitle' },
    image: '/images/ai-vs-automation.png',
    imageAlt:
      'Chart panel: a stepped RULES line and a jittery MODEL band climbing together, over tracks labelled deterministic executes and probabilistic predicts, from scope to steady state.',
    bodyHtml: `
<p>Teams often ask for “AI” when what they need is a reliable path from a document to a system of record. Those are different tools.</p>
<p><strong>Automation</strong> is rules, integrations, and repeatable steps: if this form is complete, create that record; if this field fails validation, stop and ask a person. It is boring on purpose.</p>
<p><strong>AI</strong> helps when the input is messy — handwriting, free-text emails, varying layouts — and you need a best-effort extraction or classification before a rule can run. It should propose; your process should dispose.</p>
<h2>A simple test</h2>
<ul>
<li>If the same input should always produce the same write, prefer automation and validation.</li>
<li>If the input varies and a person already “reads and decides,” AI can draft that read — then a human confirms.</li>
<li>If you cannot name the system that should receive the result, neither AI nor automation will save you yet.</li>
</ul>
<p>Most operations projects need both: AI (or OCR) on the messy edge, automation in the middle, and a named person on exceptions. Buying a chatbot for a filing problem usually means the workflow was never designed.</p>
`,
  },
  {
    id: 'ai-augmentation-hbr',
    title: 'Why Companies That Choose AI Augmentation Over Automation May Win in the Long Run',
    description:
      'An HBR take on whether AI should shrink headcount or grow what people can do — useful context beside our process work.',
    publishedAt: '2026-04-15',
    readingMinutes: 8,
    source: {
      kind: 'external',
      name: 'Harvard Business Review',
      url: 'https://hbr.org/2026/04/why-companies-that-choose-ai-augmentation-over-automation-may-win-in-the-long-run',
    },
    image: '/images/ai-augmentation-vs-automation.png',
    imageAlt:
      'Chart panel: a widening green AUGMENT band rising toward a dashed capacity ceiling above a thin red REPLACE band, tracked from year zero to year four.',
    bodyHtml: `
<p>Harvard Business Review frames a choice many operators feel on the ground: use AI mainly to cut labor, or use it to augment people so more work gets done well.</p>
<p>That distinction matches how we design workflows. Extraction and routing can remove keystrokes; review, exceptions, and client judgment stay with staff. Augmentation is not soft language for “do nothing” — it is a decision about where judgment lives.</p>
<p>We recommend the full article for the strategy framing. When you are ready to apply it to a specific document or intake path, that is the conversation we have on a scoping call.</p>
`,
  },
  {
    id: 'ten-processes-to-automate',
    title: '10 Processes Every Business Should Automate',
    description:
      'Not a shopping list of tools — ten places rework usually hides, and what “done” looks like for each.',
    publishedAt: '2026-04-02',
    readingMinutes: 7,
    source: { kind: 'tryentitle' },
    image: '/images/10-processes-to-automate.png',
    imageAlt:
      'Chart panel: ten coloured bars numbered 01 to 10, ranked from invoice intake at 92 per cent down to handoffs at 30 per cent.',
    bodyHtml: `
<p>Automate the paths that are high volume, low judgment, and already written down somewhere. Leave the ones that need a person with the person.</p>
<ol>
<li><strong>Inbound document intake</strong> — capture, classify, and route; do not leave PDFs in shared inboxes.</li>
<li><strong>Data extraction into the system of record</strong> — fields once, then sync; human review on low confidence.</li>
<li><strong>Status updates across tools</strong> — one truth, mirrored; stop dual entry between CRM and ops.</li>
<li><strong>Appointment / booking confirmations</strong> — confirm, remind, reschedule without a phone tag.</li>
<li><strong>Invoice and payment matching</strong> — match, flag exceptions, escalate mismatches.</li>
<li><strong>Employee or vendor onboarding packets</strong> — collect, check completeness, file.</li>
<li><strong>Compliance evidence filing</strong> — stamp, store, retrieve by audit trail — not by folder archaeology.</li>
<li><strong>Report assembly from known sources</strong> — pull, format, deliver on a schedule.</li>
<li><strong>Ticket triage for repetitive requests</strong> — route by type; humans take the novel ones.</li>
<li><strong>Follow-up sequences after a defined event</strong> — “document received / missing / approved” without manual chasing.</li>
</ol>
<p>If a process is not documented, automate the documentation first. Tools amplify the path you already have — including the broken one.</p>
`,
  },
  {
    id: 'healthcare-patient-intake',
    title: 'How Small Healthcare Practices Can Speed Up Patient Intake',
    description:
      'Front-desk time is lost to retyping. Intake gets faster when forms, extraction, and chart updates share one path.',
    publishedAt: '2026-03-18',
    readingMinutes: 6,
    source: { kind: 'tryentitle' },
    image: '/images/healthcare-patient-intake.png',
    imageAlt:
      'Chart panel: intake stages from arrival to roomed as paired bars under a falling line, marked minus fourteen minutes against a BEFORE baseline.',
    bodyHtml: `
<p>Small practices rarely need a hospital-scale platform. They need fewer times the same insurance card and demographics get typed between portal, clipboard, and EHR.</p>
<h2>Where minutes go</h2>
<p>Paper or PDF packets, incomplete forms discovered at check-in, and staff copying into the chart after the visit starts. Each gap creates a queue at the front desk and a delayed first appointment.</p>
<h2>A tighter intake path</h2>
<ul>
<li>Collect once — digital forms before arrival, with required fields enforced.</li>
<li>Extract insurance and demographics into a review queue, not straight into production without eyes.</li>
<li>Sync confirmed fields to the EHR; leave clinical narrative to clinicians.</li>
<li>Flag missing consents or cards before the patient walks in, not at the window.</li>
</ul>
<p>Speed comes from completing the packet earlier and removing rekey — not from rushing the clinical conversation. Start with one visit type (new patient, for example) and measure check-in duration and incomplete-chart rate before expanding.</p>
`,
  },
  {
    id: 'roi-on-ai-hbr',
    title: 'What’s the ROI on AI?',
    description:
      'HBR’s executive framing on why AI spend is hard to score — and why workflow design matters before the model does.',
    publishedAt: '2026-02-06',
    readingMinutes: 5,
    source: {
      kind: 'external',
      name: 'Harvard Business Review',
      url: 'https://hbr.org/2026/02/whats-the-roi-on-ai',
    },
    image: '/images/whats-the-roi-on-ai.png',
    imageAlt:
      'Chart panel: returns scattered against model spend inside a widening band marked WIDE VARIANCE, over tracks for licences, integration and workflow redesign.',
    bodyHtml: `
<p>Executives keep asking for AI ROI while still measuring vanity metrics — pilots launched, tools licensed — instead of hours removed from a named workflow or errors avoided on a named write.</p>
<p>This HBR Executive Agenda piece is a useful external pulse on that gap. Our practical stance is narrower: define the process, the baseline hours, and the human review gate before you score the model.</p>
<p>Read the article for the leadership context, then pair it with a concrete operations baseline if you want a number you can defend.</p>
`,
  },
  {
    id: 'measure-roi-operations',
    title: 'How to Measure ROI on an Operations Project',
    description:
      'ROI is hours moved, errors avoided, and cycle time cut — not a slide about “digital transformation.”',
    publishedAt: '2026-01-22',
    readingMinutes: 6,
    source: { kind: 'tryentitle' },
    image: '/images/measure-roi-operations-project.png',
    imageAlt:
      'Chart panel: a cost curve crossing a dashed line at a marked break-even point and rising into hours moved and errors cut, from month zero to month twelve.',
    bodyHtml: `
<p>Operations ROI fails when the baseline is vibes. Pick one workflow, measure it before you change it, then measure the same thing after.</p>
<h2>What to count</h2>
<ul>
<li><strong>Hours</strong> — time spent on the steps you intend to remove or shrink (rekey, chase, assemble).</li>
<li><strong>Cycle time</strong> — request in to filed / paid / scheduled.</li>
<li><strong>Error and rework rate</strong> — wrong fields, bounced submissions, redo loops.</li>
<li><strong>Cost of the change</strong> — build, integration, training, and ongoing review capacity.</li>
</ul>
<h2>A workable formula</h2>
<p>Annual value ≈ (hours saved × fully loaded hourly cost) + (rework avoided × cost per incident) − (run cost of the new path). Soft benefits (morale, capacity for growth) can be listed — just do not pretend they are the same as cash until you have a proxy.</p>
<h2>What not to do</h2>
<p>Do not claim ROI from headcount cuts you have not made, or from AI accuracy scores that never touched the system of record. If the write still requires the same three people and the same three systems, you have a demo, not a return.</p>
<p>On a scoping call we usually start with one document type and a two-week time sample. That is enough to know whether a project is worth designing.</p>
`,
  },
]

/** Newest first — same order the Insights grid renders. */
export const insightsNewestFirst = [...INSIGHTS].sort(
  (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
)
